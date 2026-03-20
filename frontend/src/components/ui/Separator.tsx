import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import React from "react";

const separatorVariants = cva(
  "w-full shrink-0 transition-all",
  {
    variants: {
      variant: {
        primary: "bg-border/50",
        bold: "bg-border",
      },
      size: {
        sm: "h-[1px]",
        md: "h-[2px]",
      },
      margin: {
        none: "my-0",
        sm: "my-2",
        md: "my-4",
        lg: "my-8",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "sm",
      margin: "md",
    },
  }
);

interface SeparatorProps 
  extends React.HTMLAttributes<HTMLDivElement>, 
  VariantProps<typeof separatorVariants> {}

export default function Separator({ 
  variant, 
  size, 
  margin,
  ...props 
}: SeparatorProps) {
  return (
    <div
      className={cn(separatorVariants({ variant, size, margin }))}
      {...props}
    />
  );
}