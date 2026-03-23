import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const BarNavVariants = cva(
  "fixed bottom-0 left-0 right-0 w-full flex items-center justify-around px-2 min-h-[70px] border-t border-white/10",
  {
    variants: {
      variant: {
        dark: "bg-black text-white",
        surface: "bg-surface border-border text-text stroke-white",
      },
    },
    defaultVariants: {
      variant: "dark",
    },
  }
);

interface BarNavProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof BarNavVariants> {}

export default function BarNav({
  children,
  variant,
  ...props
}: BarNavProps) {
  return (
    <div
      className={cn(BarNavVariants({ variant }))}
      {...props}
    >
      {children}
    </div>
  );
}