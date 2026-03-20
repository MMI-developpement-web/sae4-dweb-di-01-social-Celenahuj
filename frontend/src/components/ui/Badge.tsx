import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import type { ReactNode } from "react"; // Import ReactNode

const BadgeVariants = cva(
  "inline-flex items-center justify-center rounded-3xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-surface text-text border border-border",
        secondary:
          "bg-surface text-text-muted border border-border",
        danger:
          "bg-surface text-text-accent border border-border",
        ghost: "text-text-muted hover:text-text",
        outline:
          "border border-border text-text-muted bg-transparent",
      },
      size: {
        sm: "py-0.5 px-2 text-xs",
        md: "py-1 px-2.5 text-xs",
        lg: "py-1.5 px-3 text-sm",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        size: "lg",
        class: "shadow-sm",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface BadgeDataProps {
  children: ReactNode;
}

interface BadgeProps
  extends BadgeDataProps, VariantProps<typeof BadgeVariants> {}

export default function Badge({
  children,
  variant,
  size,

  ...props
}: BadgeProps) {
  return (
    <span className={cn(BadgeVariants({ variant, size }))} {...props}>
      {children}
    </span>
  );
}
