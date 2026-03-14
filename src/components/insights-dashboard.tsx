"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { AuthPanel } from "@/components/auth-panel"
import { SectionCard } from "@/components/ui/section-card"
import { DashboardHeader } from "@/components/dashboard-header"
import { AuthRequiredBanner } from "@/components/auth-required-banner"
import { PredictedRisksCard } from "@/components/insights/predicted-risks-card"
import { BreachCostCard } from "@/components/insights/breach-cost-card"
const ComplianceTrendChart = dynamic(
  () =>
    import("@/components/insights/compliance-trend-chart").then(
      (mod) => mod.ComplianceTrendChart
    ),
  {
    ssr: false,
    loading: () => <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />,
  }
)

const TrainingEffectivenessCard = dynamic(
  () =>
    import("@/components/insights/training-effectiveness-card").then(
      (mod) => mod.TrainingEffectivenessCard
    ),
  {
    ssr: false,
    loading: () => <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />,
  }
)

const BenchmarkRadarCard = dynamic(
  () =>
    import("@/components/insights/benchmark-radar-card").then(
      (mod) => mod.BenchmarkRadarCard
    ),
  {
    ssr: false,
    loading: () => <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />,
  }
)

const navLinks = [
  { label: "Security", href: "/security" },
  { label: "Governance", href: "/governance" },
  { label: "Scale", href: "/scale" },
]

export function InsightsDashboard() {
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const active = Boolean(currentUser)

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <DashboardHeader
        eyebrow="AI-Powered Insights"
        title="Insights"
        description="Compliance trends, AI-predicted risks, breach cost estimation, training effectiveness, and peer benchmarking."
        navLinks={navLinks}
      />

      <AuthPanel onAuth={setCurrentUser} />

      {!currentUser && (
        <AuthRequiredBanner message="Sign in to load your organisation's live compliance data." />
      )}

      {/* Row 1 — Compliance trend (full width) */}
      <div className={active ? "" : "pointer-events-none opacity-60"}>
        <SectionCard
          title="Compliance Score Trend"
          description="Score history across your last 6 assessments."
        >
          <ComplianceTrendChart active={active} />
        </SectionCard>
      </div>

      {/* Row 2 — AI Predicted Risks + Breach Cost */}
      <div
        className={`grid gap-6 md:grid-cols-2 ${active ? "" : "pointer-events-none opacity-60"}`}
      >
        <SectionCard
          title="Predicted Risks"
          description="Top compliance risks for the next 90 days."
        >
          <PredictedRisksCard active={active} />
        </SectionCard>

        <SectionCard
          title="Predictive Breach Cost"
          description="Claude estimates financial exposure and mitigation savings."
        >
          <BreachCostCard active={active} />
        </SectionCard>
      </div>

      {/* Row 3 — Training Effectiveness + Benchmark Radar */}
      <div
        className={`grid gap-6 md:grid-cols-2 ${active ? "" : "pointer-events-none opacity-60"}`}
      >
        <SectionCard
          title="Training Effectiveness"
          description="Training completion rate vs. open incident correlation."
        >
          <TrainingEffectivenessCard active={active} />
        </SectionCard>

        <SectionCard
          title="HIPAA Domain Benchmark"
          description="Your org vs. industry average across 6 HIPAA domains."
        >
          <BenchmarkRadarCard active={active} />
        </SectionCard>
      </div>
    </main>
  )
}
