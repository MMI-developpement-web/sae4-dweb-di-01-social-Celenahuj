import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const AvatarVariants = cva(
  "inline-block object-cover",
  {
    variants: {
      size: {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16",
        xl: "w-24 h-24",
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
  src: string;
  alt?: string;
}

function checkerAvatar(avatar: string): boolean {
    const avatarRegex = /^https?:\/\/.+/i;
    return avatarRegex.test(avatar);
}

export default function Avatar({ src, alt = "Avatar", size, shape, ...props }: AvatarProps) {
    if (!src || src === "") {
        return null;
    }

    if (checkerAvatar(src) === false) {
        console.error("L'avatar n'est pas valide : " + src);
        return null;
    }

    return (
        <img 
            src={src} 
            alt={alt} 
            className={cn(AvatarVariants({ size, shape }))}
            {...props}
        />
    );
}
