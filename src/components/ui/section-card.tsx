type SectionCardProps = {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  semi?: boolean
}

export function SectionCard({
  title,
  description,
  children,
  className = "",
  semi = false,
}: SectionCardProps) {
  return (
    <div
      className={`rounded-3xl border border-slate-200 ${semi ? "bg-white/90" : "bg-white"} p-6 shadow-sm${className ? ` ${className}` : ""}`}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
      )}
      {children}
    </div>
  )
}
