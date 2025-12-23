import * as React from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
  className?: string
}

export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative w-1/2">
        <select
          ref={ref}
          className={cn(
            'border-input',
            'focus-visible:border-ring focus-visible:ring-ring/50',
            'flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm',
            'shadow-xs transition-[color,box-shadow] outline-none',
            'focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
            'h-12',
            'appearance-none',
            'pr-10',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDownIcon 
          className="absolute right-3 top-1/2 -translate-y-1/2 size-4 opacity-50 pointer-events-none"
          style={{ color: 'var(--muted-foreground)' }}
        />
      </div>
    )
  }
)
NativeSelect.displayName = 'NativeSelect'

