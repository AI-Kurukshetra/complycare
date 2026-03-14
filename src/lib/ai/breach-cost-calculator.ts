export type BreachCostRange = {
  min: number
  max: number
}

export type MitigationSavings = {
  current_score: number
  target_score: number
  current_cost: number
  target_cost: number
}

export type BreachCostResult = {
  estimated_cost_range: BreachCostRange
  cost_drivers: string[]
  mitigation_savings: MitigationSavings
}

export type BreachCostContext = {
  orgType?: string | null
  orgSize?: string | null
  complianceScore?: number | null
  unresolvedIncidents: number
  openVulnerabilities: Record<string, number>
  dataTypes: string[]
}

export function buildBreachCostPrompt(context: BreachCostContext) {
  return {
    organization: {
      type: context.orgType ?? "unknown",
      size: context.orgSize ?? "unknown",
      compliance_score: context.complianceScore ?? null,
      data_types_handled: context.dataTypes,
    },
    risk_factors: {
      unresolved_incidents: context.unresolvedIncidents,
      open_vulnerabilities: context.openVulnerabilities,
    },
    target_compliance_score: 80,
  }
}

export function parseBreachCostPayload(payload: string): BreachCostResult {
  const trimmed = payload.trim()
  const start = trimmed.indexOf("{")
  const end = trimmed.lastIndexOf("}")
  if (start >= 0 && end > start) {
    const parsed = JSON.parse(trimmed.slice(start, end + 1))
    const rangeMin = Number(parsed.estimated_cost_range?.min ?? 50000)
    const rangeMax = Number(parsed.estimated_cost_range?.max ?? 500000)
    return {
      estimated_cost_range: { min: rangeMin, max: rangeMax },
      cost_drivers: Array.isArray(parsed.cost_drivers)
        ? parsed.cost_drivers.map((d: unknown) => String(d))
        : [],
      mitigation_savings: {
        current_score: Number(parsed.mitigation_savings?.current_score ?? 50),
        target_score: Number(parsed.mitigation_savings?.target_score ?? 80),
        current_cost: Number(parsed.mitigation_savings?.current_cost ?? rangeMax),
        target_cost: Number(parsed.mitigation_savings?.target_cost ?? Math.round(rangeMax * 0.35)),
      },
    }
  }
  throw new Error("Unable to parse breach cost payload.")
}
