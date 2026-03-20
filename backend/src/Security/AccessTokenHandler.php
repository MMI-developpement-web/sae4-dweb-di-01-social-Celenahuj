<?php

namespace App\Security;

use App\Entity\AccessToken;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Http\AccessToken\AccessTokenHandlerInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;

class AccessTokenHandler implements AccessTokenHandlerInterface
{
    public function __construct(
        private EntityManagerInterface $em
    ) {}

    /**
     * Méthode appelée automatiquement par le composant 'access_token' du security.yaml.
     * Le token en clair contenu dans le header HTTP (Authorization: Bearer <token>) est passé ici.
     */
    public function getUserBadgeFrom(string $accessToken): UserBadge
    {
        // 1. On re-hache le token clair de la requête en sha256
        $hashedToken = hash('sha256', $accessToken);

        // 2. On cherche dans la BDD s'il y a un AccessToken correspond au hash
        $tokenEntity = $this->em->getRepository(AccessToken::class)->findOneBy(['token' => $hashedToken]);

        // Si le token n'existe pas en BDD
        if (null === $tokenEntity) {
            throw new BadCredentialsException('Token invalide.');
        }

        // Si la date actuelle a dépassé la date d'expiration
        if ($tokenEntity->getExpiresAt() < new \DateTimeImmutable()) {
            // Optionnel : on peut supprimer le token expiré de la BDD ici
            throw new BadCredentialsException('Token expiré.');
        }

        // 3. Tout est OK, on retourne un UserBadge avec l'identifiant (téléphone, e-mail...)
        // L'UserBadge fera le lien avec l'entité User pour vérifier qu'il existe !
        return new UserBadge($tokenEntity->getUser()->getUserIdentifier());
    }
}
