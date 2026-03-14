import type {
  AssessmentAnswerMap,
  AssessmentQuestion,
  BenchmarkSnapshot,
  EvidenceItem,
  PolicyGap,
  ReportSummary,
  RiskTimelinePoint,
} from "@/types/compliance"
import { peerComplianceScores, policyGaps, recommendedActions } from "@/lib/compliance-data"
import { useMemo } from "react"

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

export function calculateComplianceScore(
  questions: AssessmentQuestion[],
  answers: AssessmentAnswerMap
) {
  const weights = questions.map((question) => question.weight)
  const maxScore = sum(weights) * 10
  const currentScore = sum(
    questions.map((question) => (answers[question.id]?.score ?? 0) * question.weight)
  )

  const complianceScore = maxScore === 0 ? 0 : Math.round((currentScore / maxScore) * 100)
  const riskScore = Math.max(0, 100 - complianceScore)
  const riskLevel = complianceScore >= 75 ? "Low" : complianceScore >= 55 ? "Moderate" : "High"

  return { complianceScore, riskScore, riskLevel }
}

export function buildReportSummary(
  questions: AssessmentQuestion[],
  answers: AssessmentAnswerMap
): ReportSummary {
  const { complianceScore, riskScore, riskLevel } = calculateComplianceScore(questions, answers)
  const topGaps = selectTopGaps(questions, answers)
  const actionCount = Math.min(recommendedActions.length, 4)

  return {
    complianceScore,
    riskScore,
    riskLevel,
    topGaps,
    recommendedActions: recommendedActions.slice(0, actionCount),
  }
}

export function selectTopGaps(questions: AssessmentQuestion[], answers: AssessmentAnswerMap): PolicyGap[] {
  const categoryScores = new Map<string, number[]>()

  questions.forEach((question) => {
    const score = answers[question.id]?.score ?? 0
    const scores = categoryScores.get(question.category) ?? []
    scores.push(score)
    categoryScores.set(question.category, scores)
  })

  const rankedCategories = Array.from(categoryScores.entries())
    .map(([category, scores]) => ({
      category,
      average: sum(scores) / Math.max(scores.length, 1),
    }))
    .sort((a, b) => a.average - b.average)

  const topCategories = rankedCategories.slice(0, 3).map((item) => item.category)

  return policyGaps.filter((gap) => topCategories.includes(gap.category)).slice(0, 5)
}

export function createBenchmarkSnapshot(complianceScore: number): BenchmarkSnapshot {
  const sorted = [...peerComplianceScores].sort((a, b) => a - b)
  const below = sorted.filter((score) => score <= complianceScore).length
  const percentile = Math.round((below / sorted.length) * 100)

  const mid = Math.floor(sorted.length / 2)
  const peerMedian = sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
  const peerTopQuartile = sorted[Math.floor(sorted.length * 0.75)]

  return { percentile, peerMedian, peerTopQuartile }
}

export function buildRiskTimeline(
  complianceScore: number,
  actionCount: number,
  evidenceCount: number
): RiskTimelinePoint[] {
  const improvement = Math.min(18, actionCount * 3 + evidenceCount * 2)
  const projectedCompliance = Math.min(100, complianceScore + improvement)

  return [
    {
      label: "Current",
      complianceScore,
      riskScore: Math.max(0, 100 - complianceScore),
    },
    {
      label: "Projected (30 days)",
      complianceScore: projectedCompliance,
      riskScore: Math.max(0, 100 - projectedCompliance),
    },
  ]
}

export function createEvidenceSummary(
  fileName: string,
  category: string,
  notes: string
): { summary: string; extracted: string[] } {
  const extracted: string[] = []
  const lowerNotes = notes.toLowerCase()

  if (lowerNotes.includes("encryption")) extracted.push("Encryption controls referenced")
  if (lowerNotes.includes("training")) extracted.push("Training completion evidence")
  if (lowerNotes.includes("access")) extracted.push("Access review details")
  if (lowerNotes.includes("incident")) extracted.push("Incident workflow evidence")

  const summary =
    extracted.length === 0
      ? `Mocked AI summary: ${fileName} supports ${category.toLowerCase()} requirements.`
      : `Mocked AI summary: ${fileName} indicates ${extracted.join(", ").toLowerCase()}.`

  return { summary, extracted }
}

export function buildAuditPacket(summary: ReportSummary, evidence: EvidenceItem[]) {
  const gapLines = summary.topGaps.map((gap) => `- ${gap.title}: ${gap.description}`)
  const evidenceLines = evidence.map(
    (item) => `- ${item.fileName} (${item.category}) | evidence://${item.id}`
  )

  return [
    "HIPAA Risk Snapshot Packet",
    "",
    `Compliance Score: ${summary.complianceScore}`,
    `Risk Score: ${summary.riskScore} (${summary.riskLevel})`,
    "",
    "Top Policy Gaps",
    ...gapLines,
    "",
    "Recommended Actions",
    ...summary.recommendedActions.map((action) => `- ${action}`),
    "",
    "Evidence Index",
    ...(evidenceLines.length ? evidenceLines : ["- No evidence files uploaded"]),
  ].join("\n")
}

export function useComplianceScore(
  questions: AssessmentQuestion[],
  answers: AssessmentAnswerMap
) {
  return useMemo(() => calculateComplianceScore(questions, answers), [questions, answers])
}

export function useReportSummary(
  questions: AssessmentQuestion[],
  answers: AssessmentAnswerMap
): ReportSummary {
  return useMemo(() => buildReportSummary(questions, answers), [questions, answers])
}

export function useBenchmarkSnapshot(complianceScore: number): BenchmarkSnapshot {
  return useMemo(() => createBenchmarkSnapshot(complianceScore), [complianceScore])
}

export function useRiskTimeline(
  complianceScore: number,
  actionCount: number,
  evidenceCount: number
): RiskTimelinePoint[] {
  return useMemo(
    () => buildRiskTimeline(complianceScore, actionCount, evidenceCount),
    [complianceScore, actionCount, evidenceCount]
  )
}
