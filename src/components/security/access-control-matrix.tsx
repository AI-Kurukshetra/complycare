"use client"

import type { AccessCategory } from "@/types/access-control"
import { cn } from "@/lib/utils"

const categoryLabels: Record<AccessCategory, string> = {
  phi_records: "PHI Records",
  billing: "Billing",
  admin_settings: "Admin Settings",
  reports: "Reports",
}

const cellStyles = {
  allowed: "bg-emerald-50 text-emerald-700",
  denied: "bg-slate-100 text-slate-400",
  flagged: "bg-rose-50 text-rose-700",
}

export function AccessControlMatrix({
  categories,
  rows,
  onToggleFlag,
  isFlagged,
}: {
  categories: AccessCategory[]
  rows: Array<{
    user: { id: string; name: string; role: string }
    access: Record<AccessCategory, boolean>
    required: AccessCategory[]
    score: number
    excessive: number
    missing: number
  }>
  onToggleFlag: (userId: string, category: AccessCategory) => void
  isFlagged: (userId: string, category: AccessCategory) => boolean
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0 text-xs">
        <thead>
          <tr className="text-left text-slate-500">
            <th className="p-2">User</th>
            <th className="p-2">Role</th>
            {categories.map((category) => (
              <th key={category} className="p-2 text-center">
                {categoryLabels[category]}
              </th>
            ))}
            <th className="p-2 text-center">Min-necessary score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.user.id} className="border-t border-slate-200">
              <td className="p-2 text-sm font-semibold text-slate-900">
                {row.user.name}
              </td>
              <td className="p-2 text-slate-500">{row.user.role}</td>
              {categories.map((category) => {
                const hasAccess = row.access[category]
                const flagged = isFlagged(row.user.id, category)
                const style = flagged
                  ? cellStyles.flagged
                  : hasAccess
                    ? cellStyles.allowed
                    : cellStyles.denied
                return (
                  <td key={`${row.user.id}-${category}`} className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleFlag(row.user.id, category)}
                      className={cn(
                        "rounded-full px-2 py-1 text-[11px] font-semibold",
                        style
                      )}
                    >
                      {flagged ? "Flagged" : hasAccess ? "Access" : "None"}
                    </button>
                  </td>
                )
              })}
              <td className="p-2 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                    {row.score}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {row.excessive} excess · {row.missing} missing
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
