import { describe, expect, it, vi } from "vitest"
import { createCertificatePdf } from "@/lib/certificate-generator"

describe("certificate-generator", () => {
  it("creates a PDF blob with predictable metadata", async () => {
    const id = "cert-1234"
    const original = globalThis.crypto?.randomUUID
    const mockUUID = vi.fn(() => id)
    let spy: ReturnType<typeof vi.spyOn> | null = null
    if (globalThis.crypto) {
      spy = vi.spyOn(globalThis.crypto, "randomUUID").mockImplementation(mockUUID)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(globalThis as any).crypto = { randomUUID: mockUUID }
    }

    const result = createCertificatePdf({
      employeeName: "Alex Rivera",
      moduleTitle: "HIPAA Essentials",
      completionDate: "2025-01-01",
      score: 92,
      organizationName: "Northwind Clinic",
    })

    expect(result.certificateId).toBe(id)
    expect(result.fileName).toContain(id)
    expect(result.fileName).toMatch(/\.pdf$/)

    const buffer = await result.blob.arrayBuffer()
    const header = new TextDecoder().decode(buffer.slice(0, 4))
    expect(header).toBe("%PDF")

    if (spy) spy.mockRestore()
    if (!spy && original) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(globalThis as any).crypto = { randomUUID: original }
    }
  })
})
