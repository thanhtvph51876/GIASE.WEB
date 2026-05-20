import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25 active:translate-y-0',
        destructive:
          'bg-destructive text-white shadow-sm hover:-translate-y-0.5 hover:bg-destructive/90 focus-visible:ring-destructive/20 active:translate-y-0 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        danger:
          'bg-destructive text-white shadow-sm hover:-translate-y-0.5 hover:bg-destructive/90 focus-visible:ring-destructive/20 active:translate-y-0 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        success:
          'bg-success text-success-foreground shadow-sm shadow-success/20 hover:-translate-y-0.5 hover:bg-success/90 hover:shadow-md hover:shadow-success/25 active:translate-y-0',
        outline:
          'border border-slate-200 bg-white text-slate-800 shadow-sm hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/5 hover:text-primary active:translate-y-0 dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:-translate-y-0.5 hover:bg-secondary/80 active:translate-y-0',
        ghost:
          'text-slate-700 hover:bg-primary/10 hover:text-primary dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2 has-[>svg]:px-3.5',
        sm: 'h-9 gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-11 px-6 has-[>svg]:px-4',
        icon: 'size-10',
        'icon-sm': 'size-9',
        'icon-lg': 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
