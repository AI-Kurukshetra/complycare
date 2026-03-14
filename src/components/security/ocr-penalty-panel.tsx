"use client"

import { useMemo } from "react"
import { fetchOcrPenalties, summarizeTopViolations } from "@/services/ocr-database"

export function OcrPenaltyPanel() {
  const penalties = useMemo(() => fetchOcrPenalties(), [])
  const topViolations = useMemo(() => summarizeTopViolations(), [])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">OCR Enforcement</p>
        <p className="text-xs text-slate-500">
          Recent HIPAA enforcement actions from HHS OCR.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {penalties.map((penalty) => (
          <div key={penalty.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">{penalty.organization}</p>
                <p className="text-xs text-slate-500">{penalty.violationType}</p>
              </div>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                {penalty.penaltyAmount}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Settlement date: {penalty.settlementDate}</p>
            <p className="mt-2 text-sm text-slate-600">{penalty.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
          Similar organizations have faced penalties for
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {topViolations.map((violation) => (
            <span
              key={violation}
              className="rounded-full bg-white px-3 py-1 text-xs text-amber-700"
            >
              {violation}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
