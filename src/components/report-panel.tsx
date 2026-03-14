"use client"

import { Button } from "@/components/ui/button"
import type { ReportSummary } from "@/types/compliance"

type ReportPanelProps = {
  orgName: string
  orgType: string
  report: ReportSummary
  completion: number
  saveStatus: "idle" | "saving" | "saved" | "error"
  saveError?: string | null
  onSaveSnapshot: () => void
  onExportPdf: () => void
  onDownloadPacket: () => void
}

export function ReportPanel({
  orgName,
  orgType,
  report,
  completion,
  saveStatus,
  saveError,
  onSaveSnapshot,
  onExportPdf,
  onDownloadPacket,
}: ReportPanelProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Executive Report
          </p>
          <h2 className="text-lg font-semibold text-slate-900">Risk Snapshot</h2>
          <p className="text-sm text-slate-500">{orgName || "Organization"} · {orgType}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onSaveSnapshot}>
            {saveStatus === "saving" ? "Saving..." : "Save Snapshot"}
          </Button>
          <Button variant="outline" size="sm" onClick={onExportPdf}>
            Export PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={onDownloadPacket}>
            Export Audit Package
          </Button>
        </div>
      </div>

      {saveStatus !== "idle" ? (
        <p
          className={`mt-3 text-xs font-medium ${
            saveStatus === "error" ? "text-rose-600" : "text-emerald-600"
          }`}
        >
          {saveStatus === "saving"
            ? "Saving snapshot to Supabase..."
            : saveStatus === "saved"
              ? "Snapshot saved to Supabase."
              : saveError ?? "Save failed. Check Supabase configuration."}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Compliance</p>
            <p className="text-2xl font-semibold text-slate-900">{report.complianceScore}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Risk</p>
            <p className="text-2xl font-semibold text-rose-600">{report.riskScore}</p>
          </div>
        </div>
        <p className="text-sm text-slate-600">Risk level: {report.riskLevel}</p>
        {completion < 60 ? (
          <p className="text-xs text-amber-600">
            Complete more questions to unlock a full report snapshot.
          </p>
        ) : null}
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Top gaps</p>
        <div className="mt-2 flex flex-col gap-2">
          {report.topGaps.map((gap) => (
            <div key={gap.id} className="rounded-xl border border-slate-100 bg-white px-3 py-2">
              <p className="text-sm font-semibold text-slate-900">{gap.title}</p>
              <p className="text-xs text-slate-500">{gap.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Recommended actions
        </p>
        <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
          {report.recommendedActions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-400">
          Export Audit Package generates a multi-page PDF for auditors.
        </p>
      </div>
    </div>
  )
}
