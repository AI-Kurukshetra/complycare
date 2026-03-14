import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PortfolioTable } from "@/components/scale/portfolio-table"
import type { PortfolioRow } from "@/services/portfolio"

const rows: PortfolioRow[] = [
  {
    organizationId: "org-1",
    orgName: "Northwind",
    complianceScore: 88,
    riskLevel: "medium",
    openRisks: 2,
    overdueTraining: 1,
    activeIncidents: 0,
    lastAssessmentDate: "2026-02-01",
  },
]

describe("PortfolioTable", () => {
  it("renders rows", () => {
    render(<PortfolioTable rows={rows} />)
    expect(screen.getByText(/Northwind/i)).toBeInTheDocument()
    expect(screen.getByText(/88/)).toBeInTheDocument()
  })

  it("renders empty message", () => {
    render(<PortfolioTable rows={[]} />)
    expect(screen.getByText(/No organizations found/i)).toBeInTheDocument()
  })
})
