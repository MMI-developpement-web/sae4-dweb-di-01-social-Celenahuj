<?php

namespace App\Service;

use App\Entity\AccessToken;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class TokenService
{
    public function __construct(private EntityManagerInterface $em) {}

    public function createAndSaveToken(User $user): string
    {
        // 1. Chercher et supprimer l'ancien token de l'utilisateur s'il existe
        $oldToken = $this->em->getRepository(AccessToken::class)->findOneBy(['user' => $user]);
        if ($oldToken) {
            $this->em->remove($oldToken);
            $this->em->flush();
        }

        // 2. Générer un token aléatoire sécurisé (32 octets = 64 caractères hexa)
        $plainToken = bin2hex(random_bytes(32));

        // 3. Créer le nouveau token en base, mais ne sauvegarder que sa version hachée
        $accessToken = new AccessToken();
        $accessToken->setUser($user);
        $accessToken->setToken(hash('sha256', $plainToken));
        
        // 4. Définir une date d'expiration (par exemple +1 semaine)
        $accessToken->setExpiresAt((new \DateTimeImmutable())->modify('+1 week'));

        $this->em->persist($accessToken);
        $this->em->flush();

        // On retourne la version en clair (non hachée) pour qu'elle soit envoyée au front
        return $plainToken;
    }
}
