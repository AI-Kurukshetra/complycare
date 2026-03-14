import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useEffect } from "react"
import { describe, expect, it, vi } from "vitest"
import ReportsPage from "@/app/reports/page"

vi.mock("@/services/reports", async () => {
  const actual = await vi.importActual<typeof import("@/services/reports")>("@/services/reports")
  return {
    ...actual,
    fetchComplianceTrend: () => Promise.resolve([{ month: "Jan 24", score: 70 }]),
    fetchOpenRisks: () => Promise.resolve([]),
    fetchIncidentSummary: () => Promise.resolve({ open: 1, resolved: 2, total: 3 }),
    fetchVendorComplianceSummary: () => Promise.resolve({
      compliant: 2,
      atRisk: 1,
      nonCompliant: 0,
    }),
  }
})

vi.mock("@/services/operations", () => ({
  ensureOrganization: () => Promise.resolve("org-1"),
  ensureOrgMembership: () => Promise.resolve(),
}))

vi.mock("@/components/auth-panel", () => ({
  AuthPanel: ({ onAuth }: { onAuth?: (email: string | null) => void }) => {
    useEffect(() => {
      onAuth?.("demo@acme.test")
    }, [onAuth])
    return <div>AuthPanel</div>
  },
}))

describe("ReportsPage", () => {
  it("renders report sections and print button", async () => {
    render(<ReportsPage />)

    expect(await screen.findByText(/Compliance Score Trend/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Print Report/i })).toBeInTheDocument()
  })

  it("updates date range", async () => {
    render(<ReportsPage />)

    const inputs = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/)
    fireEvent.change(inputs[0], { target: { value: "2025-01-01" } })

    await waitFor(() => {
      expect(inputs[0]).toHaveValue("2025-01-01")
    })
  })
})
