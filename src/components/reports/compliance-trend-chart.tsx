import type { ComplianceTrendPoint } from "@/services/reports"

export function ComplianceTrendChart({ data }: { data: ComplianceTrendPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-500">No compliance history yet.</p>
  }

  const maxScore = 100
  const width = 600
  const height = 180
  const padding = 24

  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (width - padding * 2)
    const y = padding + ((maxScore - point.score) / maxScore) * (height - padding * 2)
    return `${x},${y}`
  })

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full">
        <polyline
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="3"
          points={points.join(" ")}
        />
        {data.map((point, index) => {
          const x = padding + (index / (data.length - 1 || 1)) * (width - padding * 2)
          const y = padding + ((maxScore - point.score) / maxScore) * (height - padding * 2)
          return <circle key={point.month} cx={x} cy={y} r={4} fill="#0ea5e9" />
        })}
      </svg>
      <div className="mt-2 grid grid-cols-6 gap-2 text-[11px] text-slate-500">
        {data.slice(-6).map((point) => (
          <span key={point.month}>{point.month}</span>
        ))}
      </div>
    </div>
  )
}
