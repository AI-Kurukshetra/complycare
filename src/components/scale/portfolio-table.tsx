import type { PortfolioRow } from "@/services/portfolio"

const scoreStyles = (score: number | null) => {
  if (score === null) return "bg-slate-100 text-slate-600"
  if (score >= 85) return "bg-emerald-100 text-emerald-700"
  if (score >= 70) return "bg-amber-100 text-amber-700"
  return "bg-rose-100 text-rose-700"
}

function formatDate(value: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

export function PortfolioTable({ rows }: { rows: PortfolioRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">No organizations found.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-slate-400">
          <tr>
            <th className="p-2">Organization</th>
            <th className="p-2">Compliance</th>
            <th className="p-2">Open risks</th>
            <th className="p-2">Overdue training</th>
            <th className="p-2">Active incidents</th>
            <th className="p-2">Last assessment</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.organizationId} className="border-t border-slate-100">
              <td className="p-2 text-slate-900">{row.orgName}</td>
              <td className="p-2">
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${scoreStyles(row.complianceScore)}`}>
                  {row.complianceScore ?? "--"}
                </span>
              </td>
              <td className="p-2 text-slate-600">{row.openRisks}</td>
              <td className="p-2 text-slate-600">{row.overdueTraining}</td>
              <td className="p-2 text-slate-600">{row.activeIncidents}</td>
              <td className="p-2 text-slate-500">{formatDate(row.lastAssessmentDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
