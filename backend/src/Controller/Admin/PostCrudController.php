<?php

namespace App\Controller\Admin;

use App\Entity\Post;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;

class PostCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Post::class;
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id')->hideOnForm(),
            
            // Affiche l'auteur (relation ManyToOne vers User)
            AssociationField::new('author', 'Auteur')
                ->onlyOnIndex(),
            
            // Le texte original pour la modération
            TextField::new('content', 'Contenu du tweet'),

            // Le bouton switch pour l'US 7.4
            BooleanField::new('isCensored', 'Censuré')
                ->renderAsSwitch(true)
                ->setHelp('Activez ceci pour remplacer le tweet par le message de modération.'),

            DateTimeField::new('date', 'Date de publication')
                ->hideOnForm(),
        ];
    }
}