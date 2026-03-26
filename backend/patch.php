<?php
$content = <<<'PHP'
<?php

namespace App\Controller;

use App\Entity\Post;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class PostController extends AbstractController
{
    #[Route('/api/posts', name: 'api_posts_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Veuillez vous connecter'], 401);
        }

        $data = json_decode($request->getContent(), true);
        $content = $data['content'] ?? '';

        if (empty($content) || mb_strlen($content) > 280) {
            return $this->json(['error' => 'Contenu invalide (max 280 caractères)'], 400);
        }

        $post = new Post();
        $post->setContent($content);
        $post->setAuthor($user);

        $em->persist($post);
        $em->flush();

        return $this->json([
            'message' => 'Tweet publié !',
            'id' => $post->getId(),
            'content' => $post->getContent()
        ], 201);
    }

    #[Route('/api/posts', name: 'api_posts_list', methods: ['GET'])]
    public function list(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Veuillez vous connecter'], 401);
        }

        $page = $request->query->getInt('page', 1);
        $limit = 10;
        $offset = ($page - 1) * $limit;

        $posts = $em->getRepository(Post::class)->findBy(
            [], 
            ['date' => 'DESC'],
            $limit,
            $offset
        );

        $data = [];
        foreach ($posts as $post) {
            $data[] = [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'date' => $post->getDate()->format('c'),
                'isLiked' => $post->getLikers()->contains($user),
                'likesCount' => $post->getLikers()->count(),
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
        
        $posts = $em->getRepository(Post::class)->findBy(
            ['author' => $id], 
            ['date' => 'DESC']
        );

        $data = [];
        foreach ($posts as $post) {
            $author = $post->getAuthor();
            $data[] = [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'date' => $post->getDate()->format('c'),
                'isLiked' => $user ? $post->getLikers()->contains($user) : false,
                'likesCount' => $post->getLikers()->count(),
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
    public function getProfile(?int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser(); 
        if (!$user) {
            return $this->json(['error' => 'Veuillez vous connecter'], 401);
        }

        $targetUser = $user;
        if ($id !== null) {
            $targetUser = $em->getRepository(\App\Entity\User::class)->find($id);
            if (!$targetUser) {
                return $this->json(['error' => 'Utilisateur non trouvé'], 404);
            }
        }

        return $this->json([
            'id' => $targetUser->getId(),
            'name' => $targetUser->getUsername(),
            'avatar' => $targetUser->getAvatar(),
            'content' => $targetUser->getContent(),
            'lieu' => $targetUser->getLieu(),
            'lien' => $targetUser->getLien(),
            'isFollowing' => $user->getFollowing()->contains($targetUser)
        ]);
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
}
PHP;

file_put_contents('backend/src/Controller/PostController.php', $content);
echo "Patched\n";
