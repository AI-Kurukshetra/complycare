"use client"

import type { BenchmarkSnapshot } from "@/types/compliance"

type BenchmarkPanelProps = {
  snapshot: BenchmarkSnapshot
}

export function BenchmarkPanel({ snapshot }: BenchmarkPanelProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Benchmark Snapshot</h3>
      <p className="text-sm text-slate-500">
        Mocked peer baseline for clinics of similar size.
      </p>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-3xl font-semibold text-slate-900">{snapshot.percentile}th</p>
          <p className="text-xs text-slate-500">percentile</p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <p>Peer median: {snapshot.peerMedian}</p>
          <p>Top quartile: {snapshot.peerTopQuartile}</p>
        </div>
      </div>

      <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-cyan-500"
          style={{ width: `${snapshot.percentile}%` }}
        />
      </div>
    </div>
  )
}
