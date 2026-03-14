"use client"

import { useEffect, useMemo, useState } from "react"
import { AuthPanel } from "@/components/auth-panel"
import { AuthRequiredBanner } from "@/components/auth-required-banner"
import { DashboardHeader } from "@/components/dashboard-header"
import { DocumentGrid } from "@/components/documents/document-grid"
import { DocumentPreview } from "@/components/documents/document-preview"
import { Button } from "@/components/ui/button"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { useDocuments } from "@/hooks/useDocuments"
import type { DocumentCategory } from "@/services/documents"

const categories: Array<{ id: DocumentCategory; label: string }> = [
  { id: "policy", label: "Policies" },
  { id: "contract", label: "Contracts" },
  { id: "report", label: "Reports" },
  { id: "evidence", label: "Evidence" },
  { id: "other", label: "Other" },
]

const navLinks = [
  { label: "Risk Snapshot", href: "/" },
  { label: "Security Center", href: "/security" },
]

function normalizeTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}

export default function DocumentsPage() {
  const {
    documents,
    loading,
    error,
    lastQuery,
    loadDocuments,
    addDocument,
    addDocumentVersion,
    findExistingDocument,
    downloadDocument,
  } = useDocuments()

  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<"all" | DocumentCategory>("all")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [selectedDocument, setSelectedDocument] = useState(documents[0] ?? null)
  const [showUploader, setShowUploader] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadTags, setUploadTags] = useState("")
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>("policy")
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [versionPrompt, setVersionPrompt] = useState<{
    existing: typeof selectedDocument
    file: File
    tags: string[]
  } | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 20

  const normalizedSearch = searchTerm.trim()
  const activeCategory = categoryFilter === "all" ? undefined : categoryFilter

  useEffect(() => {
    if (!currentUser) return
    const handle = setTimeout(() => {
      loadDocuments({
        category: activeCategory,
        search: normalizedSearch.length > 0 ? normalizedSearch : undefined,
      })
    }, 250)

    return () => clearTimeout(handle)
  }, [currentUser, activeCategory, normalizedSearch, loadDocuments])

  useEffect(() => {
    setPage(1)
  }, [activeCategory, normalizedSearch])

  const pageCount = Math.max(1, Math.ceil(documents.length / pageSize))
  const pagedDocuments = useMemo(
    () => documents.slice((page - 1) * pageSize, page * pageSize),
    [documents, page, pageSize]
  )

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount)
    }
  }, [page, pageCount])

  useEffect(() => {
    if (!selectedDocument && pagedDocuments.length > 0) {
      setSelectedDocument(pagedDocuments[0])
      return
    }

    if (
      selectedDocument &&
      pagedDocuments.length > 0 &&
      !pagedDocuments.find((doc) => doc.id === selectedDocument.id)
    ) {
      setSelectedDocument(pagedDocuments[0])
    }
  }, [pagedDocuments, selectedDocument])

  const versionHistory = useMemo(() => {
    if (!selectedDocument) return []
    const rootId = selectedDocument.parentDocumentId ?? selectedDocument.id
    return documents
      .filter((doc) => doc.id === rootId || doc.parentDocumentId === rootId)
      .sort((a, b) => b.version - a.version)
  }, [documents, selectedDocument])

  async function handleUpload() {
    if (!uploadFile) {
      setUploadError("Choose a file to upload.")
      return
    }
    setUploadError(null)
    const tags = normalizeTags(uploadTags)
    const existing = await findExistingDocument(uploadFile.name, uploadCategory)
    if (existing) {
      setVersionPrompt({ existing, file: uploadFile, tags })
      return
    }

    const result = await addDocument({ file: uploadFile, category: uploadCategory, tags })
    if (result?.id) {
      const next = await loadDocuments(lastQuery)
      const uploaded = next.find((doc) => doc.id === result.id)
      if (uploaded) setSelectedDocument(uploaded)
      setUploadFile(null)
      setUploadTags("")
      setShowUploader(false)
    }
  }

  async function handleDownload(doc: typeof selectedDocument) {
    if (!doc) return
    setDownloadingId(doc.id)
    try {
      const url = await downloadDocument(doc)
      window.open(url, "_blank", "noopener,noreferrer")
    } finally {
      setDownloadingId(null)
    }
  }

  async function handleConfirmNewVersion() {
    if (!versionPrompt) return
    const result = await addDocumentVersion({
      file: versionPrompt.file,
      tags: versionPrompt.tags,
      existingDocument: versionPrompt.existing,
    })
    setVersionPrompt(null)
    if (result?.id) {
      const next = await loadDocuments(lastQuery)
      const uploaded = next.find((doc) => doc.id === result.id)
      if (uploaded) setSelectedDocument(uploaded)
      setUploadFile(null)
      setUploadTags("")
      setShowUploader(false)
    }
  }

  const isDisabled = !currentUser

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <DashboardHeader
        eyebrow="Phase 4 Repository"
        title="Document Repository"
        description="Centralize policies, contracts, and evidence with searchable metadata and secure downloads."
        navLinks={navLinks}
      />

      <AuthPanel onAuth={setCurrentUser} />
      {!currentUser && <AuthRequiredBanner />}

      <section
        className={`grid gap-6 lg:grid-cols-[220px_1fr_360px] ${
          isDisabled ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Categories
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={`flex items-center justify-between rounded-2xl px-3 py-2 text-sm transition ${
                categoryFilter === "all"
                  ? "bg-cyan-50 text-cyan-800"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>All Documents</span>
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategoryFilter(category.id)}
                className={`flex items-center justify-between rounded-2xl px-3 py-2 text-sm transition ${
                  categoryFilter === category.id
                    ? "bg-cyan-50 text-cyan-800"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <input
                className="min-w-[200px] flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="Search by name or tags"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value as "all" | DocumentCategory)
                }
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={view === "grid" ? "secondary" : "outline"}
                  onClick={() => setView("grid")}
                >
                  Grid
                </Button>
                <Button
                  size="sm"
                  variant={view === "list" ? "secondary" : "outline"}
                  onClick={() => setView("list")}
                >
                  List
                </Button>
              </div>
              <Button size="sm" onClick={() => setShowUploader((prev) => !prev)}>
                {showUploader ? "Close Upload" : "Upload Document"}
              </Button>
            </div>
            {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
          </div>

          {showUploader && (
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Upload a new document</p>
              <div className="mt-3 grid gap-3 md:grid-cols-[1.4fr_1fr]">
                <input
                  type="file"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
                />
                <select
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={uploadCategory}
                  onChange={(event) => setUploadCategory(event.target.value as DocumentCategory)}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <input
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="Tags (comma separated)"
                value={uploadTags}
                onChange={(event) => setUploadTags(event.target.value)}
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  Supported: PDF, DOCX, XLSX, PNG. Files are stored in Supabase Storage.
                </p>
                <Button size="sm" onClick={handleUpload} disabled={loading}>
                  {loading ? "Uploading..." : "Upload"}
                </Button>
              </div>
              {uploadError && <p className="mt-2 text-xs text-rose-600">{uploadError}</p>}
            </div>
          )}

          {versionPrompt && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-900">
              <p className="font-semibold">
                A document named &quot;{versionPrompt.existing?.fileName}&quot; already exists in{" "}
                {versionPrompt.existing?.category}.
              </p>
              <p className="mt-1 text-xs text-amber-700">
                Upload this file as a new version (v{versionPrompt.existing?.version + 1})?
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Button size="sm" onClick={handleConfirmNewVersion} disabled={loading}>
                  Upload New Version
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setVersionPrompt(null)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="min-h-[360px] rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            {loading ? (
              <p className="text-sm text-slate-500">Loading documents...</p>
            ) : (
              <div className="flex flex-col gap-4">
                <DocumentGrid
                  documents={pagedDocuments}
                  view={view}
                  selectedId={selectedDocument?.id}
                  onSelect={setSelectedDocument}
                />
                <PaginationControls
                  page={page}
                  pageCount={pageCount}
                  totalItems={documents.length}
                  pageSize={pageSize}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        </div>

        <DocumentPreview
          document={selectedDocument}
          versions={versionHistory}
          downloading={selectedDocument?.id === downloadingId}
          onDownload={(doc) => handleDownload(doc)}
        />
      </section>
    </main>
  )
}
