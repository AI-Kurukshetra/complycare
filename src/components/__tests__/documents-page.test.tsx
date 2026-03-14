import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useEffect } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import DocumentsPage from "@/app/documents/page"
import type { DocumentRecord } from "@/hooks/useDocuments"

const mockLoad = vi.fn()
const mockAdd = vi.fn()
const mockAddVersion = vi.fn()
const mockFind = vi.fn()
const mockDownload = vi.fn()

const baseDoc: DocumentRecord = {
  id: "doc-1",
  fileName: "policy.pdf",
  filePath: "org/policy.pdf",
  fileSize: 1200,
  mimeType: "application/pdf",
  category: "policy",
  tags: ["hipaa"],
  version: 1,
  parentDocumentId: null,
  uploadedBy: "user-1",
  createdAt: new Date().toISOString(),
}

vi.mock("@/hooks/useDocuments", () => ({
  useDocuments: () => ({
    documents: [baseDoc],
    loading: false,
    error: null,
    lastQuery: {},
    loadDocuments: mockLoad,
    addDocument: mockAdd,
    addDocumentVersion: mockAddVersion,
    findExistingDocument: mockFind,
    downloadDocument: mockDownload,
  }),
}))

vi.mock("@/components/auth-panel", () => ({
  AuthPanel: ({ onAuth }: { onAuth?: (email: string | null) => void }) => {
    useEffect(() => {
      onAuth?.("demo@acme.test")
    }, [onAuth])
    return <div>AuthPanel</div>
  },
}))

describe("DocumentsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("prompts for new version when duplicate name exists", async () => {
    mockFind.mockResolvedValue(baseDoc)

    const { container } = render(<DocumentsPage />)

    await waitFor(() => {
      expect(mockLoad).toHaveBeenCalled()
    })

    fireEvent.click(screen.getByRole("button", { name: /Upload Document/i }))

    const file = new File(["data"], "policy.pdf", { type: "application/pdf" })
    const fileInput = container.querySelector("input[type='file']")
    if (!fileInput) throw new Error("Missing file input")
    fireEvent.change(fileInput, { target: { files: [file] } })

    const uploadButton = screen.getAllByRole("button").find((button) => {
      return button.textContent?.trim() === "Upload"
    })
    if (!uploadButton) throw new Error("Upload button not found")
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByText(/Upload this file as a new version/i)).toBeInTheDocument()
    })
  }, 15000)

  it("uploads as new version when confirmed", async () => {
    mockFind.mockResolvedValue(baseDoc)
    mockAddVersion.mockResolvedValue({ id: "doc-2", filePath: "org/policy-v2.pdf" })
    mockLoad.mockResolvedValue([baseDoc])

    const { container } = render(<DocumentsPage />)

    await waitFor(() => {
      expect(mockLoad).toHaveBeenCalled()
    })

    fireEvent.click(screen.getByRole("button", { name: /Upload Document/i }))

    const file = new File(["data"], "policy.pdf", { type: "application/pdf" })
    const fileInput = container.querySelector("input[type='file']")
    if (!fileInput) throw new Error("Missing file input")
    fireEvent.change(fileInput, { target: { files: [file] } })

    const uploadButton = screen.getAllByRole("button").find((button) => {
      return button.textContent?.trim() === "Upload"
    })
    if (!uploadButton) throw new Error("Upload button not found")
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Upload New Version/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: /Upload New Version/i }))

    await waitFor(() => {
      expect(mockAddVersion).toHaveBeenCalled()
    })
  }, 15000)
})
