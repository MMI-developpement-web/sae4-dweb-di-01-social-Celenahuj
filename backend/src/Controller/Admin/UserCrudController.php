<?php

namespace App\Controller\Admin;

use App\Entity\User;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextEditorField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\EmailField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
class UserCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return User::class;
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id')->hideOnForm(), // On voit l'ID dans la liste mais pas dans le formulaire
            
            TextField::new('username', 'Nom d\'utilisateur'),
            
            EmailField::new('email', 'Adresse Email'),
            
            ChoiceField::new('roles', 'Rôles')
                ->setChoices([
                    'Utilisateur' => 'ROLE_USER',
                    'Administrateur' => 'ROLE_ADMIN',
                ])
                ->allowMultipleChoices() // Très important car roles est un array
                ->renderExpanded()       // Optionnel : affiche des cases à cocher au lieu d'un menu déroulant
                ->renderAsBadges(),

            TextField::new('lieu', 'Localisation'),

            TextField::new('lien', 'Lien site web'),

            // Pour la bio, on utilise TextEditorField pour avoir un petit éditeur de texte
            TextEditorField::new('content', 'Biographie'),

            // Si tu as un champ avatar (URL de l'image)
            TextField::new('avatar', 'Lien de l\'avatar'),

            BooleanField::new('isBlocked', 'Compte Bloqué')
            ->renderAsSwitch(true) // C'est l'interrupteur visuel
            ->setHelp('Si activé, l\'utilisateur ne pourra plus poster de tweets.'),
        ];
    }
}