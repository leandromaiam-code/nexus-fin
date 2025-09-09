import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-nexus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        nexus: "bg-gradient-nexus text-white hover:shadow-nexus hover:scale-105 active:scale-95",
        success: "bg-gradient-success text-white hover:shadow-lg hover:scale-105 active:scale-95",
        ghost: "bg-transparent border border-muted text-foreground hover:bg-muted hover:scale-105 active:scale-95",
        outline: "border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 px-4",
        lg: "h-14 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "nexus",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const NexusButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
NexusButton.displayName = "NexusButton";

export { NexusButton, buttonVariants };