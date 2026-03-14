import { describe, expect, it } from "vitest"
import { parseBreachCostPayload } from "@/lib/ai/breach-cost-calculator"
import { parsePolicyGapPayload } from "@/lib/ai/policy-gap-analysis"
import { parseRiskPredictionPayload, sortRisks } from "@/lib/ai/risk-prediction"

// ---------------------------------------------------------------------------
// parseBreachCostPayload
// ---------------------------------------------------------------------------

describe("parseBreachCostPayload", () => {
  it("parses a clean JSON object", () => {
    const json = JSON.stringify({
      estimated_cost_range: { min: 100000, max: 750000 },
      cost_drivers: ["Unencrypted PHI", "Delayed notification"],
      mitigation_savings: {
        current_score: 55,
        target_score: 80,
        current_cost: 750000,
        target_cost: 262500,
      },
    })

    const result = parseBreachCostPayload(json)

    expect(result.estimated_cost_range.min).toBe(100000)
    expect(result.estimated_cost_range.max).toBe(750000)
    expect(result.cost_drivers).toEqual(["Unencrypted PHI", "Delayed notification"])
    expect(result.mitigation_savings.current_score).toBe(55)
    expect(result.mitigation_savings.target_score).toBe(80)
  })

  it("parses JSON embedded in surrounding prose text", () => {
    const payload = `Here is your analysis:\n${JSON.stringify({
      estimated_cost_range: { min: 50000, max: 300000 },
      cost_drivers: ["Weak access controls"],
      mitigation_savings: { current_score: 60, target_score: 80, current_cost: 300000, target_cost: 105000 },
    })}\nEnd of response.`

    const result = parseBreachCostPayload(payload)
    expect(result.estimated_cost_range.min).toBe(50000)
    expect(result.cost_drivers).toHaveLength(1)
  })

  it("falls back to default values when fields are missing", () => {
    const result = parseBreachCostPayload("{}")
    expect(result.estimated_cost_range.min).toBe(50000)
    expect(result.estimated_cost_range.max).toBe(500000)
    expect(result.cost_drivers).toEqual([])
  })

  it("coerces string numbers to numeric types", () => {
    const json = JSON.stringify({
      estimated_cost_range: { min: "80000", max: "600000" },
      cost_drivers: [],
      mitigation_savings: { current_score: "50", target_score: "80", current_cost: "600000", target_cost: "210000" },
    })
    const result = parseBreachCostPayload(json)
    expect(typeof result.estimated_cost_range.min).toBe("number")
    expect(result.estimated_cost_range.min).toBe(80000)
  })

  it("throws when no JSON object can be found", () => {
    expect(() => parseBreachCostPayload("No data here")).toThrow()
  })
})

// ---------------------------------------------------------------------------
// parsePolicyGapPayload
// ---------------------------------------------------------------------------

describe("parsePolicyGapPayload", () => {
  const sampleGap = {
    policy_name: "Access Control Policy",
    hipaa_section: "§164.312(a)(1)",
    gap_type: "missing",
    severity: "critical",
    recommendation: "Implement role-based access controls.",
  }

  it("parses a top-level JSON array", () => {
    const payload = JSON.stringify([sampleGap])
    const result = parsePolicyGapPayload(payload)

    expect(result).toHaveLength(1)
    expect(result[0].policy_name).toBe("Access Control Policy")
    expect(result[0].hipaa_section).toBe("§164.312(a)(1)")
    expect(result[0].gap_type).toBe("missing")
    expect(result[0].severity).toBe("critical")
    expect(result[0].recommendation).toContain("role-based")
  })

  it("parses a JSON object wrapping an array under 'gaps' key", () => {
    const payload = JSON.stringify({ gaps: [sampleGap] })
    const result = parsePolicyGapPayload(payload)
    expect(result).toHaveLength(1)
    expect(result[0].policy_name).toBe("Access Control Policy")
  })

  it("parses JSON embedded in prose", () => {
    const payload = `Analysis complete:\n${JSON.stringify([sampleGap])}`
    const result = parsePolicyGapPayload(payload)
    expect(result).toHaveLength(1)
  })

  it("applies defaults for missing fields", () => {
    const result = parsePolicyGapPayload("[{}]")
    expect(result[0].policy_name).toBe("Unknown policy")
    expect(result[0].hipaa_section).toBe("Unknown")
    expect(result[0].gap_type).toBe("missing")
    expect(result[0].severity).toBe("medium")
  })

  it("throws when no parseable JSON is found", () => {
    expect(() => parsePolicyGapPayload("no json here")).toThrow()
  })
})

