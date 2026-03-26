import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const contentVariants = cva(
  "flex flex-col transition-all duration-500 transform origin-left", // Ajout de origin-left pour une transition plus propre
  {
    variants: {
      isSticky: {
        true: "translate-y-0 opacity-100 pointer-events-auto",
        false: "translate-y-2 opacity-0 pointer-events-none", // translate-y-2 est plus subtil que 4
      },
    },
    defaultVariants: { isSticky: false },
  }
);

interface ContentProps extends VariantProps<typeof contentVariants> {
  children: React.ReactNode;
  className?: string; // Ajout de la prop className pour plus de flexibilité
}

export default function HeaderProfileContent({ isSticky, children, className }: ContentProps) {
  return (
    <div className={cn(contentVariants({ isSticky }), className)}>
      {children}
    </div>
  );
}