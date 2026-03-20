import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import type { TextareaHTMLAttributes } from "react";

const textareaVariants = cva(
  "w-full rounded-[10px] bg-surface text-text border border-border transition-colors outline-none focus:ring-2 focus:ring-border disabled:pointer-events-none disabled:opacity-50 cursor-text px-3 py-2 resize-none",
  {
    variants: {
      variant: {
        primary: "border-border text-text",
        ghost: "border-none bg-transparent focus:ring-0 px-0", // Version "sans cadre" comme sur Figma
      },
      size: {
        sm: "text-body-sm",
        md: "text-body-base",
        lg: "text-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

export default function Textarea({ variant, size, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(textareaVariants({ variant, size }))}
      {...props}
    />
  );
}