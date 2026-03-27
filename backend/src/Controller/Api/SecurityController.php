<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Service\TokenService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class SecurityController extends AbstractController
{
    /**
     * Cette route est interceptée par le "json_login" configuré dans security.yaml.
     * Si les identifiants fournis (email/password) sont valides, Symfony appelle cette méthode
     * et injecte l'utilisateur authentifié via #[CurrentUser].
     */
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(#[CurrentUser] ?User $user, TokenService $tokenService): JsonResponse
    {
        // Sécurité supplémentaire au cas où
        if (null === $user) {
            return $this->json(['message' => 'Non autorisé.'], 401);
        }

        // Le service génère le token en clair, mais l'enregistre haché
        $token = $tokenService->createAndSaveToken($user);

        return $this->json([
            'id' => $user->getId(),
            'user'  => $user->getUserIdentifier(), 'username' => $user->getUsername(),
            'avatar' => $user->getAvatar(), // On renvoie l'avatar dès la connexion
            'roles' => $user->getRoles(), // Ajout des rôles pour le frontend
            'token' => $token, // Token renvoyé EN CLAIR au Front React
        ]);
    }
}
