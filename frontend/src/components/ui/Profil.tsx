import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const ProfilVariants = cva(
  "relative text-text inline-flex gap-4 items-center",
  {
    variants: {
      variant: {
        primary: "bg-surface text-text border-border",
        outline: "bg-surface border border-border text-text",
      },
      size: {
        sm: "",
        md: "p-12 text-base",
        lg: "p-4 text-lg",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        size: "lg",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "sm",
    },
  }
);

interface ProfilProps 
  extends React.HTMLAttributes<HTMLDivElement>, 
  VariantProps<typeof ProfilVariants> {}


export default function Profil({
  children,
  variant,
  size,
  className,
  ...props
}: ProfilProps) {
  return (
    <div className={cn(ProfilVariants({ variant, size }))} {...props}>
      {children}
    </div>
  );
}