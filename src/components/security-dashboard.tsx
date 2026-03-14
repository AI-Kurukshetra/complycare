"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AuthPanel } from "@/components/auth-panel"
import { EmptyState } from "@/components/ui/empty-state"
import { SectionCard } from "@/components/ui/section-card"
import { StatCard } from "@/components/ui/stat-card"
import { ListItem } from "@/components/ui/list-item"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { DashboardHeader } from "@/components/dashboard-header"
import { OrgSettingsCard } from "@/components/org-settings-card"
import { AuthRequiredBanner } from "@/components/auth-required-banner"
import { useSecurity } from "@/hooks/use-security"
import { RegulatoryAlertsPanel } from "@/components/security/regulatory-alerts-panel"
import { VulnerabilityScanner } from "@/components/security/vulnerability-scanner"
import { AccessControlMatrix } from "@/components/security/access-control-matrix"
import { useAccessControl } from "@/hooks/useAccessControl"
import { OcrPenaltyPanel } from "@/components/security/ocr-penalty-panel"

const navLinks = [
  { label: "Governance", href: "/governance" },
  { label: "AI Insights", href: "/insights" },
]

export function SecurityDashboard() {
  const {
    orgName,
    orgType,
    setOrgName,
    setOrgType,
    vulnerabilities,
    checks,
    updates,
    saving,
    summary,
    addVulnerability,
    addScanResults,
    addCheck,
    updateCheckStatus,
    regulatoryLoading,
    refreshRegulatoryUpdates,
  } = useSecurity()

  const accessControl = useAccessControl(orgName, orgType)

  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [vulnTitle, setVulnTitle] = useState("Legacy server missing patches")
  const [vulnSeverity, setVulnSeverity] = useState<"low" | "medium" | "high">("high")
  const [vulnAsset, setVulnAsset] = useState("EHR VM-02")

  const [checkTitle, setCheckTitle] = useState("Daily access log review")
  const [vulnPage, setVulnPage] = useState(1)
  const vulnPageSize = 20

  const vulnPageCount = Math.max(1, Math.ceil(vulnerabilities.length / vulnPageSize))
  const pagedVulnerabilities = useMemo(
    () => vulnerabilities.slice((vulnPage - 1) * vulnPageSize, vulnPage * vulnPageSize),
    [vulnPage, vulnPageSize, vulnerabilities]
  )

  useEffect(() => {
    if (currentUser) {
      void refreshRegulatoryUpdates()
    }
  }, [currentUser, refreshRegulatoryUpdates])

  useEffect(() => {
    function reset() { setVulnPage(1) }
    reset()
  }, [vulnerabilities.length])

  useEffect(() => {
    function clamp() { if (vulnPage > vulnPageCount) setVulnPage(vulnPageCount) }
    clamp()
  }, [vulnPage, vulnPageCount])

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <DashboardHeader
        eyebrow="Phase 4 Security"
        title="Security & Monitoring"
        description="Track vulnerabilities, continuous compliance checks, and regulatory updates."
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

      <section
        className={`grid gap-6 md:grid-cols-[1.1fr_0.9fr] ${
          currentUser ? "" : "pointer-events-none opacity-60"
        }`}
      >
        <div className="flex flex-col gap-6">
          <SectionCard title="Vulnerability Scanning" description="Run scans and prioritize remediation.">
            <VulnerabilityScanner
              orgName={orgName}
              vulnerabilities={vulnerabilities}
              onAddVulnerabilities={addScanResults}
            />

            <div className="mt-6 flex flex-col gap-3">
              <p className="text-sm font-semibold text-slate-900">Manual logging</p>
              <div className="flex flex-col gap-3">
                <input
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={vulnTitle}
                  onChange={(event) => setVulnTitle(event.target.value)}
                />
                <select
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={vulnSeverity}
                  onChange={(event) =>
                    setVulnSeverity(event.target.value as "low" | "medium" | "high")
                  }
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
                <input
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={vulnAsset}
                  onChange={(event) => setVulnAsset(event.target.value)}
                  placeholder="Impacted asset"
                />
                <Button onClick={() => addVulnerability(vulnTitle, vulnSeverity, vulnAsset)}>
                  Log Vulnerability
                </Button>
              </div>

              <div className="mt-2 flex flex-col gap-2">
                {vulnerabilities.length === 0 ? (
                  <EmptyState
                    title="No vulnerabilities logged"
                    description="Run a scan or log the first vulnerability."
                  />
                ) : (
                  <>
                    {pagedVulnerabilities.map((item) => (
                      <ListItem
                        key={item.id}
                        title={item.title}
                        subtitle={`Severity: ${item.severity} · Asset: ${item.asset}`}
                      />
                    ))}
                    <PaginationControls
                      page={vulnPage}
                      pageCount={vulnPageCount}
                      totalItems={vulnerabilities.length}
                      pageSize={vulnPageSize}
                      onPageChange={setVulnPage}
                    />
                  </>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Continuous Compliance Monitoring"
            description="Track configuration drift and reviews."
          >
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={checkTitle}
                onChange={(event) => setCheckTitle(event.target.value)}
              />
              <Button onClick={() => addCheck(checkTitle)}>Add Check</Button>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {checks.length === 0 ? (
                <EmptyState
                  title="No checks created"
                  description="Add a compliance check to track control drift."
                />
              ) : (
                checks.map((check) => (
                  <div
                    key={check.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{check.title}</p>
                      <p className="text-xs text-slate-500">Status: {check.status}</p>
                    </div>
                    <select
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                      value={check.status}
                      onChange={(event) =>
                        updateCheckStatus(
                          check.id,
                          event.target.value as "drift" | "compliant" | "needs_review"
                        )
                      }
                    >
                      <option value="drift">drift</option>
                      <option value="compliant">compliant</option>
                      <option value="needs_review">needs_review</option>
                    </select>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Access Control Matrix"
            description="Review user access and flag excessive permissions."
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Click any cell to flag excessive access.</span>
              {accessControl.saving ? <span>Saving review...</span> : null}
            </div>
            <div className="mt-4">
              <AccessControlMatrix
                categories={accessControl.categories}
                rows={accessControl.rows}
                onToggleFlag={accessControl.toggleFlag}
                isFlagged={accessControl.isFlagged}
              />
            </div>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6">
          <SectionCard title="Security Summary" description="Key operational signals at a glance.">
            <div className="grid gap-3 md:grid-cols-2">
              <StatCard label="Open vulnerabilities" value={summary.openVulns} />
              <StatCard label="Checks in drift" value={summary.driftChecks} />
            </div>
          </SectionCard>

          <SectionCard
            title="Regulatory Change Tracking"
            description="Monitor HIPAA updates with impact assessment."
          >
            <RegulatoryAlertsPanel
              updates={updates}
              loading={regulatoryLoading}
              onRefresh={refreshRegulatoryUpdates}
            />
          </SectionCard>

          <SectionCard
            title="IoT Device Inventory"
            description="Monitor connected medical devices and risk posture."
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Track device compliance status, encryption, and exposure.
              </p>
              <Button asChild size="sm" variant="outline">
                <Link href="/security/iot">Open inventory</Link>
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            title="OCR Enforcement"
            description="Recent HIPAA enforcement actions and penalty insights."
          >
            <OcrPenaltyPanel />
          </SectionCard>
        </div>
      </section>
    </main>
  )
}
