type ListItemProps = {
  title: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
}

export function ListItem({ title, subtitle, children, className = "" }: ListItemProps) {
  return (
    <div
      className={`rounded-xl border border-slate-100 bg-slate-50 px-3 py-2${className ? ` ${className}` : ""}`}
    >
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      {children}
    </div>
  )
}
