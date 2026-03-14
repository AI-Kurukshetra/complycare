"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { AuthPanel } from "@/components/auth-panel"
import { AuthRequiredBanner } from "@/components/auth-required-banner"
import { DashboardHeader } from "@/components/dashboard-header"
import { OrgSettingsCard } from "@/components/org-settings-card"
import { SectionCard } from "@/components/ui/section-card"
import { StatCard } from "@/components/ui/stat-card"
import { Button } from "@/components/ui/button"
const ComplianceTrendChart = dynamic(
  () =>
    import("@/components/reports/compliance-trend-chart").then(
      (mod) => mod.ComplianceTrendChart
    ),
  {
    ssr: false,
    loading: () => <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />,
  }
)

const DomainBreakdownChart = dynamic(
  () =>
    import("@/components/reports/domain-breakdown-chart").then(
      (mod) => mod.DomainBreakdownChart
    ),
  {
    ssr: false,
    loading: () => <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />,
  }
)

const TrainingCompletionChart = dynamic(
  () =>
    import("@/components/reports/training-completion-chart").then(
      (mod) => mod.TrainingCompletionChart
    ),
  {
    ssr: false,
    loading: () => <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />,
  }
)

const OpenRiskTable = dynamic(
  () =>
    import("@/components/reports/open-risk-table").then(
      (mod) => mod.OpenRiskTable
    ),
  {
    ssr: false,
    loading: () => <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />,
  }
)
import {
  buildHipaaDomainBreakdown,
  buildTrainingCompletionByDepartment,
  fetchComplianceTrend,
  fetchIncidentSummary,
  fetchOpenRisks,
  fetchVendorComplianceSummary,
  type DateRange,
  type IncidentSummary,
  type VendorComplianceSummary,
  type ComplianceTrendPoint,
  type RiskSummaryItem,
} from "@/services/reports"
import { ensureOrgMembership, ensureOrganization } from "@/services/operations"

const navLinks = [
  { label: "Security", href: "/security" },
  { label: "Governance", href: "/governance" },
]

function getDefaultRange() {
  const end = new Date()
  const start = new Date()
  start.setMonth(end.getMonth() - 11)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

export function ReportsClient() {
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [orgName, setOrgName] = useState("Northwind Family Clinic")
  const [orgType, setOrgType] = useState("Primary Care")
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [range, setRange] = useState<DateRange>(() => getDefaultRange())
  const [trend, setTrend] = useState<ComplianceTrendPoint[]>([])
  const [risks, setRisks] = useState<RiskSummaryItem[]>([])
  const [incidentSummary, setIncidentSummary] = useState<IncidentSummary>({
    open: 0,
    resolved: 0,
    total: 0,
  })
  const [vendorSummary, setVendorSummary] = useState<VendorComplianceSummary>({
    compliant: 0,
    atRisk: 0,
    nonCompliant: 0,
  })
  const [loading, setLoading] = useState(false)
  const domainBreakdown = useMemo(() => buildHipaaDomainBreakdown(), [])
  const trainingByDept = useMemo(() => buildTrainingCompletionByDepartment(orgName), [orgName])

  async function ensureOrg() {
    if (organizationId) return organizationId
    const id = await ensureOrganization(orgName, orgType)
    await ensureOrgMembership(id, "owner")
    setOrganizationId(id)
    return id
  }

  async function loadReport() {
    if (!currentUser) return
    setLoading(true)
    try {
      const orgId = await ensureOrg()
      const [trendData, openRisks, incidents, vendors] = await Promise.all([
        fetchComplianceTrend(orgId, range),
        fetchOpenRisks(orgId),
        fetchIncidentSummary(orgId),
        fetchVendorComplianceSummary(orgId),
      ])
      setTrend(trendData)
      setRisks(openRisks)
      setIncidentSummary(incidents)
      setVendorSummary(vendors)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function run() {
      await loadReport()
    }
    void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, range])

  const printReport = () => {
    if (typeof window === "undefined") return
    window.print()
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <DashboardHeader
        eyebrow="Phase 8 Reporting"
        title="Compliance Reporting Dashboard"
        description="Executive-ready reports for compliance officers and leadership."
        navLinks={navLinks}
      >
        <OrgSettingsCard
          orgName={orgName}
          orgType={orgType}
          onOrgNameChange={setOrgName}
          onOrgTypeChange={setOrgType}
        />
      </DashboardHeader>

      <AuthPanel onAuth={setCurrentUser} />
      {!currentUser && <AuthRequiredBanner />}

      <section className={currentUser ? "" : "pointer-events-none opacity-60"}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Range</label>
            <input
              type="date"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm sm:w-auto"
              value={range.start}
              onChange={(event) => setRange((prev) => ({ ...prev, start: event.target.value }))}
            />
            <span className="hidden text-slate-400 sm:inline">→</span>
            <input
              type="date"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm sm:w-auto"
              value={range.end}
              onChange={(event) => setRange((prev) => ({ ...prev, end: event.target.value }))}
            />
          </div>
          <Button size="sm" variant="outline" onClick={loadReport} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button size="sm" onClick={printReport}>
            Print Report
          </Button>
        </div>
      </section>

      <section
        className={`grid gap-6 lg:grid-cols-[1.2fr_0.8fr] ${
          currentUser ? "" : "pointer-events-none opacity-60"
        }`}
      >
        <SectionCard
          title="Compliance Score Trend"
          description="Last 12 months of compliance performance."
        >
          <ComplianceTrendChart data={trend} />
        </SectionCard>
        <SectionCard
          title="HIPAA Domain Breakdown"
          description="Distribution across safeguard categories."
        >
          <DomainBreakdownChart data={domainBreakdown} />
        </SectionCard>
      </section>

      <section
        className={`grid gap-6 lg:grid-cols-[1.1fr_0.9fr] ${
          currentUser ? "" : "pointer-events-none opacity-60"
        }`}
      >
        <SectionCard title="Open Risk Summary" description="Risks with aging data.">
          <OpenRiskTable risks={risks} />
        </SectionCard>
        <SectionCard
          title="Training Completion by Department"
          description="Estimated completion rate this quarter."
        >
          <TrainingCompletionChart data={trainingByDept} />
        </SectionCard>
      </section>

      <section
        className={`grid gap-6 lg:grid-cols-3 ${
          currentUser ? "" : "pointer-events-none opacity-60"
        }`}
      >
        <SectionCard title="Incident Summary" description="Open vs resolved incidents.">
          <div className="grid gap-3 md:grid-cols-3">
            <StatCard label="Open" value={incidentSummary.open} />
            <StatCard label="Resolved" value={incidentSummary.resolved} />
            <StatCard label="Total" value={incidentSummary.total} />
          </div>
        </SectionCard>
        <SectionCard title="Vendor Compliance" description="BAA + assessment status.">
          <div className="grid gap-3">
            <StatCard label="Compliant" value={vendorSummary.compliant} />
            <StatCard label="At risk" value={vendorSummary.atRisk} />
            <StatCard label="Non-compliant" value={vendorSummary.nonCompliant} />
          </div>
        </SectionCard>
        <SectionCard title="Report Notes" description="Printable output tips.">
          <p className="text-sm text-slate-600">
            Use the Print Report button to generate a PDF-ready snapshot for your
            compliance binders.
          </p>
        </SectionCard>
      </section>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          header, nav, button, input, select, textarea {
            display: none !important;
          }
          main {
            padding: 0 !important;
          }
        }
      `}</style>
    </main>
  )
}
