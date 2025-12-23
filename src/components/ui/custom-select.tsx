'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { ChevronDownIcon, CheckIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface CustomSelectProps {
  value: string
  onValueChange: (value: string) => void
  required?: boolean
  children: React.ReactNode
  triggerClassName?: string
  contentClassName?: string
}

interface CustomSelectItemProps {
  value: string
  children: React.ReactNode
}

const CustomSelectContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  items: React.ReactElement<CustomSelectItemProps>[]
} | null>(null)

export function CustomSelect({
  value,
  onValueChange,
  required,
  children,
  triggerClassName,
  contentClassName,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  // Position the dropdown
  React.useEffect(() => {
    if (!isOpen || !contentRef.current || !triggerRef.current) return

    const updatePosition = () => {
      if (!contentRef.current || !triggerRef.current) return

      const triggerRect = triggerRef.current.getBoundingClientRect()
      const contentRect = contentRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth

      // Position below the trigger by default
      let top = triggerRect.bottom + 4
      let left = triggerRect.left

      // Adjust if it would go off screen
      if (top + contentRect.height > viewportHeight) {
        top = triggerRect.top - contentRect.height - 4
      }
      if (left + contentRect.width > viewportWidth) {
        left = viewportWidth - contentRect.width - 8
      }
      if (left < 8) {
        left = 8
      }

      contentRef.current.style.position = 'fixed'
      contentRef.current.style.top = `${top}px`
      contentRef.current.style.left = `${left}px`
      contentRef.current.style.zIndex = '99999'
      contentRef.current.style.width = `${triggerRect.width}px`
    }

    // Use multiple requestAnimationFrame calls to ensure the element is fully rendered
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updatePosition()
      })
    })
  }, [isOpen])

  const trigger = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === CustomSelectTrigger
  )
  const items = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === CustomSelectItem
  )

  const selectedItem = items.find(
    (item) =>
      React.isValidElement(item) &&
      item.props.value === value
  ) as React.ReactElement<CustomSelectItemProps> | undefined

  const dropdownContent = isOpen ? (
    <div
      ref={contentRef}
      className={cn(
        'bg-popover text-popover-foreground rounded-md border shadow-md min-w-[8rem] overflow-hidden',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        contentClassName
      )}
      style={{
        position: 'fixed',
        zIndex: 99999,
      }}
    >
      <div className="p-1">
        {items}
      </div>
    </div>
  ) : null

  return (
    <CustomSelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, items: items as React.ReactElement<CustomSelectItemProps>[] }}>
      <div className="relative w-full">
        {React.cloneElement(trigger as React.ReactElement, {
          ref: triggerRef,
          className: triggerClassName,
        })}
        {typeof document !== 'undefined' && dropdownContent
          ? createPortal(dropdownContent, document.body)
          : dropdownContent}
      </div>
    </CustomSelectContext.Provider>
  )
}

export const CustomSelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children?: React.ReactNode
    placeholder?: string
  }
>(({ children, placeholder, className, ...props }, ref) => {
  const context = React.useContext(CustomSelectContext)
  if (!context) throw new Error('CustomSelectTrigger must be used within CustomSelect')

  // Find the selected item
  const selectedItem = context.items.find(
    (item) => item.props.value === context.value
  )
  const displayValue = selectedItem
    ? selectedItem.props.children
    : placeholder || '请选择'

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => context.setIsOpen(!context.isOpen)}
      className={cn(
        'border-input',
        !context.value && 'text-muted-foreground',
        'focus-visible:border-ring focus-visible:ring-ring/50',
        'flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm',
        'shadow-xs transition-[color,box-shadow] outline-none',
        'focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        'h-12',
        className
      )}
      {...props}
    >
      <span className="flex items-center gap-2 line-clamp-1">{displayValue}</span>
      <ChevronDownIcon className="size-4 opacity-50 shrink-0 pointer-events-none" />
    </button>
  )
})
CustomSelectTrigger.displayName = 'CustomSelectTrigger'

export function CustomSelectItem({ value, children }: CustomSelectItemProps) {
  const context = React.useContext(CustomSelectContext)
  if (!context) throw new Error('CustomSelectItem must be used within CustomSelect')

  const isSelected = context.value === value

  return (
    <div
      onClick={() => {
        context.onValueChange(value)
        context.setIsOpen(false)
      }}
      className={cn(
        'relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none',
        'select-none focus:bg-accent focus:text-accent-foreground',
        'hover:bg-accent hover:text-accent-foreground',
        'transition-colors'
      )}
    >
      {children}
      {isSelected && (
        <span className="absolute right-2 flex size-3.5 items-center justify-center">
          <CheckIcon className="size-4" />
        </span>
      )}
    </div>
  )
}

