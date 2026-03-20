import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const authCardVariants = cva(
  "flex flex-col gap-12 sm:p-6 sm:m-4 rounded-xl sm:rounded-2xl sm:border sm:shadow-lg w-full",
  {
    variants: {
      variant: {
        primary: "text-text",
        outline: "bg-surface border-border text-text",
      },
      size: {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface AuthCardProps 
  extends React.HTMLAttributes<HTMLDivElement>, 
  VariantProps<typeof authCardVariants> {}


export default function AuthCard({
  children,
  variant,
  size,
  className,
  ...props
}: AuthCardProps) {
  return (
    <div
      className={cn(authCardVariants({ variant, size }))}
      {...props}
    >
      {children}
    </div>
  );
}