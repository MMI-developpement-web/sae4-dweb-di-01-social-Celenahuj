import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const TweetCardVariants = cva(
  "flex flex-col gap-6 p-4 sm:p-6 rounded-xl sm:rounded-2xl border shadow-lg w-full",
  {
    variants: {
      variant: {
        primary: "bg-surface border-border text-text",
        outline: "bg-surface border-border text-text",
      },
      size: {
        sm: "max-w-sm",
        md: "max-w-xl",
        lg: "max-w-2xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface TweetCardProps 
  extends React.HTMLAttributes<HTMLDivElement>, 
  VariantProps<typeof TweetCardVariants> {}


export default function TweetCard({
  variant,
  size,
  children,
  ...props
}: TweetCardProps) {
  return (
    <div className={cn(TweetCardVariants({ variant, size }))} {...props}>
      {children}
    </div>
  );
}