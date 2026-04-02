import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import Button from "./ui/Button";
import { ChevronLeft } from "lucide-react";

const HeaderVariants = cva(
  "relative w-full flex items-center min-h-[64px]",
  {
    variants: {
      variant: {
        primary: "bg-transparent text-text",
        surface: "bg-surface border-b border-border",
      },
      // C'est ici que la magie opère pour l'alignement
      contentAlign: {
        between: "justify-between", // Le bouton retour à gauche, le reste à droite
        center: "justify-center",   // Le bouton retour à gauche, le titre au milieu
      },
    },
    defaultVariants: {
      variant: "primary",
      contentAlign: "between",
    },
  }
);

interface HeaderProps 
  extends React.HTMLAttributes<HTMLDivElement>, 
  VariantProps<typeof HeaderVariants> {
    onBack?: () => void;
  }


export default function Header({
  children,
  variant,
  contentAlign,
  onBack,
  ...props
}: HeaderProps) {
  return (
    <header className={cn(HeaderVariants({ variant, contentAlign }))} {...props}>
      
      <div className={cn(
          contentAlign === "center" ? " left-4" : "static"
      )}>
        <Button variant="iconNoir" size="noir" onClick={onBack}>
          <ChevronLeft size={20} />
        </Button>
      </div>

      <div className={cn(
          "flex items-center",
          contentAlign === "center" ? "w-full justify-center" : ""
      )}>
        {children}
      </div>
    </header>
  );
}