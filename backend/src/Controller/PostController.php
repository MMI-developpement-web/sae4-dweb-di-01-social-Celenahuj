<?php

namespace App\Controller;

use App\Entity\Post;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use App\Entity\Block;
use App\Repository\BlockRepository;
use App\Repository\FollowerRepository;
use App\Entity\User;

class PostController extends AbstractController
    {

    #[Route('/api/posts/{id}', name: 'api_posts_update', methods: ['POST'])]
    public function update(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Veuillez vous connecter'], 401);
        }

        $post = $em->getRepository(Post::class)->find($id);

        if (!$post) {
            return $this->json(['error' => 'Tweet non trouvé'], 404);
        }

        if ($post->isCensored()) {
            return $this->json(['error' => 'Action impossible sur un contenu censuré'], 403);
        }

        if ($post->getAuthor() !== $user) {
            return $this->json(['error' => 'Vous n\'avez pas l\'autorisation de modifier ce tweet'], 403);
        }

        $content = $request->request->get('content', '');
        $file = $request->files->get('file');
        $removeMedia = $request->request->get('removeExistingMedia') === 'true';

        $hasMediaAfterUpdate = $file || ($post->getMedia() && !$removeMedia);

        if (empty(trim($content)) && !$hasMediaAfterUpdate) {
            return $this->json(['error' => 'Le tweet ne peut pas être vide'], 400);
        }

        $post->setContent($content);

        if ($removeMedia) {
            $post->setMedia(null);
        }

        if ($file) {
            $fileName = uniqid() . '.' . $file->guessExtension();
            $file->move(
                $this->getParameter('kernel.project_dir') . '/public/uploads',
                $fileName
            );
            $post->setMedia($fileName); 
        }

        $em->flush();

        return $this->json([
            'message' => 'Tweet modifié avec succès !',
            'media' => $post->getMedia()
        ], 200);
    }

    #[Route('/api/posts/{id}', name: 'api_posts_delete', methods: ['DELETE'])]
    public function delete(int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Veuillez vous connecter'], 401);
        }

        $post = $em->getRepository(Post::class)->find($id);

        if (!$post) {
            return $this->json(['error' => 'Tweet non trouvé'], 404);
        }

        if ($post->getAuthor() !== $user) {
            return $this->json(['error' => 'Vous n\'avez pas l\'autorisation de supprimer ce tweet'], 403);
        }

        $em->remove($post);
        $em->flush();

        return $this->json(['message' => 'Tweet supprimé avec succès']);
    }

    #[Route('/api/profil/update', name: 'api_profil_update', methods: ['POST'])]
    public function updateProfile(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Non autorisé'], 401);
        }

        // On peut recevoir soit du JSON (si pas d'image), soit un FormData (s'il y a une image)
        $contentType = $request->headers->get('Content-Type') ?? '';
        
        if (str_contains($contentType, 'application/json')) {
            $data = json_decode($request->getContent(), true);
            $name = $data['name'] ?? null;
            $content = $data['content'] ?? null;
            $lieu = $data['lieu'] ?? null;
            $lien = $data['lien'] ?? null;
        } else {
            $name = $request->request->get('name');
            $content = $request->request->get('content');
            $lieu = $request->request->get('lieu');
            $lien = $request->request->get('lien');
            
            $file = $request->files->get('avatar');
            if ($file) {
                // Sauvegarde de l'avatar
                $fileName = uniqid() . '.' . $file->guessExtension();
                $file->move(
                    $this->getParameter('kernel.project_dir') . '/public/uploads',
                    $fileName
                );
                // Le front va lire le nom du fichier en concaténant avec le BACKEND_URL
                // L'entité 'avatar' enregistre souvent un URL ou juste le nom du fichier. 
                // Je stocke le nom du fichier et l'URL complète sera gérée soit par le front soit backend.
                $user->setAvatar($fileName);
            }
        }

        // Mise à jour des champs
        if ($name !== null) {
            $user->setUsername($name);
        }
        if ($content !== null) {
            $user->setContent($content);
        }
        if ($lieu !== null) {
            $user->setLieu($lieu);
        }
        if ($lien !== null) {
            $user->setLien($lien);
        }

        $em->flush();

        return $this->json([
            'message' => 'Profil mis à jour avec succès',
            'user' => [
                'name' => $user->getUsername(),
                'avatar' => $user->getAvatar()
            ]
        ]);
    }

    #[Route('/api/posts/{id}/comments', name: 'app_post_comments', methods: ['GET'])]
    public function getComments(Post $post, EntityManagerInterface $em): JsonResponse
    {
        // Bloquer la lecture des commentaires si le post est censuré
        if ($post->isCensored()) {
            return $this->json([], 200); // Retourne un tableau vide
        }

        $user = $this->getUser();
        $comments = $post->getComments(); 

        $data = [];
        foreach ($comments as $comment) {
            $author = $comment->getAuthor();
            $data[] = [
                'id' => $comment->getId(),
                'content' => $comment->isCensored() ? 'Ce message enfreint les conditions d’utilisation de la plateforme' : $comment->getContent(),
                'date' => $comment->getDate()->format('c'),
                'media' => $comment->isCensored() ? null : $comment->getMedia(),
                'isLiked' => $comment->isCensored() ? false : ($user ? $comment->getLikers()->contains($user) : false),
                'likesCount' => $comment->isCensored() ? 0 : $comment->getLikers()->count(),
                'author' => [
                    'id' => $author->getId(),
                    'username' => $author->getUsername(),
                    'avatar' => $author->getAvatar(),
                ]
            ];
        }

        return $this->json($data);
    }

    #[Route('/api/posts', name: 'api_posts_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, BlockRepository $blockRepo): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) return $this->json(['error' => 'Veuillez vous connecter'], 401);

        $content = $request->request->get('content', '');
        $file = $request->files->get('file');
        $parentId = $request->request->get('parentId');

        // --- CRITÈRE : Empêcher la réponse si on est bloqué par l'auteur du tweet parent ---
        if ($parentId) {
            $parentPost = $em->getRepository(Post::class)->find($parentId);
            if ($parentPost) {
                if ($parentPost->isCensored()) {
                    return $this->json(['error' => 'Impossible de répondre à un contenu censuré'], 403);
                }

                $block = $blockRepo->findOneBy(['blocker' => $parentPost->getAuthor(), 'blocked' => $user]);
                if ($block) return $this->json(['error' => 'Vous ne pouvez pas répondre à cet utilisateur'], 403);
            }
        }

        if (empty($content) && !$file) return $this->json(['error' => 'Le tweet ne peut pas être vide'], 400);

        $post = new Post();
        $post->setContent($content);
        $post->setAuthor($user);
        $post->setDate(new \DateTimeImmutable());

        if (isset($parentPost)) $post->setParent($parentPost);

        if ($file) {
            $fileName = uniqid() . '.' . $file->guessExtension();
            $file->move($this->getParameter('kernel.project_dir') . '/public/uploads', $fileName);
            $post->setMedia($fileName); 
        }

        $em->persist($post);
        $em->flush();

        return $this->json(['message' => 'Tweet publié !', 'media' => $post->getMedia()], 201);
    }

    #[Route('/api/posts', name: 'api_posts_list', methods: ['GET'])]
    public function list(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) return $this->json(['error' => 'Veuillez vous connecter'], 401);

        $page = $request->query->getInt('page', 1);
        $limit = 10;
        $offset = ($page - 1) * $limit;

        $posts = $em->getRepository(Post::class)->findBy(['parent' => null], ['date' => 'DESC'], $limit, $offset);

        $data = [];
        foreach ($posts as $post) {
            $data[] = [
                'id' => $post->getId(),
                'content' => $post->isCensored() ? 'Ce message enfreint les conditions d’utilisation de la plateforme' : $post->getContent(),
                'date' => $post->getDate()->format('c'),
                'media' => $post->isCensored() ? null : $post->getMedia(),
                'isLiked' => $post->isCensored() ? false : $post->getLikers()->contains($user),
                'likesCount' => $post->isCensored() ? 0 : $post->getLikers()->count(),
                'commentsCount' => $post->isCensored() ? 0 : $post->getComments()->count(),
                'author' => [
                    'id' => $post->getAuthor()->getId(),
                    'username' => $post->getAuthor()->getUsername(),
                    'avatar' => $post->getAuthor()->getAvatar(),
                    'isFollowing' => $user->getFollowing()->contains($post->getAuthor()),
                ]
            ];
        }
        return $this->json($data);
    }

    #[Route('/api/posts/user/{id}', name: 'api_posts_user', methods: ['GET'])]
    public function listUserPosts(int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $posts = $em->getRepository(Post::class)->findBy(['author' => $id, 'parent' => null], ['date' => 'DESC']);

        $data = [];
        foreach ($posts as $post) {
            $author = $post->getAuthor();
            $data[] = [
                'id' => $post->getId(),
                'content' => $post->isCensored() ? 'Ce message enfreint les conditions d’utilisation de la plateforme' : $post->getContent(),
                'date' => $post->getDate()->format('c'),
                'media' => $post->isCensored() ? null : $post->getMedia(),
                'isLiked' => $post->isCensored() ? false : ($user ? $post->getLikers()->contains($user) : false),
                'likesCount' => $post->isCensored() ? 0 : $post->getLikers()->count(),
                'commentsCount' => $post->isCensored() ? 0 : $post->getComments()->count(),
                'author' => [
                    'id' => $author->getId(),
                    'username' => $author->getUsername(),
                    'avatar' => $author->getAvatar(),
                    'isFollowing' => $user ? $user->getFollowing()->contains($author) : false,
                ]
            ];
        }
        return $this->json($data);
    }

    #[Route('/api/profil/{id?}', name: 'api_profil', methods: ['GET'])]
    public function getProfile(?int $id, EntityManagerInterface $em, BlockRepository $blockRepo): JsonResponse
    {
        $user = $this->getUser(); 
        if (!$user) return $this->json(['error' => 'Veuillez vous connecter'], 401);

        $targetUser = ($id !== null) ? $em->getRepository(User::class)->find($id) : $user;
        if (!$targetUser) return $this->json(['error' => 'Utilisateur non trouvé'], 404);

        $isBlockedByUser = false;
        if ($targetUser !== $user) {
            $block = $blockRepo->findOneBy(['blocker' => $user, 'blocked' => $targetUser]);
            $isBlockedByUser = ($block !== null);
        }

        return $this->json([
            'id' => $targetUser->getId(),
            'name' => $targetUser->getUsername(),
            'avatar' => $targetUser->getAvatar(),
            'content' => $targetUser->getContent(),
            'lieu' => $targetUser->getLieu(),
            'lien' => $targetUser->getLien(),
            'isFollowing' => $user->getFollowing()->contains($targetUser),
            'isBlockedByUser' => $isBlockedByUser 
        ]);
    }

    #[Route('/api/user/{id}/block', name: 'api_user_block', methods: ['POST'])]
    public function toggleBlock(User $userToBlock, EntityManagerInterface $em, BlockRepository $blockRepo): JsonResponse
    {
        $currentUser = $this->getUser(); 
        if (!$currentUser) return $this->json(['error' => 'Non autorisé'], 401);
        if ($currentUser === $userToBlock) return $this->json(['error' => 'Impossible'], 400);

        $existingBlock = $blockRepo->findOneBy(['blocker' => $currentUser, 'blocked' => $userToBlock]);

        if ($existingBlock) {
            $em->remove($existingBlock);
            $em->flush();
            return $this->json(['message' => 'Débloqué', 'isBlocked' => false]);
        }

        $block = new Block();
        $block->setBlocker($currentUser);
        $block->setBlocked($userToBlock);
        $em->persist($block);

        // CRITÈRE US : Désabonnement automatique
        $currentUser->removeFollowing($userToBlock);
        $userToBlock->removeFollowing($currentUser);

        $em->flush();
        return $this->json(['message' => 'Bloqué', 'isBlocked' => true]);
    }

    #[Route('/api/posts/{id}/like', name: 'api_posts_like', methods: ['POST'])]
    public function like(int $id, EntityManagerInterface $em, BlockRepository $blockRepo): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) return $this->json(['error' => 'Veuillez vous connecter'], 401);

        $post = $em->getRepository(Post::class)->find($id);
        if (!$post) return $this->json(['error' => 'Tweet non trouvé'], 404);

        if ($post->isCensored()) {
            return $this->json(['error' => 'Action impossible sur un contenu censuré'], 403);
        }

        // CRITÈRE US : Un utilisateur bloqué ne peut pas liker
        $isBlocked = $blockRepo->findOneBy(['blocker' => $post->getAuthor(), 'blocked' => $user]);
        if ($isBlocked) return $this->json(['error' => 'Vous êtes bloqué par cet auteur'], 403);

        if ($post->getLikers()->contains($user)) {
            $post->removeLiker($user);
            $isLiked = false;
        } else {
            $post->addLiker($user);
            $isLiked = true;
        }

        $em->flush();
        return $this->json(['isLiked' => $isLiked, 'likesCount' => $post->getLikers()->count()]);
    }

    #[Route('/api/user/{id}/follow', name: 'api_user_follow', methods: ['POST'])]
    public function follow(int $id, EntityManagerInterface $em, BlockRepository $blockRepo): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) return $this->json(['error' => 'Veuillez vous connecter'], 401);

        $targetUser = $em->getRepository(User::class)->find($id);
        if (!$targetUser) return $this->json(['error' => 'Utilisateur non trouvé'], 404);

        // CRITÈRE US : On ne peut pas suivre quelqu'un qui nous a bloqué (ou l'inverse)
        $block1 = $blockRepo->findOneBy(['blocker' => $targetUser, 'blocked' => $user]);
        $block2 = $blockRepo->findOneBy(['blocker' => $user, 'blocked' => $targetUser]);
        if ($block1 || $block2) return $this->json(['error' => 'Action impossible (blocage)'], 403);

        if ($user->getFollowing()->contains($targetUser)) {
            $user->removeFollowing($targetUser);
            $isFollowing = false;
        } else {
            $user->addFollowing($targetUser);
            $isFollowing = true;
        }

        $em->flush();
        return $this->json(['isFollowing' => $isFollowing]);
    }

    #[Route('/api/me/blocks', name: 'api_my_blocks', methods: ['GET'])]
    public function listMyBlocks(BlockRepository $blockRepo): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) return $this->json(['error' => 'Non autorisé'], 401);

        $blocks = $blockRepo->findBy(['blocker' => $user]);
        $data = array_map(fn($b) => [
            'id' => $b->getBlocked()->getId(),
            'username' => $b->getBlocked()->getUsername(),
            'avatar' => $b->getBlocked()->getAvatar(),
        ], $blocks);

        return $this->json($data);
    }
}
