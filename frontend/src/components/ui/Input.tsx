import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import type { InputHTMLAttributes } from "react";

const inputVariants = cva(
  "w-full rounded-[10px] bg-surface text-text-muted border border-border transition-colors outline-none focus:ring-2 focus:ring-border disabled:pointer-events-none disabled:opacity-50 cursor-text px-3",
  {
    variants: {
      variant: {
        primary: "border-border text-text-muted",
        ghost: "bg-transparent border-none p-0 font-bold text-black focus:ring-0",
        
      },
      size: {
        sm: "h-8 text-body-sm",
        md: "h-10 text-body-base",
        lg: "h-12 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

export default function Input({ variant, size, ...props }: InputProps) {
  return (
    <input
      className={cn(inputVariants({ variant, size }))}
      {...props}
    />
  );
}