import { cn } from '@/lib/cn'

interface BentoGridProps {
  children: React.ReactNode
  className?: string
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-min',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface BentoItemProps {
  children: React.ReactNode
  className?: string
  colSpan?: 1 | 2 | 3
  rowSpan?: 1 | 2
}

const COL_SPAN: Record<number, string> = {
  1: '',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
}

const ROW_SPAN: Record<number, string> = {
  1: '',
  2: 'md:row-span-2',
}

export function BentoItem({ children, className, colSpan = 1, rowSpan = 1 }: BentoItemProps) {
  return (
    <div className={cn(COL_SPAN[colSpan], ROW_SPAN[rowSpan], className)}>
      {children}
    </div>
  )
}
