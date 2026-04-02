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


// 1. Le Modèle (Les données pures)
interface ContentData {
  children: React.ReactNode; // Le contenu affiché (nom, pseudo, etc.)
}

// 2. La Vue (Le design / style)
interface ContentStyle extends VariantProps<typeof contentVariants> {}

export default function HeaderProfileContent({ isSticky, children }: ContentData & ContentStyle) {
  
  // ===============================================
  // VUE PURE : Pas de requêtes serveur, juste de l'affichage
  // ===============================================

  return (
    <div className={cn(contentVariants({ isSticky }))}>
      {children}
    </div>
  );
}