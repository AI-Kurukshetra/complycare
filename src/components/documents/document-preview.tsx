import { Button } from "@/components/ui/button"
import type { DocumentRecord } from "@/hooks/useDocuments"

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

export function DocumentPreview({
  document,
  versions,
  onDownload,
  downloading,
}: {
  document: DocumentRecord | null
  versions: DocumentRecord[]
  onDownload: (doc: DocumentRecord) => void
  downloading?: boolean
}) {
  if (!document) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-slate-500">
        Select a document to view metadata, download options, and version history.
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{document.fileName}</p>
          <p className="mt-1 text-xs text-slate-500">
            Uploaded {formatDate(document.createdAt)} · Version {document.version}
          </p>
        </div>
        <Button size="sm" onClick={() => onDownload(document)} disabled={downloading}>
          {downloading ? "Preparing..." : "Download"}
        </Button>
      </div>

      <div className="mt-4 grid gap-2 text-xs text-slate-600">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Category</span>
          <span className="font-semibold text-slate-700">{document.category}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">File size</span>
          <span className="font-semibold text-slate-700">{formatFileSize(document.fileSize)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Mime type</span>
          <span className="font-semibold text-slate-700">{document.mimeType ?? "-"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Uploader</span>
          <span className="font-semibold text-slate-700">
            {document.uploadedBy ? document.uploadedBy.slice(0, 8) : "Unknown"}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Tags
        </p>
        {document.tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {document.tags.map((tag) => (
              <span
                key={`${document.id}-${tag}`}
                className="rounded-full bg-cyan-50 px-2 py-1 text-[11px] text-cyan-700"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-400">No tags assigned yet.</p>
        )}
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Version History
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {versions.length === 0 ? (
            <p className="text-xs text-slate-400">No additional versions yet.</p>
          ) : (
            versions.map((version) => (
              <div
                key={version.id}
                className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-xs ${
                  version.id === document.id
                    ? "border-cyan-200 bg-cyan-50/60"
                    : "border-slate-100 bg-slate-50"
                }`}
              >
                <div>
                  <p className="font-semibold text-slate-700">
                    Version {version.version}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {formatDate(version.createdAt)} · {version.uploadedBy?.slice(0, 8) ?? "Unknown"}
                  </p>
                </div>
                <Button size="xs" variant="outline" onClick={() => onDownload(version)}>
                  Download
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
