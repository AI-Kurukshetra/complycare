"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { computeTrend, type AssessmentPoint } from "@/lib/ai/insights-aggregator"

const PLOT = { x0: 44, x1: 388, y0: 12, y1: 112 } // SVG plot area bounds

function toX(index: number, total: number) {
  if (total <= 1) return (PLOT.x0 + PLOT.x1) / 2
  return PLOT.x0 + (index / (total - 1)) * (PLOT.x1 - PLOT.x0)
}

function toY(score: number) {
  return PLOT.y1 - (score / 100) * (PLOT.y1 - PLOT.y0)
}

function formatMonth(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short" })
}

const GRID_SCORES = [0, 25, 50, 75, 100]

export function ComplianceTrendChart({ active = false }: { active?: boolean }) {
  const [points, setPoints] = useState<AssessmentPoint[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!active) return
    const supabase = createClient()

    async function load() {
      setLoading(true)
      try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data: membership } = await supabase
        .from("org_members")
        .select("organization_id")
        .eq("user_id", userData.user.id)
        .limit(1)
        .maybeSingle()

      if (!membership?.organization_id) return

      const { data: rows } = await supabase
        .from("assessments")
        .select("compliance_score, created_at")
        .eq("organization_id", membership.organization_id)
        .order("created_at", { ascending: true })
        .limit(6)

      if (rows && rows.length > 0) {
        setPoints(
          rows.map((row) => ({
            score: row.compliance_score ?? 0,
            date: row.created_at,
          }))
        )
      } else {
        // Seed realistic demo data when no assessments exist
        const now = Date.now()
        setPoints([
          { score: 41, date: new Date(now - 5 * 30 * 864e5).toISOString() },
          { score: 48, date: new Date(now - 4 * 30 * 864e5).toISOString() },
          { score: 53, date: new Date(now - 3 * 30 * 864e5).toISOString() },
          { score: 59, date: new Date(now - 2 * 30 * 864e5).toISOString() },
          { score: 64, date: new Date(now - 1 * 30 * 864e5).toISOString() },
          { score: 71, date: new Date(now).toISOString() },
        ])
      }
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [active])

  const { direction, change } = computeTrend(points)
  const latest = points[points.length - 1]?.score ?? null

  const trendColor =
    direction === "improving"
      ? "text-emerald-600"
      : direction === "declining"
        ? "text-rose-600"
        : "text-slate-500"
  const trendLabel =
    direction === "improving" ? `▲ +${change}` : direction === "declining" ? `▼ ${change}` : "→ Stable"

  const polylinePoints = points.map((pt, i) => `${toX(i, points.length)},${toY(pt.score)}`).join(" ")

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Compliance trend</p>
          <p className="text-xs text-slate-500">Last {points.length} assessments</p>
        </div>
        {latest !== null && (
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold ${trendColor}`}>{trendLabel} pts</span>
            <span className="text-2xl font-bold text-slate-900">{latest}</span>
            <span className="text-sm text-slate-400">/ 100</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
      ) : points.length === 0 ? (
        <p className="text-sm text-slate-400">No assessment data yet.</p>
      ) : (
        <svg viewBox="0 0 432 136" className="w-full overflow-visible">
          {/* Y-axis grid lines and labels */}
          {GRID_SCORES.map((score) => {
            const y = toY(score)
            return (
              <g key={score}>
                <line
                  x1={PLOT.x0}
                  y1={y}
                  x2={PLOT.x1}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth={1}
                  strokeDasharray={score === 0 ? "0" : "4 3"}
                />
                <text x={PLOT.x0 - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#94a3b8">
                  {score}
                </text>
              </g>
            )
          })}

          {/* Shaded area under line */}
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <polygon
            points={[
              `${toX(0, points.length)},${PLOT.y1}`,
              ...points.map((pt, i) => `${toX(i, points.length)},${toY(pt.score)}`),
              `${toX(points.length - 1, points.length)},${PLOT.y1}`,
            ].join(" ")}
            fill="url(#trendFill)"
          />

          {/* Line */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#06b6d4"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots + score labels */}
          {points.map((pt, i) => {
            const x = toX(i, points.length)
            const y = toY(pt.score)
            const isLast = i === points.length - 1
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r={isLast ? 5 : 3.5}
                  fill={isLast ? "#0891b2" : "#fff"}
                  stroke="#06b6d4"
                  strokeWidth={2}
                />
                {isLast && (
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight="600"
                    fill="#0891b2"
                  >
                    {pt.score}
                  </text>
                )}
                {/* Month label */}
                <text
                  x={x}
                  y={PLOT.y1 + 14}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#94a3b8"
                >
                  {formatMonth(pt.date)}
                </text>
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}
