import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import Button from "./ui/Button";
import { X } from 'lucide-react';

const MessageVariants = cva(
  "relative bg-surface text-text rounded-2xl shadow-lg max-w-xs mx-auto flex flex-col items-center text-center space-y-4 gap-2 [&>.message-content>*:nth-child(1)]:w-14 [&>.message-content>*:nth-child(1)]:h-14 [&>.message-content>*:nth-child(1)]:mb-4 [&>.message-content>*:nth-child(1)]:fill-text [&>.message-content>*:nth-child(1)]:stroke-action-text [&>.message-content>*:nth-child(1)]:stroke-1 [&>.message-content>*:nth-child(2)]:text-lg [&>.message-content>*:nth-child(2)]:font-medium [&>.message-content>*:nth-child(2)]:leading-snug [&>.message-content>*:nth-child(2)]:max-w-[260px]",
  {
    variants: {
      variant: {
        primary: "bg-surface text-text border-border",
        outline: "bg-surface border border-border text-text",
      },
      size: {
        sm: "p-3 text-sm",
        md: "p-12 text-base",
        lg: "p-4 text-lg",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        size: "lg",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface MessageProps 
  extends React.HTMLAttributes<HTMLDivElement>, 
  VariantProps<typeof MessageVariants> {}



export default function Message({
  children,
  variant,
  size,  
  ...props
}: MessageProps) {
  return (
    <div className={cn(MessageVariants({ variant, size }))} {...props}>
      <div className="absolute top-2 right-2">
      </div>
      <div className="message-content flex flex-col items-center text-center">
        {children}
      </div>
    </div>
  );
}