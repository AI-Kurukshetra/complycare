import { describe, expect, it } from "vitest"
import {
  analyzePolicyGaps,
  analyzeContract,
  estimateBreachCost,
  predictRiskScore,
} from "@/lib/insights-logic"

describe("insights-logic", () => {
  it("analyzes policy gaps based on compliance and training", () => {
    const lowCoverage = analyzePolicyGaps(40, 30)
    const highCoverage = analyzePolicyGaps(85, 90)
    expect(lowCoverage.length).toBeGreaterThan(0)
    expect(highCoverage.length).toBeLessThanOrEqual(lowCoverage.length)
  })

  it("predicts risk score and compliance score", () => {
    const result = predictRiskScore(200, 3, 50, 8)
    expect(result.riskScore).toBeGreaterThan(0)
    expect(result.complianceScore).toBeGreaterThanOrEqual(0)
    expect(result.complianceScore).toBeLessThanOrEqual(100)
  })

  it("flags missing contract clauses", () => {
    const findings = analyzeContract("This agreement includes audit and termination.")
    expect(findings).toEqual(
      expect.arrayContaining([
        "Missing breach notification clause",
        "Missing subcontractor obligations",
      ])
    )
  })

  it("estimates breach costs by sensitivity", () => {
    const low = estimateBreachCost(10, "low")
    const high = estimateBreachCost(10, "high")
    expect(high).toBeGreaterThan(low)
  })
})
