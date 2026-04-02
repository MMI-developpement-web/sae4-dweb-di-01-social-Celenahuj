import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

// 1. LA VUE (Définition des styles et variantes)
const switchVariants = cva(
  "relative inline-flex items-center cursor-pointer shrink-0 transition-all",
  {
    variants: {
      variant: {
        primary: "", // On peut ajouter d'autres couleurs ici plus tard
      },
      size: {
        md: "w-11 h-6",
        lg: "w-14 h-7",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

const trackVariants = cva(
  "rounded-full transition-colors peer-checked:bg-black bg-gray-200 w-full h-full " +
  "after:content-[''] after:absolute after:top-[2px] after:left-[2px] " +
  "after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full",
  {
    variants: {
      size: {
        md: "after:h-5 after:w-5",
        lg: "after:h-6 after:w-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

// 2. LES DONNÉES (Interfaces des propriétés)
interface SwitchDataProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface SwitchProps 
  extends SwitchDataProps, VariantProps<typeof switchVariants> {}

// 3. LE COMPOSANT (Assemblage)
export default function Switch({ 
  checked, 
  onChange, 
  variant, 
  size, 
}: SwitchProps) {
  return (
    <label className={cn(switchVariants({ variant, size }))}>
      <input 
        type="checkbox" 
        className="sr-only peer" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)} 
      />
      
      {/* Le "Track" et le "Thumb" reçoivent les styles de la vue */}
      <div className={cn(trackVariants({ size }))} />
    </label>
  );
}