import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import React from "react";

const tabVariants = cva(
  "relative pb-3 font-bold transition-all cursor-pointer inline-flex items-center justify-center border-b-2",
  {
    variants: {
      variant: {
        primary: "",
      },
      isActive: {
        true: "text-white border-white",
        false: "text-text-muted border-transparent hover:text-text",
      },
      size: {
        sm: "text-sm px-2",
        md: "text-base px-4",
        lg: "text-lg px-6",
      },
    },
    defaultVariants: {
      variant: "primary",
      isActive: false,
      size: "md",
    },
  }
);

interface TabProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tabVariants> {}

export default function Tab({
  children,
  variant,
  size,
  isActive,
  ...props
}: TabProps) {
  return (
    <button
      className={cn(tabVariants({ variant, size, isActive }))}
      {...props}
    >
      {children}
    </button>
  );
}