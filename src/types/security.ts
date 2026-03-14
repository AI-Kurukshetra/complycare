export type Vulnerability = {
  id: string
  title: string
  severity: "low" | "medium" | "high" | "critical"
  status: "open" | "in_progress" | "resolved"
  asset?: string
  createdAt: string
  resolvedAt?: string
}

export type ComplianceCheck = {
  id: string
  title: string
  status: "drift" | "compliant" | "needs_review"
  lastCheckedAt?: string
}

export type RegulatoryUpdate = {
  id: string
  title: string
  summary: string
  effectiveDate: string | null
  impactLevel: "low" | "medium" | "high" | "critical"
  affectedAreas: string[]
  actionRequired: boolean
  sourceUrl: string | null
  createdAt: string
}
