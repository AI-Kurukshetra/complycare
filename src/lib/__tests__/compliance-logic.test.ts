import { describe, expect, it } from "vitest"
import { renderHook } from "@testing-library/react"
import { assessmentQuestions } from "@/lib/compliance-data"
import {
  buildAuditPacket,
  buildReportSummary,
  calculateComplianceScore,
  createBenchmarkSnapshot,
  createEvidenceSummary,
  selectTopGaps,
  buildRiskTimeline,
  useBenchmarkSnapshot,
  useComplianceScore,
  useReportSummary,
  useRiskTimeline,
} from "@/lib/compliance-logic"

const sampleAnswers = Object.fromEntries(
  assessmentQuestions.map((question) => [question.id, question.options[0]])
)

describe("compliance-logic", () => {
  it("calculates compliance and risk scores", () => {
    const { complianceScore, riskScore, riskLevel } = calculateComplianceScore(
      assessmentQuestions,
      sampleAnswers
    )

    expect(complianceScore).toBeGreaterThan(80)
    expect(riskScore).toBeLessThan(20)
    expect(["Low", "Moderate", "High"]).toContain(riskLevel)
  })

  it("builds a report summary with gaps and actions", () => {
    const summary = buildReportSummary(assessmentQuestions, sampleAnswers)
    expect(summary.topGaps.length).toBeGreaterThan(0)
    expect(summary.recommendedActions.length).toBeGreaterThan(0)
  })

  it("creates a benchmark snapshot", () => {
    const snapshot = createBenchmarkSnapshot(75)
    expect(snapshot.percentile).toBeGreaterThan(0)
    expect(snapshot.peerMedian).toBeGreaterThan(0)
  })

  it("builds an audit packet string", () => {
    const summary = buildReportSummary(assessmentQuestions, sampleAnswers)
    const packet = buildAuditPacket(summary, [])
    expect(packet).toContain("HIPAA Risk Snapshot Packet")
    expect(packet).toContain("Evidence Index")
  })

  it("selects top gaps and builds a timeline", () => {
    const gaps = selectTopGaps(assessmentQuestions, sampleAnswers)
    expect(gaps.length).toBeGreaterThan(0)
    expect(gaps.length).toBeLessThanOrEqual(5)

    const timeline = buildRiskTimeline(60, 2, 3)
    expect(timeline).toHaveLength(2)
    expect(timeline[1].complianceScore).toBeGreaterThanOrEqual(timeline[0].complianceScore)
  })

  it("creates evidence summaries from notes", () => {
    const result = createEvidenceSummary(
      "policy.pdf",
      "Security",
      "Encryption, training, access controls, and incident response verified."
    )
    expect(result.summary).toContain("policy.pdf")
    expect(result.extracted).toEqual(
      expect.arrayContaining([
        "Encryption controls referenced",
        "Training completion evidence",
        "Access review details",
        "Incident workflow evidence",
      ])
    )
  })

  it("memoizes compliance helpers via hooks", () => {
    const { result: scoreResult } = renderHook(() =>
      useComplianceScore(assessmentQuestions, sampleAnswers)
    )
    const directScore = calculateComplianceScore(assessmentQuestions, sampleAnswers)
    expect(scoreResult.current).toEqual(directScore)

    const { result: reportResult } = renderHook(() =>
      useReportSummary(assessmentQuestions, sampleAnswers)
    )
    expect(reportResult.current.complianceScore).toBe(directScore.complianceScore)

    const { result: benchmarkResult } = renderHook(() =>
      useBenchmarkSnapshot(reportResult.current.complianceScore)
    )
    expect(benchmarkResult.current.percentile).toBeGreaterThanOrEqual(0)

    const { result: timelineResult } = renderHook(() =>
      useRiskTimeline(
        reportResult.current.complianceScore,
        reportResult.current.recommendedActions.length,
        1
      )
    )
    expect(timelineResult.current).toHaveLength(2)
  })
})
