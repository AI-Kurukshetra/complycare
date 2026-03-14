"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { AuthPanel } from "@/components/auth-panel"
import { EmptyState } from "@/components/ui/empty-state"
import { SectionCard } from "@/components/ui/section-card"
import { StatCard } from "@/components/ui/stat-card"
import { DashboardHeader } from "@/components/dashboard-header"
import { OrgSettingsCard } from "@/components/org-settings-card"
import { AuthRequiredBanner } from "@/components/auth-required-banner"
import { useGovernance } from "@/hooks/use-governance"
import { PolicyImpactAlert } from "@/components/governance/policy-impact-alert"
import { PolicyGapReport } from "@/components/governance/policy-gap-report"

const navLinks = [
  { label: "Open Security", href: "/security" },
  { label: "Operations", href: "/operations" },
]

export function GovernanceDashboard() {
  const {
    orgName,
    orgType,
    setOrgName,
    setOrgType,
    risks,
    vendors,
    accessReviews,
    saving,
    reporting,
    addRisk,
    addMitigation,
    addVendor,
    addVendorAssessment,
    addBaa,
    addAccessReview,
    updateAccessDecision,
  } = useGovernance()

  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [riskTitle, setRiskTitle] = useState("Unencrypted legacy server")
  const [riskSeverity, setRiskSeverity] = useState<"low" | "medium" | "high">("high")
  const [mitigationText, setMitigationText] = useState("")
  const [mitigationDate, setMitigationDate] = useState("")

  const [vendorName, setVendorName] = useState("Cloud Billing Vendor")
  const [vendorCriticality, setVendorCriticality] = useState<"low" | "medium" | "high">("medium")
  const [assessmentScore, setAssessmentScore] = useState(72)
  const [assessmentStatus, setAssessmentStatus] = useState<
    "pending" | "approved" | "needs_followup"
  >("pending")
  const [assessmentNotes, setAssessmentNotes] = useState("")
  const [baaStatus, setBaaStatus] = useState<"pending" | "signed" | "expired">("pending")
  const [baaRenewal, setBaaRenewal] = useState("")

  const [reviewTitle, setReviewTitle] = useState("Q2 Access Review")
  const [reviewSubjects, setReviewSubjects] = useState("EHR Admin, Billing Lead, Lab Tech")

  const riskChart = useMemo(() => {
    const total = Math.max(risks.length, 1)
    const open = risks.filter((risk) => risk.status !== "closed").length
    const mitigated = risks.filter((risk) => risk.status === "mitigating").length
    return {
      open: Math.round((open / total) * 100),
      mitigated: Math.round((mitigated / total) * 100),
    }
  }, [risks])

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <DashboardHeader
        eyebrow="Phase 3 Governance"
        title="Risk & Vendor Management"
        description="Track risks, vendor assessments, BAAs, and access reviews for ongoing HIPAA compliance."
        saving={saving}
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

      <PolicyImpactAlert active={Boolean(currentUser)} />

      <section
        className={`grid gap-6 md:grid-cols-[1.1fr_0.9fr] ${
          currentUser ? "" : "pointer-events-none opacity-60"
        }`}
      >
        <div className="flex flex-col gap-6">
          <SectionCard
            title="AI Policy Gap Report"
            description="Claude analyzes your policies against HIPAA requirements."
          >
            <PolicyGapReport active={Boolean(currentUser)} />
          </SectionCard>

          <SectionCard title="Risk Register" description="Track active risks and mitigation plans.">
            <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={riskTitle}
                onChange={(event) => setRiskTitle(event.target.value)}
              />
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={riskSeverity}
                onChange={(event) => setRiskSeverity(event.target.value as "low" | "medium" | "high")}
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>
            <Button className="mt-3" onClick={() => addRisk(riskTitle, riskSeverity)}>
              Add Risk
            </Button>

            <div className="mt-5 flex flex-col gap-3">
              {risks.length === 0 ? (
                <EmptyState
                  title="No risks logged"
                  description="Add a risk to start tracking mitigation."
                />
              ) : (
                risks.map((risk) => (
                  <div key={risk.id} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{risk.title}</p>
                        <p className="text-xs text-slate-500">Severity: {risk.severity}</p>
                      </div>
                      <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                        {risk.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-col gap-2">
                      {risk.actions.map((action) => (
                        <div
                          key={action.id}
                          className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
                        >
                          {action.action}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-[2fr_1fr]">
                      <input
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        placeholder="Mitigation action"
                        value={mitigationText}
                        onChange={(event) => setMitigationText(event.target.value)}
                      />
                      <input
                        type="date"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        value={mitigationDate}
                        onChange={(event) => setMitigationDate(event.target.value)}
                      />
                    </div>
                    <Button
                      className="mt-2"
                      size="sm"
                      onClick={() =>
                        mitigationText && addMitigation(risk.id, mitigationText, mitigationDate)
                      }
                    >
                      Add Mitigation
                    </Button>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Access Control Reviews"
            description="Review user access for minimum necessary access."
          >
            <div className="flex flex-col gap-3">
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={reviewTitle}
                onChange={(event) => setReviewTitle(event.target.value)}
              />
              <textarea
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                rows={3}
                placeholder="Comma-separated staff or role list"
                value={reviewSubjects}
                onChange={(event) => setReviewSubjects(event.target.value)}
              />
              <Button
                onClick={() =>
                  addAccessReview(
                    reviewTitle,
                    reviewSubjects
                      .split(",")
                      .map((subject) => subject.trim())
                      .filter(Boolean)
                  )
                }
              >
                Start Review
              </Button>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {accessReviews.length === 0 ? (
                <EmptyState
                  title="No access reviews yet"
                  description="Create a review to audit privileged access."
                />
              ) : (
                accessReviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-slate-100 p-4">
                    <p className="text-sm font-semibold text-slate-900">{review.title}</p>
                    <div className="mt-3 flex flex-col gap-2">
                      {review.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
                        >
                          <span>{item.subject}</span>
                          <select
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                            value={item.decision}
                            onChange={(event) =>
                              updateAccessDecision(review.id, item.id, event.target.value as "pending" | "approved" | "revoked")
                            }
                          >
                            <option value="pending">pending</option>
                            <option value="approved">approved</option>
                            <option value="revoked">revoked</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6">
          <SectionCard
            title="Executive Reporting"
            description="Coverage trends and key health metrics."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <StatCard label="Open risks" value={reporting.openRisks} />
              <StatCard label="Vendor assessments" value={reporting.vendorCoverage} />
              <StatCard label="Signed BAAs" value={reporting.baaCoverage} />
              <StatCard label="Access review completion" value={`${reporting.reviewScore}%`} />
            </div>

            <div className="mt-4">
              <p className="text-xs text-slate-500">Risk status mix</p>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-rose-500"
                  style={{ width: `${riskChart.open}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">Mitigating: {riskChart.mitigated}%</p>
            </div>
          </SectionCard>

          <SectionCard
            title="Vendor Risk Assessments"
            description="Track vendor posture and BAA status."
          >
            <div className="flex flex-col gap-3">
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={vendorName}
                onChange={(event) => setVendorName(event.target.value)}
              />
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={vendorCriticality}
                onChange={(event) => setVendorCriticality(event.target.value as "low" | "medium" | "high")}
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
              <Button onClick={() => addVendor(vendorName, vendorCriticality)}>Add Vendor</Button>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {vendors.length === 0 ? (
                <EmptyState
                  title="No vendors tracked"
                  description="Add a vendor to begin assessments and BAAs."
                />
              ) : (
                vendors.map((vendor) => (
                  <div key={vendor.id} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{vendor.name}</p>
                        <p className="text-xs text-slate-500">Criticality: {vendor.criticality}</p>
                      </div>
                      <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                        {vendor.status}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Assessment score</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {vendor.assessment?.score ?? "Not assessed"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">BAA status</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {vendor.baa?.status ?? "Not set"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-col gap-2">
                      <input
                        type="number"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        value={assessmentScore}
                        onChange={(event) => setAssessmentScore(Number(event.target.value))}
                      />
                      <select
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        value={assessmentStatus}
                        onChange={(event) => setAssessmentStatus(event.target.value as "pending" | "approved" | "needs_followup")}
                      >
                        <option value="pending">pending</option>
                        <option value="approved">approved</option>
                        <option value="needs_followup">needs_followup</option>
                      </select>
                      <input
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        placeholder="Assessment notes"
                        value={assessmentNotes}
                        onChange={(event) => setAssessmentNotes(event.target.value)}
                      />
                      <Button
                        size="sm"
                        onClick={() =>
                          addVendorAssessment(
                            vendor.id,
                            assessmentScore,
                            assessmentStatus,
                            assessmentNotes
                          )
                        }
                      >
                        Save Assessment
                      </Button>
                    </div>

                    <div className="mt-3 flex flex-col gap-2">
                      <select
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        value={baaStatus}
                        onChange={(event) => setBaaStatus(event.target.value as "pending" | "signed" | "expired")}
                      >
                        <option value="pending">pending</option>
                        <option value="signed">signed</option>
                        <option value="expired">expired</option>
                      </select>
                      <input
                        type="date"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        value={baaRenewal}
                        onChange={(event) => setBaaRenewal(event.target.value)}
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => addBaa(vendor.id, baaStatus, baaRenewal)}
                      >
                        Update BAA
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </section>
    </main>
  )
}
