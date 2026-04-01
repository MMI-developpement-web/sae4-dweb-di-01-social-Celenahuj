<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class RegistrationController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request, 
        UserPasswordHasherInterface $passwordHasher, 
        EntityManagerInterface $entityManager,
        UserRepository $userRepository
    ): JsonResponse {
        // 1. Récupérer et décoder le JSON envoyé par React
        $data = json_decode($request->getContent(), true);

        // Validation basique des données
        if (empty($data['email']) || empty($data['password']) || empty($data['name'])) {
            return new JsonResponse(['error' => 'Données incomplètes.'], 400);
        }

        // Validation de sécurité du mot de passe
        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/', $data['password'])) {
            return new JsonResponse(['error' => 'Le mot de passe ne respecte pas les règles de sécurité.'], 400);
        }

        $existingUserByEmail = $userRepository->findOneBy(['email' => $data['email']]);
        $existingUserByName = $userRepository->findOneBy(['username' => $data['name']]);

        if ($existingUserByEmail || $existingUserByName) {
            return $this->json([
                'error' => 'Les informations saisies ne sont pas disponibles. Veuillez les modifier.'
        ], 400);
    }

        // 2. Créer une nouvelle entité User
        $user = new User();
        
        $user->setUsername($data['name']); 
        $user->setEmail($data['email']);
        $user->setIsBlocked(false);

        try {
            // 3. Hasher le mot de passe
            $hashedPassword = $passwordHasher->hashPassword(
                $user,
                $data['password']
            );
            $user->setPassword($hashedPassword);

            
            // 4. Sauvegarder en base de données avec Doctrine
            $entityManager->persist($user);
            $entityManager->flush();

            // 5. Renvoyer une réponse de succès
            return new JsonResponse(['message' => 'Utilisateur enregistré avec succès.'], 201);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Erreur lors de l\'enregistrement : ' . $e->getMessage()], 500);
        }
    }
}