"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  assessmentQuestions,
  evidenceCategories,
  regulationAlert,
} from "@/lib/compliance-data"
import {
  useBenchmarkSnapshot,
  useComplianceScore,
  useReportSummary,
  useRiskTimeline,
} from "@/lib/compliance-logic"
import { LIST_LIMIT } from "@/lib/query-limits"
import type { AssessmentAnswerMap, EvidenceItem } from "@/types/compliance"
import { ensureOrgMembership, ensureOrganization } from "@/services/operations"
import { createClient } from "@/utils/supabase/client"
import { AssessmentForm } from "@/components/assessment-form"
import { BenchmarkPanel } from "@/components/benchmark-panel"
import { EvidenceUploader } from "@/components/evidence-uploader"
import { PolicyGapList } from "@/components/policy-gap-list"
import { RegulationAlert } from "@/components/regulation-alert"
import { ReportPanel } from "@/components/report-panel"
import { RiskTimeline } from "@/components/risk-timeline"

const orgTypes = ["Primary Care", "Dental", "Behavioral Health", "Specialty Clinic", "Urgent Care"]

export function ComplianceCommandCenter() {
  const [orgName, setOrgName] = useState("Northwind Family Clinic")
  const [orgType, setOrgType] = useState(orgTypes[0])
  const [answers, setAnswers] = useState<AssessmentAnswerMap>({})
  const [evidence, setEvidence] = useState<EvidenceItem[]>([])
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [lastAutoSaveSig, setLastAutoSaveSig] = useState<string | null>(null)

  useEffect(() => {
    async function loadSavedAnswers() {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      if (!userId) return

      const { data: membership } = await supabase
        .from("org_members")
        .select("organization_id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle()

      const orgId = membership?.organization_id
      if (!orgId) return
      setOrganizationId(orgId)

      const { data: assessment } = await supabase
        .from("assessments")
        .select("answers")
        .eq("organization_id", orgId)
        .not("answers", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!assessment?.answers || typeof assessment.answers !== "object") return

      const saved = assessment.answers as Record<string, { value: string; label: string; score: number } | null>
      const restored: AssessmentAnswerMap = {}
      for (const [qId, opt] of Object.entries(saved)) {
        if (opt && typeof opt === "object" && "value" in opt) {
          restored[qId] = opt as { value: string; label: string; score: number }
        }
      }
      if (Object.keys(restored).length > 0) setAnswers(restored)
    }
    void loadSavedAnswers()
  }, [])

  const reportSummary = useReportSummary(assessmentQuestions, answers)
  const benchmark = useBenchmarkSnapshot(reportSummary.complianceScore)
  const timeline = useRiskTimeline(
    reportSummary.complianceScore,
    reportSummary.recommendedActions.length,
    evidence.length
  )

  function handleAnswer(questionId: string, optionValue: string) {
    const question = assessmentQuestions.find((item) => item.id === questionId)
    const option = question?.options.find((item) => item.value === optionValue)

    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }))
  }

  function handleAddEvidence(item: EvidenceItem) {
    setEvidence((prev) => [item, ...prev].slice(0, 5))
  }

  function handleExportReport() {
    void (async () => {
      const { downloadRiskSnapshotPdf } = await import("@/lib/pdf")
      downloadRiskSnapshotPdf({
        orgName,
        orgType,
        report: reportSummary,
        evidence,
      })
    })()
  }

  function handleDownloadPacket() {
    void (async () => {
      let orgId = organizationId

      if (!orgId) {
        orgId = await ensureOrganization(orgName, orgType)
        await ensureOrgMembership(orgId, "owner")
        setOrganizationId(orgId)
      }

      if (!orgId) return

      const supabase = createClient()

      const { data: assessments } = await supabase
        .from("assessments")
        .select("compliance_score, created_at")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false })
        .limit(12)

      const complianceHistory = (assessments ?? []).map((row) => ({
        date: row.created_at,
        score: row.compliance_score,
      }))

      const { data: policyRows } = await supabase
        .from("policy_instances")
        .select("status, last_reviewed, policy_templates (title, category)")
        .eq("organization_id", orgId)
        .limit(LIST_LIMIT)

      const policies = (policyRows ?? []).map((row) => {
        const template = (row as { policy_templates?: { title?: string; category?: string } })
          .policy_templates
        return {
          title: template?.title ?? "Untitled policy",
          category: template?.category ?? "General",
          status: (row.status as string) ?? "draft",
          lastReviewed: (row.last_reviewed as string | null) ?? null,
        }
      })

      const { data: risks } = await supabase
        .from("risks")
        .select("id, title, severity, status, created_at")
        .eq("organization_id", orgId)
        .limit(LIST_LIMIT)

      const riskIds = (risks ?? []).map((risk) => risk.id)
      const { data: riskActions } = riskIds.length
        ? await supabase
            .from("risk_actions")
            .select("risk_id, action, status, due_date")
            .in("risk_id", riskIds)
            .limit(LIST_LIMIT)
        : { data: [] }

      const actionsByRisk = new Map<string, Array<{ action: string; status: string; dueDate: string | null }>>()
      ;(riskActions ?? []).forEach((action) => {
        if (!action.risk_id) return
        const list = actionsByRisk.get(action.risk_id) ?? []
        list.push({ action: action.action, status: action.status, dueDate: action.due_date ?? null })
        actionsByRisk.set(action.risk_id, list)
      })

      const riskEntries = (risks ?? []).map((risk) => ({
        title: risk.title,
        severity: risk.severity,
        status: risk.status,
        createdAt: risk.created_at,
        actions: actionsByRisk.get(risk.id) ?? [],
      }))

      const { data: modules } = await supabase
        .from("training_sims")
        .select("id, title")
        .eq("organization_id", orgId)
        .limit(LIST_LIMIT)

      const moduleMap = new Map((modules ?? []).map((module) => [module.id, module.title]))
      const moduleIds = Array.from(moduleMap.keys())
      const { data: completions } = moduleIds.length
        ? await supabase
            .from("training_completions")
            .select("module_id, score, completed_at")
            .in("module_id", moduleIds)
            .limit(LIST_LIMIT)
        : { data: [] }

      const trainingRecords = (completions ?? []).map((completion) => ({
        module: moduleMap.get(completion.module_id) ?? "Training module",
        completedAt: completion.completed_at ?? null,
        score: completion.score ?? null,
      }))

      const totalCompletions = trainingRecords.length
      const averageScore = totalCompletions
        ? Math.round(
            trainingRecords.reduce((sum, record) => sum + (record.score ?? 0), 0) /
              totalCompletions
          )
        : 0

      const { data: incidents } = await supabase
        .from("incidents")
        .select("title, severity, status, created_at")
        .eq("organization_id", orgId)
        .limit(LIST_LIMIT)

      const { data: vendors } = await supabase
        .from("vendors")
        .select("id, name, status")
        .eq("organization_id", orgId)
        .limit(LIST_LIMIT)

      const vendorIds = (vendors ?? []).map((vendor) => vendor.id)
      const { data: baas } = vendorIds.length
        ? await supabase
            .from("baas")
            .select("vendor_id, status")
            .in("vendor_id", vendorIds)
            .limit(LIST_LIMIT)
        : { data: [] }
      const { data: vendorAssessments } = vendorIds.length
        ? await supabase
            .from("vendor_assessments")
            .select("vendor_id, status, created_at")
            .in("vendor_id", vendorIds)
            .order("created_at", { ascending: false })
            .limit(LIST_LIMIT)
        : { data: [] }

      const baaMap = new Map(
        (baas ?? [])
          .filter((item): item is typeof item & { vendor_id: string } => Boolean(item.vendor_id))
          .map((item) => [item.vendor_id, item.status])
      )
      const assessmentMap = new Map<string, string>()
      ;(vendorAssessments ?? []).forEach((item) => {
        if (item.vendor_id && !assessmentMap.has(item.vendor_id)) {
          assessmentMap.set(item.vendor_id, item.status)
        }
      })

      const vendorEntries = (vendors ?? []).map((vendor) => ({
        name: vendor.name,
        status: vendor.status,
        baaStatus: baaMap.get(vendor.id) ?? null,
        assessmentStatus: assessmentMap.get(vendor.id) ?? null,
      }))

      const { generateAuditPackagePdf } = await import("@/lib/audit-package-generator")
      const { blob, fileName } = generateAuditPackagePdf({
        orgName,
        orgType,
        report: reportSummary,
        evidence,
        complianceHistory,
        policies,
        risks: riskEntries,
        training: {
          summary: { totalCompletions, averageScore },
          records: trainingRecords,
        },
        incidents:
          incidents?.map((incident) => ({
            title: incident.title,
            severity: incident.severity,
            status: incident.status,
            createdAt: incident.created_at,
          })) ?? [],
        vendors: vendorEntries,
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      link.click()
      URL.revokeObjectURL(url)
    })()
  }

  const handleSaveSnapshot = useCallback(async () => {
    setSaveStatus("saving")
    setSaveError(null)
    try {
      let orgId = organizationId

      if (!orgId) {
        orgId = await ensureOrganization(orgName, orgType)
        await ensureOrgMembership(orgId, "owner")
        setOrganizationId(orgId)
      }

      if (!orgId) throw new Error("Organization not created")

      const supabase = createClient()
      const answersPayload = Object.fromEntries(
        Object.entries(answers).map(([questionId, option]) => [
          questionId,
          option
            ? {
                value: option.value,
                label: option.label,
                score: option.score,
              }
            : null,
        ])
      )

      const { data: assessmentData, error: assessmentError } = await supabase
        .from("assessments")
        .insert({
          organization_id: orgId,
          compliance_score: reportSummary.complianceScore,
          risk_score: reportSummary.riskScore,
          risk_level: reportSummary.riskLevel,
          answers: answersPayload,
        })
        .select("id")
        .single()

      if (assessmentError) throw assessmentError
      const assessmentId = assessmentData?.id

      if (assessmentId && evidence.length) {
        const { error: evidenceError } = await supabase.from("evidence_items").insert(
          evidence.map((item) => ({
            assessment_id: assessmentId,
            file_name: item.fileName,
            file_type: item.fileType,
            category: item.category,
            summary: item.summary,
            extracted: item.extracted,
          }))
        )
        if (evidenceError) throw evidenceError
      }

      if (assessmentId) {
        const payload = {
          summary: reportSummary,
          benchmark,
          timeline,
          evidence: evidence.map((item) => ({
            fileName: item.fileName,
            category: item.category,
            summary: item.summary,
          })),
          organization: { name: orgName, type: orgType },
        }

        const { error: reportError } = await supabase.from("reports").insert({
          assessment_id: assessmentId,
          payload,
        })

        if (reportError) throw reportError
      }

      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2500)
    } catch (error) {
      const maybeError = error as {
        message?: unknown
        details?: unknown
        hint?: unknown
        code?: unknown
      }
      const code = typeof maybeError.code === "string" ? maybeError.code : null
      const parts = [
        typeof maybeError.message === "string" ? maybeError.message : null,
        typeof maybeError.details === "string" ? maybeError.details : null,
        typeof maybeError.hint === "string" ? maybeError.hint : null,
        code ? `code: ${code}` : null,
      ].filter(Boolean)

      const formattedMessage =
        code === "42P17"
          ? "Database RLS policy recursion detected on org_members (42P17). Apply the latest Supabase RLS fix migration on the active project."
          : parts.length > 0
            ? parts.join(" | ")
            : "Save failed. Check Supabase configuration."

      console.warn("Save snapshot failed:", error)
      setSaveError(formattedMessage)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    }
  }, [answers, benchmark, evidence, orgName, orgType, organizationId, reportSummary, timeline])

  const completion = Math.round(
    (Object.values(answers).filter(Boolean).length / assessmentQuestions.length) * 100
  )
  const { complianceScore, riskScore } = useComplianceScore(assessmentQuestions, answers)

  const autoSaveSignature = useMemo(() => {
    const answersSnapshot = Object.entries(answers).reduce<Record<string, string | null>>(
      (acc, [key, option]) => {
        acc[key] = option?.value ?? null
        return acc
      },
      {}
    )
    return JSON.stringify({
      orgName,
      orgType,
      answersSnapshot,
      evidenceCount: evidence.length,
      complianceScore,
      riskScore,
    })
  }, [answers, complianceScore, evidence.length, orgName, orgType, riskScore])

  useEffect(() => {
    if (completion < 100) return
    if (saveStatus !== "idle") return
    if (autoSaveSignature === lastAutoSaveSig) return

    setLastAutoSaveSig(autoSaveSignature)
    void handleSaveSnapshot()
  }, [autoSaveSignature, completion, handleSaveSnapshot, lastAutoSaveSig, saveStatus])

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at top, rgba(14,116,144,0.2), transparent 55%), radial-gradient(circle at bottom, rgba(14,116,144,0.12), transparent 55%)" }} />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800">
                HIPAA Risk Snapshot
              </p>
              <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
                Compliance Command Center
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Complete a guided HIPAA risk sprint, upload evidence, and generate an audit-ready
                packet in under 10 minutes.
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl border border-cyan-100 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
              <span className="text-xs uppercase tracking-[0.25em] text-slate-500">Sprint</span>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-semibold text-slate-900">{completion}%</span>
                <span className="text-xs text-slate-500">complete</span>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/operations">Open Operations</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/governance">Open Governance</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Compliance</p>
              <p className="text-2xl font-semibold text-slate-900">{complianceScore}</p>
              <p className="text-xs text-slate-500">out of 100</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Risk</p>
              <p className="text-2xl font-semibold text-rose-600">{riskScore}</p>
              <p className="text-xs text-slate-500">lower is better</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Benchmark</p>
              <p className="text-2xl font-semibold text-slate-900">{benchmark.percentile}th</p>
              <p className="text-xs text-slate-500">percentile vs peers</p>
            </div>
          </div>
        </header>

        <RegulationAlert alert={regulationAlert} />

        <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Organization Profile</h2>
                  <p className="text-sm text-slate-500">
                    Customize the report header before exporting.
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Save Profile
                </Button>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Organization name
                  <input
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-400 focus:outline-none"
                    value={orgName}
                    onChange={(event) => setOrgName(event.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Practice type
                  <select
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-400 focus:outline-none"
                    value={orgType}
                    onChange={(event) => setOrgType(event.target.value)}
                  >
                    {orgTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <AssessmentForm
              questions={assessmentQuestions}
              answers={answers}
              onAnswer={handleAnswer}
            />
          </div>

          <div className="flex flex-col gap-6">
            <ReportPanel
              orgName={orgName}
              orgType={orgType}
              report={reportSummary}
              completion={completion}
              saveStatus={saveStatus}
              saveError={saveError}
              onSaveSnapshot={handleSaveSnapshot}
              onExportPdf={handleExportReport}
              onDownloadPacket={handleDownloadPacket}
            />
            <BenchmarkPanel snapshot={benchmark} />
            <RiskTimeline points={timeline} />
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-[1fr_1fr]">
          <EvidenceUploader
            categories={evidenceCategories}
            evidence={evidence}
            onAddEvidence={handleAddEvidence}
          />
          <PolicyGapList gaps={reportSummary.topGaps} />
        </section>

        <section className="rounded-3xl border border-cyan-100 bg-cyan-950 px-6 py-5 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Audit Packet</p>
              <h3 className="text-xl font-semibold">Export everything in one click</h3>
              <p className="mt-1 text-sm text-cyan-100">
                Includes risk report, policy gaps, and evidence index.
              </p>
            </div>
            <Button size="lg" onClick={handleDownloadPacket}>
              Download Audit Packet
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
