export type DomainBreakdown = { label: string; value: number }

const colors = ["#0ea5e9", "#38bdf8", "#93c5fd"]

export function DomainBreakdownChart({ data }: { data: DomainBreakdown[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1
  const radius = 70
  const circumference = 2 * Math.PI * radius

  const segments = data.reduce<{ label: string; value: number; length: number; dashOffset: number }[]>(
    (acc, item) => {
      const prev = acc[acc.length - 1]
      const consumed = prev ? prev.dashOffset - prev.length : circumference
      const length = (item.value / total) * circumference
      acc.push({ ...item, length, dashOffset: consumed })
      return acc
    },
    []
  )

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 200 200" className="h-40 w-40">
        <g transform="translate(100 100)">
          {segments.map((seg, index) => (
            <circle
              key={seg.label}
              r={radius}
              fill="transparent"
              stroke={colors[index % colors.length]}
              strokeWidth={18}
              strokeDasharray={`${seg.length} ${circumference - seg.length}`}
              strokeDashoffset={seg.dashOffset}
              transform="rotate(-90)"
            />
          ))}
        </g>
      </svg>
      <div className="flex flex-col gap-2 text-xs text-slate-600">
        {data.map((item, index) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[index % colors.length] }} />
            <span>{item.label}</span>
            <span className="text-slate-400">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
