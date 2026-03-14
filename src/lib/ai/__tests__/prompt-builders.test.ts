import { describe, expect, it } from "vitest"
import { buildRiskPredictionPrompt } from "@/lib/ai/risk-prediction"
import { buildPolicyGapPrompt } from "@/lib/ai/policy-gap-analysis"
import { buildBreachCostPrompt } from "@/lib/ai/breach-cost-calculator"

describe("AI prompt builders", () => {
  it("builds risk prediction prompt with required context", () => {
    const prompt = buildRiskPredictionPrompt({
      orgType: "Clinic",
      orgSize: "50-100",
      currentComplianceScore: 72,
      currentRiskScore: 28,
      riskLevel: "Moderate",
      assessmentAnswers: { q1: { score: 8 } },
      incidents: [{ title: "Phishing", severity: "high", status: "open", createdAt: "2025-01-01" }],
      vulnerabilityCounts: { high: 2, medium: 3, low: 1 },
      trainingCompletionRate: 78,
    })

    expect(prompt.context.organization.type).toBe("Clinic")
    expect(prompt.context.organization.compliance_score).toBe(72)
    expect(prompt.context.incidents).toHaveLength(1)
    expect(prompt.context.vulnerabilities).toMatchObject({ high: 2 })
    expect(prompt.context.training_completion_rate).toBe(78)
  })

  it("builds policy gap prompt with policy list", () => {
    const prompt = buildPolicyGapPrompt({
      policies: [{ name: "Access Control Policy", last_reviewed: null, status: "draft" }],
    })
    expect(prompt.policies).toHaveLength(1)
    expect(prompt.policies[0].name).toBe("Access Control Policy")
  })

  it("builds breach cost prompt with risk factors", () => {
    const prompt = buildBreachCostPrompt({
      orgType: "Hospital",
      orgSize: "200+",
      complianceScore: 65,
      unresolvedIncidents: 3,
      openVulnerabilities: { high: 4 },
      dataTypes: ["PHI", "Billing"],
    })

    expect(prompt.organization.type).toBe("Hospital")
    expect(prompt.risk_factors.unresolved_incidents).toBe(3)
    expect(prompt.risk_factors.open_vulnerabilities).toMatchObject({ high: 4 })
    expect(prompt.target_compliance_score).toBe(80)
  })
})
