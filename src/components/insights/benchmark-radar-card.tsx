"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { computeDomainScores, type DomainScore } from "@/lib/ai/insights-aggregator"
import { createBenchmarkSnapshot } from "@/lib/compliance-logic"

const CX = 110
const CY = 110
const MAX_R = 90
const N = 6

function angle(index: number) {
  return (Math.PI * 2 * index) / N - Math.PI / 2
}

function polarToXY(radius: number, index: number) {
  const a = angle(index)
  return { x: CX + Math.cos(a) * radius, y: CY + Math.sin(a) * radius }
}

function buildPolygon(scores: number[]) {
  return scores
    .map((score, i) => {
      const r = (score / 100) * MAX_R
      const { x, y } = polarToXY(r, i)
      return `${x},${y}`
    })
    .join(" ")
}

function RadarGrid() {
  const rings = [0.25, 0.5, 0.75, 1]
  return (
    <>
      {rings.map((fraction) => {
        const r = fraction * MAX_R
        const pts = Array.from({ length: N }, (_, i) => {
          const { x, y } = polarToXY(r, i)
          return `${x},${y}`
        }).join(" ")
        return (
          <polygon
            key={fraction}
            points={pts}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={1}
          />
        )
      })}
      {Array.from({ length: N }, (_, i) => {
        const { x, y } = polarToXY(MAX_R, i)
        return (
          <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="#e2e8f0" strokeWidth={1} />
        )
      })}
    </>
  )
}

function DomainLabels({ domains }: { domains: DomainScore[] }) {
  return (
    <>
      {domains.map((d, i) => {
        const labelR = MAX_R + 18
        const { x, y } = polarToXY(labelR, i)
        const anchor = x < CX - 4 ? "end" : x > CX + 4 ? "start" : "middle"
        return (
          <text
            key={d.short}
            x={x}
            y={y + 4}
            textAnchor={anchor}
            fontSize={9.5}
            fill="#64748b"
            fontWeight="500"
          >
            {d.short}
          </text>
        )
      })}
    </>
  )
}

export function BenchmarkRadarCard({ active = false }: { active?: boolean }) {
  const [baseScore, setBaseScore] = useState<number | null>(null)
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

      const { data: assessment } = await supabase
        .from("assessments")
        .select("compliance_score")
        .eq("organization_id", membership.organization_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      setBaseScore((assessment as { compliance_score?: number } | null)?.compliance_score ?? 54)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [active])

  const domains = useMemo(
    () => computeDomainScores(baseScore ?? 54),
    [baseScore]
  )

  const benchmark = useMemo(
    () => (baseScore !== null ? createBenchmarkSnapshot(baseScore) : null),
    [baseScore]
  )

  const orgPolygon = buildPolygon(domains.map((d) => d.score))
  const industryPolygon = buildPolygon(domains.map((d) => d.industryAvg))

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold text-slate-900">HIPAA domain benchmark</p>
        <p className="text-xs text-slate-500">Your org vs. industry average across 6 domains.</p>
      </div>

      {loading ? (
        <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 220 220" className="w-56">
              <RadarGrid />

              {/* Industry polygon */}
              <polygon
                points={industryPolygon}
                fill="#94a3b8"
                fillOpacity={0.12}
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />

              {/* Org polygon */}
              <polygon
                points={orgPolygon}
                fill="#06b6d4"
                fillOpacity={0.2}
                stroke="#0891b2"
                strokeWidth={2}
              />

              {/* Org dots */}
              {domains.map((d, i) => {
                const r = (d.score / 100) * MAX_R
                const { x, y } = polarToXY(r, i)
                return <circle key={d.short} cx={x} cy={y} r={3.5} fill="#0891b2" />
              })}

              <DomainLabels domains={domains} />
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-5 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-5 rounded-full bg-cyan-500 opacity-70" />
              Your org
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-5 rounded-full border-t-2 border-dashed border-slate-400" />
              Industry avg
            </span>
          </div>

          {/* Percentile callout */}
          {benchmark && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-center">
              <p className="text-xs text-slate-500">Peer benchmark</p>
              <p className="text-xl font-bold text-slate-900">
                {benchmark.percentile}
                <span className="text-sm font-normal text-slate-400">th percentile</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Peer median: {benchmark.peerMedian} · Top quartile: {benchmark.peerTopQuartile}
              </p>
            </div>
          )}

          {/* Weakest domain */}
          {domains.length > 0 && (
            <div className="flex flex-col gap-2">
              {domains
                .slice()
                .sort((a, b) => a.score - b.score)
                .slice(0, 3)
                .map((d) => (
                  <div key={d.domain} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-slate-600">{d.domain}</span>
                        <span className="font-semibold text-slate-800">{d.score}</span>
                      </div>
                      <div className="relative h-1.5 rounded-full bg-slate-100">
                        <div
                          className="absolute h-full rounded-full bg-slate-300"
                          style={{ width: `${d.industryAvg}%` }}
                        />
                        <div
                          className={`absolute h-full rounded-full ${d.score >= d.industryAvg ? "bg-cyan-500" : "bg-rose-400"}`}
                          style={{ width: `${d.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              <p className="text-xs text-slate-400">Bottom 3 domains — gray bar = industry avg</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
