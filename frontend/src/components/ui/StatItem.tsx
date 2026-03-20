import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import type { ReactNode } from "react"; // Import ReactNode

const StatItemVariants = cva(
  "inline-flex items-center justify-center font-medium transition-colors disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          " text-text",
      },
      size: {
        sm: "py-0.5 p-2 text-xs",
        md: "py-1 px-2.5 text-xs",
        lg: "py-1.5 px-3 text-sm",
        stat: "py-0.5 px-2 text-xs",
      },
    },
    compoundVariants: [
      {
        variant: "primary",
        size: "lg",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface StatItemDataProps {
  children: ReactNode;
}

interface StatItemProps
  extends StatItemDataProps, VariantProps<typeof StatItemVariants> {}

export default function StatItem({
  children,
  variant,
  size,

  ...props
}: StatItemProps) {
  return (
    <span className={cn(StatItemVariants({ variant, size }))} {...props}>
        <div className="flex items-center gap-1">
            {children}
        </div>
    </span>
  );
}
