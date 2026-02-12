import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hover?: boolean
  glass?: boolean
}

export function Card({ className, children, hover = true, glass = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200/60 bg-white shadow-card',
        hover && 'hover:border-gray-300/80',
        glass && 'bg-white/70 backdrop-blur-xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: Omit<CardProps, 'hover' | 'glass'>) {
  return (
    <div
      className={cn('px-5 py-4 border-b border-gray-100', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-sm font-semibold text-slate-900', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-slate-500 mt-0.5', className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...props }: Omit<CardProps, 'hover' | 'glass'>) {
  return (
    <div className={cn('px-5 py-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: Omit<CardProps, 'hover' | 'glass'>) {
  return (
    <div
      className={cn('px-5 py-3 border-t border-gray-100 bg-slate-50/50 rounded-b-xl', className)}
      {...props}
    >
      {children}
    </div>
  )
}
