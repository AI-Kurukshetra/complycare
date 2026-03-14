export type Risk = {
  id: string
  title: string
  severity: "low" | "medium" | "high"
  status: "open" | "mitigating" | "closed"
  createdAt: string
  actions: RiskAction[]
}

export type RiskAction = {
  id: string
  action: string
  status: "planned" | "in_progress" | "done"
  dueDate?: string
}

export type Vendor = {
  id: string
  name: string
  criticality: "low" | "medium" | "high"
  status: "active" | "paused"
  assessment?: VendorAssessment
  baa?: BaaRecord
}

export type VendorAssessment = {
  id: string
  score: number
  status: "pending" | "approved" | "needs_followup"
  notes?: string
}

export type BaaRecord = {
  id: string
  status: "pending" | "signed" | "expired"
  renewalDate?: string
}

export type AccessReview = {
  id: string
  title: string
  status: "open" | "complete"
  createdAt: string
  items: AccessReviewItem[]
}

export type AccessReviewItem = {
  id: string
  subject: string
  decision: "pending" | "approved" | "revoked"
}
