import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-24 w-full rounded-lg border bg-white px-3 py-2 text-base shadow-sm shadow-slate-950/5 transition-[color,box-shadow,background-color,border-color] outline-none focus-visible:ring-[4px] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
