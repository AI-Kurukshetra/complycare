import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ComplianceTrendChart } from "@/components/reports/compliance-trend-chart"
import { DomainBreakdownChart } from "@/components/reports/domain-breakdown-chart"
import { TrainingCompletionChart } from "@/components/reports/training-completion-chart"

import type { ComplianceTrendPoint, TrainingDepartmentSummary } from "@/services/reports"

const trendData: ComplianceTrendPoint[] = [
  { month: "Jan 24", score: 72 },
  { month: "Feb 24", score: 78 },
  { month: "Mar 24", score: 81 },
]

const trainingData: TrainingDepartmentSummary[] = [
  { department: "Clinical", completionRate: 82 },
  { department: "Billing", completionRate: 74 },
]

describe("Reports charts", () => {
  it("renders compliance trend chart", () => {
    render(<ComplianceTrendChart data={trendData} />)
    expect(screen.getByText("Jan 24")).toBeInTheDocument()
  })

  it("renders domain breakdown legend", () => {
    render(
      <DomainBreakdownChart
        data={[
          { label: "Administrative", value: 45 },
          { label: "Physical", value: 25 },
          { label: "Technical", value: 30 },
        ]}
      />
    )

    expect(screen.getByText(/Administrative/i)).toBeInTheDocument()
    expect(screen.getByText(/Technical/i)).toBeInTheDocument()
  })

  it("renders training completion bars", () => {
    render(<TrainingCompletionChart data={trainingData} />)
    expect(screen.getByText(/Clinical/i)).toBeInTheDocument()
    expect(screen.getByText(/82%/i)).toBeInTheDocument()
  })
})
