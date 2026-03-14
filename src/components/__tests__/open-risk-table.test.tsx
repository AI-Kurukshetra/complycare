import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { OpenRiskTable } from "@/components/reports/open-risk-table"
import type { RiskSummaryItem } from "@/services/reports"

const risks: RiskSummaryItem[] = [
  {
    id: "risk-1",
    title: "Unencrypted backups",
    severity: "high",
    status: "open",
    createdAt: new Date().toISOString(),
    ageDays: 12,
  },
]

describe("OpenRiskTable", () => {
  it("renders risk rows", () => {
    render(<OpenRiskTable risks={risks} />)
    expect(screen.getByText(/Unencrypted backups/i)).toBeInTheDocument()
    expect(screen.getByText(/12/)).toBeInTheDocument()
  })

  it("renders empty message", () => {
    render(<OpenRiskTable risks={[]} />)
    expect(screen.getByText(/No open risks/i)).toBeInTheDocument()
  })
})
