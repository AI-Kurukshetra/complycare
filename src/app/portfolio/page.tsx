"use client"

import { useEffect, useMemo, useState } from "react"
import { AuthPanel } from "@/components/auth-panel"
import { AuthRequiredBanner } from "@/components/auth-required-banner"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { PortfolioTable } from "@/components/scale/portfolio-table"
import { createClient } from "@/utils/supabase/client"
import { fetchPortfolioRows, type PortfolioRow } from "@/services/portfolio"

const navLinks = [
  { label: "Scale", href: "/scale" },
  { label: "Security", href: "/security" },
]

type SortKey = "compliance" | "openRisks" | "overdueTraining" | "activeIncidents"

export default function PortfolioPage() {
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [rows, setRows] = useState<PortfolioRow[]>([])
  const [loading, setLoading] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>("compliance")
  const [minScore, setMinScore] = useState(0)

  async function loadPortfolio() {
    if (!currentUser) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      const userId = data.user?.id
      if (!userId) return
      const portfolio = await fetchPortfolioRows(userId)
      setRows(portfolio)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function run() {
      await loadPortfolio()
    }
    void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser])

  const sortedRows = useMemo(() => {
    const filtered = rows.filter((row) => (row.complianceScore ?? 0) >= minScore)
    return [...filtered].sort((a, b) => {
      if (sortKey === "compliance") {
        return (b.complianceScore ?? 0) - (a.complianceScore ?? 0)
      }
      if (sortKey === "openRisks") return b.openRisks - a.openRisks
      if (sortKey === "overdueTraining") return b.overdueTraining - a.overdueTraining
      return b.activeIncidents - a.activeIncidents
    })
  }, [rows, sortKey, minScore])

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <DashboardHeader
        eyebrow="Phase 9 Scale"
        title="Consultant Portfolio"
        description="Monitor compliance posture across all managed organizations."
        navLinks={navLinks}
      />

      <AuthPanel onAuth={setCurrentUser} />
      {!currentUser && <AuthRequiredBanner />}

      <section className={currentUser ? "" : "pointer-events-none opacity-60"}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Sort</label>
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
            >
              <option value="compliance">Compliance score</option>
              <option value="openRisks">Open risks</option>
              <option value="overdueTraining">Overdue training</option>
              <option value="activeIncidents">Active incidents</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Min score
            </label>
            <input
              type="number"
              className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              value={minScore}
              onChange={(event) => setMinScore(Number(event.target.value))}
            />
          </div>
          <Button size="sm" variant="outline" onClick={loadPortfolio} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </section>

      <section className={currentUser ? "" : "pointer-events-none opacity-60"}>
        <PortfolioTable rows={sortedRows} />
      </section>
    </main>
  )
}
