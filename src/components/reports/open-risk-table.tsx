import type { RiskSummaryItem } from "@/services/reports"

const severityStyles: Record<string, string> = {
  high: "bg-rose-100 text-rose-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-emerald-100 text-emerald-700",
}

export function OpenRiskTable({ risks }: { risks: RiskSummaryItem[] }) {
  if (risks.length === 0) {
    return <p className="text-sm text-slate-500">No open risks in this period.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="text-left text-slate-400">
          <tr>
            <th className="p-2">Risk</th>
            <th className="p-2">Severity</th>
            <th className="p-2">Status</th>
            <th className="p-2 text-right">Age (days)</th>
          </tr>
        </thead>
        <tbody>
          {risks.map((risk) => (
            <tr key={risk.id} className="border-t border-slate-100">
              <td className="p-2 text-sm text-slate-700">{risk.title}</td>
              <td className="p-2">
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                    severityStyles[risk.severity] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {risk.severity}
                </span>
              </td>
              <td className="p-2 text-slate-500">{risk.status}</td>
              <td className="p-2 text-right text-slate-500">{risk.ageDays}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
