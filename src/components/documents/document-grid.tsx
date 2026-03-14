import { EmptyState } from "@/components/ui/empty-state"
import type { DocumentRecord } from "@/hooks/useDocuments"

const viewClasses = {
  grid: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
  list: "flex flex-col gap-2",
}

function getFileExtension(name: string) {
  const parts = name.split(".")
  if (parts.length < 2) return "file"
  return parts[parts.length - 1].toUpperCase()
}

function formatFileSize(size?: number | null) {
  if (!size) return "-"
  if (size < 1024) return `${size} B`
  const kb = size / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

export function DocumentGrid({
  documents,
  view,
  selectedId,
  onSelect,
}: {
  documents: DocumentRecord[]
  view: "grid" | "list"
  selectedId?: string | null
  onSelect: (doc: DocumentRecord) => void
}) {
  if (documents.length === 0) {
    return (
      <EmptyState
        title="No documents yet"
        description="Upload policies, contracts, reports, or evidence to build your repository."
      />
    )
  }

  return (
    <div className={viewClasses[view]}>
      {documents.map((doc) => {
        const isSelected = doc.id === selectedId
        const baseClasses =
          "rounded-2xl border p-4 transition hover:border-cyan-200 hover:shadow-sm"
        const activeClasses = isSelected
          ? "border-cyan-300 bg-cyan-50/60"
          : "border-slate-100 bg-white"

        return (
          <button
            key={doc.id}
            type="button"
            onClick={() => onSelect(doc)}
            className={`${baseClasses} ${activeClasses} text-left`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 line-clamp-2">
                  {doc.fileName}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Uploaded {formatDate(doc.createdAt)}
                </p>
              </div>
              <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                {getFileExtension(doc.fileName)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-1">
                Version {doc.version}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1">
                {doc.category}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1">
                {formatFileSize(doc.fileSize)}
              </span>
            </div>

            {doc.tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {doc.tags.slice(0, 3).map((tag) => (
                  <span
                    key={`${doc.id}-${tag}`}
                    className="rounded-full bg-cyan-50 px-2 py-1 text-[11px] text-cyan-700"
                  >
                    {tag}
                  </span>
                ))}
                {doc.tags.length > 3 && (
                  <span className="text-[11px] text-slate-400">
                    +{doc.tags.length - 3} more
                  </span>
                )}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-400">No tags</p>
            )}
          </button>
        )
      })}
    </div>
  )
}
