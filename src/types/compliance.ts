export type AssessmentOption = {
  label: string
  value: string
  score: number
}

export type AssessmentQuestion = {
  id: string
  prompt: string
  category: string
  weight: number
  options: AssessmentOption[]
}

export type AssessmentAnswerMap = Record<string, AssessmentOption | undefined>

export type PolicyGap = {
  id: string
  title: string
  category: string
  description: string
  impact: string
}

export type EvidenceItem = {
  id: string
  fileName: string
  fileType: string
  sizeKb: number
  category: string
  notes: string
  summary: string
  extracted: string[]
  uploadedAt: string
}

export type RegulationAlert = {
  title: string
  summary: string
  action: string
  date: string
}

export type BenchmarkSnapshot = {
  percentile: number
  peerMedian: number
  peerTopQuartile: number
}

export type RiskTimelinePoint = {
  label: string
  complianceScore: number
  riskScore: number
}

export type ReportSummary = {
  complianceScore: number
  riskScore: number
  riskLevel: string
  topGaps: PolicyGap[]
  recommendedActions: string[]
}
