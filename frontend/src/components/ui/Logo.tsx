import { cva, type VariantProps } from "class-variance-authority";

const LogoVariants = cva(
    "transition-all duration-300",
    {
        variants: {
            variant: {
                primary: "text-action", // Utilise ta couleur principale
                white: "text-white",
                black: "text-black",
                muted: "text-text-muted",
            },
            size: {
                sm: "w-6 h-6",
                md: "w-10 h-10",
                lg: "w-16 h-16",
                xl: "w-24 h-24",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    }
);

interface LogoProps extends React.SVGAttributes<SVGSVGElement>, VariantProps<typeof LogoVariants> { }

export default function Logo({ variant, size, ...props }: LogoProps) {
    return (
        <svg width="45" height="45" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M22.218 3.71838L16.5598 16.5564L3.71899 22.2164L16.5598 27.8763L22.218 40.7184L27.8802 27.8783L40.719 22.2184L27.8802 16.5584L22.218 3.71838Z" stroke="white" strokeWidth="3" />
        </svg>
    );
}