import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import type { LabelHTMLAttributes } from "react";

const labelVariants = cva(
  "inline-block text-text-muted shrink-0 transition-colors",
  {
    variants: {
      variant: {
        primary: "text-text-muted font-medium",
        bold: "text-text font-bold",
      },
      size: {
        sm: "text-[12px] w-20",
        md: "text-body-sm w-24", // Taille standard pour l'alignement du profil
        lg: "text-body-base w-28",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface LabelProps
  extends LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {}

export default function Label({ variant, size, children, ...props }: LabelProps) {
  return (
    <label
      className={cn(labelVariants({ variant, size }))} {...props}
      {...props}
    >
      {children}
    </label>
  );
}