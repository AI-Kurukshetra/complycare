export type RiskProbability = "low" | "medium" | "high"

export type PredictedRisk = {
  risk_title: string
  probability: RiskProbability
  potential_impact: string
  recommended_actions: string[]
}

export type RiskPredictionContext = {
  orgType?: string | null
  orgSize?: string | null
  currentComplianceScore?: number | null
  currentRiskScore?: number | null
  riskLevel?: string | null
  assessmentAnswers?: Record<string, unknown> | null
  incidents: Array<{ title: string; severity: string; status: string; createdAt: string }>
  vulnerabilityCounts: Record<string, number>
  trainingCompletionRate?: number | null
}

const probabilityOrder: Record<RiskProbability, number> = {
  low: 1,
  medium: 2,
  high: 3,
}

function normalizeProbability(value: string): RiskProbability {
  const normalized = value.toLowerCase()
  if (normalized.includes("high")) return "high"
  if (normalized.includes("medium")) return "medium"
  return "low"
}

export function parseRiskPredictionPayload(payload: string): PredictedRisk[] {
  const trimmed = payload.trim()
  const start = trimmed.indexOf("[")
  const end = trimmed.lastIndexOf("]")
  if (start >= 0 && end > start) {
    const list = JSON.parse(trimmed.slice(start, end + 1))
    if (Array.isArray(list)) {
      return list.map((item) => ({
        risk_title: String(item.risk_title ?? "Untitled risk"),
        probability: normalizeProbability(String(item.probability ?? "low")),
        potential_impact: String(item.potential_impact ?? ""),
        recommended_actions: Array.isArray(item.recommended_actions)
          ? item.recommended_actions.map((action: unknown) => String(action))
          : [],
      }))
    }
  }

  const objectStart = trimmed.indexOf("{")
  const objectEnd = trimmed.lastIndexOf("}")
  if (objectStart >= 0 && objectEnd > objectStart) {
    const parsed = JSON.parse(trimmed.slice(objectStart, objectEnd + 1))
    const list = parsed.risks ?? parsed
    if (Array.isArray(list)) {
      return list.map((item) => ({
        risk_title: String(item.risk_title ?? "Untitled risk"),
        probability: normalizeProbability(String(item.probability ?? "low")),
        potential_impact: String(item.potential_impact ?? ""),
        recommended_actions: Array.isArray(item.recommended_actions)
          ? item.recommended_actions.map((action: unknown) => String(action))
          : [],
      }))
    }
  }

  throw new Error("Unable to parse risk prediction payload.")
}

export function buildRiskPredictionPrompt(context: RiskPredictionContext) {
  return {
    context: {
      organization: {
        type: context.orgType ?? "unknown",
        size: context.orgSize ?? "unknown",
        compliance_score: context.currentComplianceScore ?? null,
        risk_score: context.currentRiskScore ?? null,
        risk_level: context.riskLevel ?? "unknown",
      },
      assessment_answers: context.assessmentAnswers ?? {},
      incidents: context.incidents,
      vulnerabilities: context.vulnerabilityCounts,
      training_completion_rate: context.trainingCompletionRate ?? null,
    },
  }
}

export function sortRisks(risks: PredictedRisk[]) {
  return [...risks]
    .sort((a, b) => probabilityOrder[b.probability] - probabilityOrder[a.probability])
    .slice(0, 3)
}
