"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createEvidenceSummary } from "@/lib/compliance-logic"
import type { EvidenceItem } from "@/types/compliance"

const maxEvidence = 5

type EvidenceUploaderProps = {
  categories: string[]
  evidence: EvidenceItem[]
  onAddEvidence: (item: EvidenceItem) => void
}

export function EvidenceUploader({ categories, evidence, onAddEvidence }: EvidenceUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState(categories[0] ?? "Policies")
  const [notes, setNotes] = useState("")

  function handleAdd() {
    if (!file || evidence.length >= maxEvidence) return

    const { summary, extracted } = createEvidenceSummary(file.name, category, notes)

    const item: EvidenceItem = {
      id: `${Date.now()}-${file.name}`,
      fileName: file.name,
      fileType: file.type || "document",
      sizeKb: Math.max(1, Math.round(file.size / 1024)),
      category,
      notes,
      summary,
      extracted,
      uploadedAt: new Date().toISOString(),
    }

    onAddEvidence(item)
    setFile(null)
    setNotes("")
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Evidence Upload</h2>
          <p className="text-sm text-slate-500">
            Attach up to {maxEvidence} supporting artifacts. Mock AI will summarize the file.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          AI summary
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Select file
          <input
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Evidence category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Evidence notes (optional)
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            placeholder="Describe the evidence or paste key findings to enrich the AI summary."
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </label>

        <Button onClick={handleAdd} disabled={!file || evidence.length >= maxEvidence}>
          {evidence.length >= maxEvidence ? "Evidence limit reached" : "Add Evidence"}
        </Button>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Evidence Highlights
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {evidence.length === 0 ? (
            <p className="text-sm text-slate-500">No evidence uploaded yet.</p>
          ) : (
            evidence.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-100 bg-white p-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{item.category}</span>
                  <span>{item.sizeKb} KB</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-900">{item.fileName}</p>
                <p className="mt-1 text-xs text-slate-500">{item.summary}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
