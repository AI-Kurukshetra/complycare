"use client"

import { Button } from "@/components/ui/button"
import type { PolicyGap } from "@/types/compliance"

type PolicyGapListProps = {
  gaps: PolicyGap[]
}

export function PolicyGapList({ gaps }: PolicyGapListProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Policy Gap Suggestions</h2>
          <p className="text-sm text-slate-500">Top missing policies based on your answers.</p>
        </div>
        <Button variant="outline" size="sm">
          View Templates
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {gaps.map((gap) => (
          <div key={gap.id} className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{gap.title}</p>
                <p className="mt-1 text-xs text-slate-500">{gap.description}</p>
                <p className="mt-2 text-xs text-cyan-700">{gap.impact}</p>
              </div>
              <Button size="xs" variant="secondary">
                Add template
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
