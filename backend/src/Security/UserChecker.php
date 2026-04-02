<?php

namespace App\Security;

use App\Entity\User as AppUser;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAccountStatusException;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class UserChecker implements UserCheckerInterface
{
    public function checkPreAuth(UserInterface $user): void
    {
        if (!$user instanceof AppUser) {
            return; // on ignore si ce n'est pas notre entité User
        }

        if ($user->isBlocked()) {
            throw new CustomUserMessageAccountStatusException('Ce compte a été bloqué pour non respect des conditions d’utilisation.');
        }
    }

    public function checkPostAuth(UserInterface $user): void
    {
     
    }
}
