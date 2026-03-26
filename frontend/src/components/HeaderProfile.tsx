import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const headerVariants = cva(
  "sticky top-0 z-50 w-full transition-all duration-300",
  {
    variants: {
      isSticky: {
        true: "bg-bg/80 backdrop-blur-md border-b border-white/10",
        false: "bg-transparent border-transparent",
      },
    },
    defaultVariants: {
      isSticky: false,
    },
  }
);

interface HeaderProfileProps 
  extends React.HTMLAttributes<HTMLElement>, 
  VariantProps<typeof headerVariants> {
    children: React.ReactNode;
}

export default function HeaderProfile({ isSticky, children, className, ...props }: HeaderProfileProps) {
  return (
    <header className={cn(headerVariants({ isSticky }), className)} {...props}>
      <div className="items-center flex gap-4"> 
        {children}
      </div>
    </header>
  );
}