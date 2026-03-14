import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { DocumentGrid } from "@/components/documents/document-grid"
import type { DocumentRecord } from "@/hooks/useDocuments"

const docs: DocumentRecord[] = [
  {
    id: "doc-1",
    fileName: "policy.pdf",
    filePath: "org/doc-1.pdf",
    fileSize: 1024,
    mimeType: "application/pdf",
    category: "policy",
    tags: ["hipaa", "policy"],
    version: 1,
    parentDocumentId: null,
    uploadedBy: "user-1",
    createdAt: new Date().toISOString(),
  },
]

describe("DocumentGrid", () => {
  it("renders documents and triggers selection", () => {
    const onSelect = vi.fn()
    render(
      <DocumentGrid documents={docs} view="grid" selectedId={null} onSelect={onSelect} />
    )

    expect(screen.getByText("policy.pdf")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /policy\.pdf/i }))
    expect(onSelect).toHaveBeenCalledWith(docs[0])
  })
})
