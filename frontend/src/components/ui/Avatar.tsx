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
        
        if (avatarValue.startsWith("http") || avatarValue.startsWith("data:")) {
            return avatarValue;
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
