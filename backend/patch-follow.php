<?php
$content = file_get_contents('backend/src/Controller/PostController.php');

$followMethod = <<<'PHP'

    #[Route('/api/user/{id}/follow', name: 'api_user_follow', methods: ['POST'])]
    public function follow(int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Veuillez vous connecter'], 401);
        }

        $targetUser = $em->getRepository(\App\Entity\User::class)->find($id);

        if (!$targetUser) {
            return $this->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        if ($user === $targetUser) {
            return $this->json(['error' => 'Vous ne pouvez pas vous suivre vous-même'], 400);
        }

        if ($user->getFollowing()->contains($targetUser)) {
            $user->removeFollowing($targetUser);
            $isFollowing = false;
        } else {
            $user->addFollowing($targetUser);
            $isFollowing = true;
        }

        $em->flush();

        return $this->json([
            'isFollowing' => $isFollowing,
        ]);
    }
}
PHP;

$content = preg_replace('/}\s*$/', $followMethod, $content);
file_put_contents('backend/src/Controller/PostController.php', $content);
echo "Patched follow method\n";
