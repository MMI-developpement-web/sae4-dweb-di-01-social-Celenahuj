import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const AsideVariants = cva(
  "fixed left-0 top-0 h-full z-50 bg-white p-8 flex flex-col gap-8 shadow-2xl transition-all duration-300",
  {
    variants: {
      size: {
        // 75% sur mobile, 320px sur tablette/PC
        default: "w-[75%] sm:w-80", 
        full: "w-full",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

interface AsideProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof AsideVariants> {
  isOpen: boolean;
  onClose: () => void;
}

export default function Aside({ isOpen, onClose, size,children, ...props }: AsideProps) {
    // Si le menu n'est pas ouvert, on ne rend rien
    if (!isOpen) {
        return null;
    }

    return (
        <>
            {/* Overlay : Fond sombre cliquable pour fermer */}
            <div 
                className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200" 
                onClick={onClose} 
            />

            {/* Conteneur Aside */}
            <aside 
                className={cn(AsideVariants({ size }))}
                {...props}
            >
                {children}
            </aside>
        </>
    );
}