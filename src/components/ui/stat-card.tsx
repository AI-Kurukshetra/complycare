type StatCardProps = {
  label: string
  value: string | number
  valueClassName?: string
}

export function StatCard({ label, value, valueClassName = "text-slate-900" }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-2xl font-semibold ${valueClassName}`}>{value}</p>
    </div>
  )
}
