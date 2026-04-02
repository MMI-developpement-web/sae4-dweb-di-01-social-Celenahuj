import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

// L'image par défaut (si l'utilisateur n'a pas mis de photo)
import imageParDefaut from "../../assets/profil.jpg";

// ===============================================
// CONFIGURATION DU DESIGN (Tailwind + CVA)
// ===============================================
const AvatarVariants = cva(
  "inline-block object-cover",
  {
    variants: {
      size: {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16",
        xl: "w-24 h-24",
        xxl: "w-full h-full",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-md",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "circle",
    },
  }
);

// ===============================================
// INTERFACES (Séparation stricte Données / Design)
// ===============================================

// 1. Le Modèle (Les données pures)
interface AvatarData {
  src?: string | null; 
  alt?: string;       
}

// 2. La Vue (Le design / style)
interface AvatarStyle extends VariantProps<typeof AvatarVariants> {}

// On rassemble les deux pour le composant
export default function Avatar({ src, alt, size, shape, className, ...props }: AvatarData & AvatarStyle & Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">) {

    let texteAlternatif = alt;
    if (texteAlternatif === undefined) {
        texteAlternatif = "Photo de profil";
    }

    const URL_SERVEUR = import.meta.env.VITE_API_URL.replace('/api', '');

    // Fonction utilitaire pour formater le bon lien de l'image
    function determinerLaSourceImage(valeurImage: string | null | undefined): string {
        
        // Cas 1 : Aucune image fournie
        if (!valeurImage) {
            return imageParDefaut;
        }
        
        // Cas 2 : Lien valide (http, encodé, ou absolu)
        if (valeurImage.startsWith("http") || valeurImage.startsWith("data:") || valeurImage.startsWith("blob:") || valeurImage.startsWith("/")) {
            return valeurImage;
        }

        // Cas 3 : Fichier backend Symfony (ex: "65a6f8b9e1234.jpg")
        // Regex : 13 caractères hexadécimaux suivis d'une extension
        const ressembleAFichierSymfony = /^[a-f0-9]{13}\.[a-zA-Z]{3,4}$/i.test(valeurImage);
        if (ressembleAFichierSymfony) {
             return `${URL_SERVEUR}/uploads/${valeurImage}`;
        }

        // Cas 4 : Image locale dans `assets`
        try {
            return new URL(`../../assets/${valeurImage}`, import.meta.url).href;
        } catch {
            return imageParDefaut; // Sécurité anti-crash
        }
    }

    // On exécute notre mini-contrôleur
    const imageAffichee = determinerLaSourceImage(src);

    // ===============================================
    // VUE (L'Affichage Final)
    // ===============================================

    return (
        <img 
            src={imageAffichee} 
            alt={texteAlternatif} 
            className={cn(AvatarVariants({ size, shape }), className)} 
            {...props}
        />
    );
}
