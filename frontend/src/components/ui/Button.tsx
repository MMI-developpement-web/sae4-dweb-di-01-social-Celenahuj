import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const ButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-action text-action-text hover:bg-action-hover focus:ring-action-hover",
        secondary:
          "border border-border bg-surface text-text-muted hover:bg-surface hover:text-text focus:ring-border",
        danger: "bg-warning text-action-text hover:opacity-90 focus:ring-border",
        ghost: "text-text-muted hover:text-text focus:ring-border",
        outline:
          "border border-border gap-2 bg-transparent text-text hover:text-text-muted focus:ring-border",
        icon: "bg-transparent text-text-muted hover:text-text",
        iconNoir: "bg-black text-action-text hover:text-text-muted rounded-full",
        gradient:"text-action-text w-full bg-[image:var(--color-gradient)]",
        gradientDisabled:"text-action-text w-full bg-[image:var(--color-gradient)] opacity-50",
        small: "text-action-text bg-action text-sm",
        smallwhite: "text-action-text bg-transparent border border-border-white text-sm",
        navItem: "bg-transparent text-black hover:bg-gray-100 justify-start gap-4 w-full px-2 py-3",
        navIcon: "bg-transparent text-white hover:bg-white/10 active:opacity-70 stroke-0.5",
        avatar: "bg-transparent p-0",
      },
      size: {
        sm: "h-8 px-5 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
        stat: "h-6",
        noir: "h-8 w-8 p-0 ",
        nul: "p-0",
      },
      icon: {
        "icon-left": "mr-2",
        "icon-right": "ml-2",
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
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof ButtonVariants> {}

export default function Button({
  children,
  variant,
  size,

  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(ButtonVariants({ variant, size }))}
      {...props}
    >
      {children}
    </button>
  );
}
