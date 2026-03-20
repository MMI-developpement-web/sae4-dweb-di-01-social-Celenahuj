<?php

namespace App\Controller\Admin;

use App\Entity\User;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextEditorField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\EmailField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ArrayField;

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
            
            // On affiche les rôles (ex: ROLE_ADMIN, ROLE_USER)
            ArrayField::new('roles', 'Rôles'),

            TextField::new('lieu', 'Localisation'),

            TextField::new('lien', 'Lien site web'),

            // Pour la bio, on utilise TextEditorField pour avoir un petit éditeur de texte
            TextEditorField::new('content', 'Biographie'),

            // Si tu as un champ avatar (URL de l'image)
            TextField::new('avatar', 'Lien de l\'avatar'),
        ];
    }
}