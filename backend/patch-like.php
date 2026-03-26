<?php
$content = file_get_contents('backend/src/Controller/PostController.php');

$likeMethod = <<<'PHP'

    #[Route('/api/posts/{id}/like', name: 'api_posts_like', methods: ['POST'])]
    public function like(int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Veuillez vous connecter'], 401);
        }

        $post = $em->getRepository(Post::class)->find($id);

        if (!$post) {
            return $this->json(['error' => 'Tweet non trouvé'], 404);
        }

        if ($post->getLikers()->contains($user)) {
            $post->removeLiker($user);
            $isLiked = false;
        } else {
            $post->addLiker($user);
            $isLiked = true;
        }

        $em->flush();

        return $this->json([
            'isLiked' => $isLiked,
            'likesCount' => $post->getLikers()->count(),
        ]);
    }
}
PHP;

$content = preg_replace('/}\s*$/', $likeMethod, $content);
file_put_contents('backend/src/Controller/PostController.php', $content);
echo "Patched like method\n";
