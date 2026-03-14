export type PolicyGapSeverity = "critical" | "high" | "medium"
export type PolicyGapType = "missing" | "outdated" | "incomplete"

export type PolicyGap = {
  policy_name: string
  hipaa_section: string
  gap_type: PolicyGapType
  severity: PolicyGapSeverity
  recommendation: string
}

export type PolicyGapContext = {
  policies: Array<{
    name: string
    last_reviewed: string | null
    status: string | null
  }>
}

export function buildPolicyGapPrompt(context: PolicyGapContext) {
  return {
    policies: context.policies,
  }
}

export function parsePolicyGapPayload(payload: string): PolicyGap[] {
  const trimmed = payload.trim()
  const start = trimmed.indexOf("[")
  const end = trimmed.lastIndexOf("]")
  if (start >= 0 && end > start) {
    const list = JSON.parse(trimmed.slice(start, end + 1))
    if (Array.isArray(list)) {
      return list.map((item) => ({
        policy_name: String(item.policy_name ?? "Unknown policy"),
        hipaa_section: String(item.hipaa_section ?? "Unknown"),
        gap_type: (item.gap_type ?? "missing") as PolicyGapType,
        severity: (item.severity ?? "medium") as PolicyGapSeverity,
        recommendation: String(item.recommendation ?? "Review policy coverage."),
      }))
    }
  }

  const objectStart = trimmed.indexOf("{")
  const objectEnd = trimmed.lastIndexOf("}")
  if (objectStart >= 0 && objectEnd > objectStart) {
    const parsed = JSON.parse(trimmed.slice(objectStart, objectEnd + 1))
    const list = parsed.gaps ?? parsed
    if (Array.isArray(list)) {
      return list.map((item) => ({
        policy_name: String(item.policy_name ?? "Unknown policy"),
        hipaa_section: String(item.hipaa_section ?? "Unknown"),
        gap_type: (item.gap_type ?? "missing") as PolicyGapType,
        severity: (item.severity ?? "medium") as PolicyGapSeverity,
        recommendation: String(item.recommendation ?? "Review policy coverage."),
      }))
    }
  }

  throw new Error("Unable to parse policy gap payload.")
}
