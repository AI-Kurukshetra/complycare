import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { DocumentPreview } from "@/components/documents/document-preview"
import type { DocumentRecord } from "@/hooks/useDocuments"

const baseDoc: DocumentRecord = {
  id: "doc-1",
  fileName: "contract.pdf",
  filePath: "org/contract.pdf",
  fileSize: 2048,
  mimeType: "application/pdf",
  category: "contract",
  tags: ["vendor"],
  version: 2,
  parentDocumentId: "doc-0",
  uploadedBy: "user-1",
  createdAt: new Date().toISOString(),
}

describe("DocumentPreview", () => {
  it("shows empty state when no document selected", () => {
    render(
      <DocumentPreview
        document={null}
        versions={[]}
        onDownload={vi.fn()}
        downloading={false}
      />
    )

    expect(screen.getByText(/Select a document/i)).toBeInTheDocument()
  })

  it("renders version history and triggers download", () => {
    const onDownload = vi.fn()
    const versions = [
      baseDoc,
      {
        ...baseDoc,
        id: "doc-2",
        version: 1,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ]

    render(
      <DocumentPreview
        document={baseDoc}
        versions={versions}
        onDownload={onDownload}
        downloading={false}
      />
    )

    expect(screen.getByText(/Version History/i)).toBeInTheDocument()

    const downloadButtons = screen.getAllByRole("button", { name: /Download/i })
    fireEvent.click(downloadButtons[0])
    expect(onDownload).toHaveBeenCalledWith(baseDoc)
  })
})