// ---------------------------------------------------------------------------
// parseRiskPredictionPayload
// ---------------------------------------------------------------------------

describe("parseRiskPredictionPayload", () => {
  const sampleRisk = {
    risk_title: "PHI Data Breach",
    probability: "high",
    potential_impact: "Significant financial and reputational damage.",
    recommended_actions: ["Enable MFA", "Encrypt data at rest"],
  }

  it("parses a top-level JSON array", () => {
    const result = parseRiskPredictionPayload(JSON.stringify([sampleRisk]))
    expect(result).toHaveLength(1)
    expect(result[0].risk_title).toBe("PHI Data Breach")
    expect(result[0].probability).toBe("high")
    expect(result[0].recommended_actions).toHaveLength(2)
  })

  it("parses a JSON object wrapping array under 'risks' key", () => {
    const result = parseRiskPredictionPayload(JSON.stringify({ risks: [sampleRisk] }))
    expect(result).toHaveLength(1)
  })

  it("normalizes probability strings to low/medium/high", () => {
    const cases = [
      { input: "HIGH RISK", expected: "high" },
      { input: "medium risk", expected: "medium" },
      // "critical" contains neither "high" nor "medium" → falls through to "low"
      { input: "critical", expected: "low" },
      { input: "unknown", expected: "low" },
    ]
    for (const { input, expected } of cases) {
      const result = parseRiskPredictionPayload(
        JSON.stringify([{ ...sampleRisk, probability: input }])
      )
      expect(result[0].probability).toBe(expected)
    }
  })

  it("applies defaults for missing fields", () => {
    const result = parseRiskPredictionPayload("[{}]")
    expect(result[0].risk_title).toBe("Untitled risk")
    expect(result[0].probability).toBe("low")
    expect(result[0].recommended_actions).toEqual([])
  })

  it("throws when no parseable JSON is found", () => {
    expect(() => parseRiskPredictionPayload("plain text response")).toThrow()
  })
})

// ---------------------------------------------------------------------------
// sortRisks
// ---------------------------------------------------------------------------

describe("sortRisks", () => {
  it("returns top 3 risks sorted high → medium → low", () => {
    const risks = [
      { risk_title: "A", probability: "low" as const, potential_impact: "", recommended_actions: [] },
      { risk_title: "B", probability: "high" as const, potential_impact: "", recommended_actions: [] },
      { risk_title: "C", probability: "medium" as const, potential_impact: "", recommended_actions: [] },
      { risk_title: "D", probability: "high" as const, potential_impact: "", recommended_actions: [] },
    ]
    const sorted = sortRisks(risks)
    expect(sorted).toHaveLength(3)
    expect(sorted[0].probability).toBe("high")
    expect(sorted[1].probability).toBe("high")
    expect(sorted[2].probability).toBe("medium")
  })

  it("caps result at 3 items", () => {
    const risks = Array.from({ length: 10 }, (_, i) => ({
      risk_title: `Risk ${i}`,
      probability: "medium" as const,
      potential_impact: "",
      recommended_actions: [],
    }))
    expect(sortRisks(risks)).toHaveLength(3)
  })

  it("handles fewer than 3 risks", () => {
    const risks = [
      { risk_title: "Only one", probability: "high" as const, potential_impact: "", recommended_actions: [] },
    ]
    expect(sortRisks(risks)).toHaveLength(1)
  })
})
