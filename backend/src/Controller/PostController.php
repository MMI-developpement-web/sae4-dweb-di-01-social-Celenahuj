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
        // 1. Vérification de l'utilisateur
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Veuillez vous connecter'], 401);
        }

        // 2. Gestion de la Pagination (pour l'infinite scroll)
        // On récupère le paramètre ?page=X dans l'URL (par défaut 1)
        $page = $request->query->getInt('page', 1);
        $limit = 10; // On envoie 10 posts par chargement
        $offset = ($page - 1) * $limit; // Calcul du saut

        // 3. Récupération des IDs (Moi + mes abonnements)
        $followedIds = [];
        foreach ($user->getFollowing() as $followedUser) {
            $followedIds[] = $followedUser->getId();
        }
        $followedIds[] = $user->getId();

        // 4. Requête filtrée avec Limite et Offset
        $posts = $em->getRepository(Post::class)->findBy(
            ['author' => $followedIds], 
            ['date' => 'DESC'],
            $limit,  // Max 10 résultats
            $offset  // Point de départ
        );

        $data = [];
        foreach ($posts as $post) {
            $data[] = [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'date' => $post->getDate()->format('c'),
                'author' => [
                    'username' => $post->getAuthor()->getUsername(), 
                ]
            ];
        }

        return $this->json($data);
    }
}