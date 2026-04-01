import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import defaultProfil from "../../assets/profil.jpg";

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

interface AvatarProps extends VariantProps<typeof AvatarVariants> {
  src?: string | null;
  alt?: string;
}

export default function Avatar({ src, alt = "Avatar", size, shape, ...props }: AvatarProps) {
    const getFinalSrc = (avatarValue: string | null | undefined) => {
        if (!avatarValue) return defaultProfil;
        
        if (avatarValue.startsWith("http") || avatarValue.startsWith("data:") || avatarValue.startsWith("blob:") || avatarValue.startsWith("/")) {
            return avatarValue;
        }

        // Si le nom du fichier ressemble à un ID unique généré par uniqid() de PHP (13 caractères)
        // suivi d'une extension (.jpg, .png, etc.), alors il provient sûrement des uploads
        if (/^[a-f0-9]{13}\.[a-zA-Z]{3,4}$/i.test(avatarValue)) {
             return `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${avatarValue}`;
        }

        try {
            return new URL(`../../assets/${avatarValue}`, import.meta.url).href;
        } catch (e) {
            return defaultProfil;
        }
    };

    const finalSrc = getFinalSrc(src);

    return (
        <img 
            src={finalSrc} 
            alt={alt} 
            className={cn(AvatarVariants({ size, shape }))}
            {...props}
        />
    );
}
