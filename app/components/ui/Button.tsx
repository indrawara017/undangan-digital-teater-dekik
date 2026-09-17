import * as React from 'react';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', asChild = false, ...props }, ref) => {
    const Comp = asChild ? (Slot as any) : 'button';
    
    const baseStyles = 'inline-flex items-center justify-center rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      default: 'bg-white text-black hover:bg-neutral-200',
      outline: 'border border-neutral-700 bg-transparent hover:bg-neutral-800 text-white',
      ghost: 'hover:bg-neutral-800 hover:text-white text-neutral-400',
      danger: 'bg-red-950/30 text-red-400 hover:bg-red-900/50 border border-red-900/50',
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-xs uppercase tracking-wider',
      md: 'h-10 px-4 py-2 text-sm',
      lg: 'h-12 px-8 py-3 uppercase tracking-widest text-sm',
    };

    return (
      <Comp
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
