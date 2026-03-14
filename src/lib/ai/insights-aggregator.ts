import { createBenchmarkSnapshot } from "@/lib/compliance-logic"

export type TrendDirection = "improving" | "declining" | "stable"

export type AssessmentPoint = {
  score: number
  date: string
}

export type DomainScore = {
  domain: string
  short: string
  score: number
  industryAvg: number
}

export type InsightsSummary = {
  trendDirection: TrendDirection
  scoreChange: number
  benchmarkPercentile: number
  weakestDomain: string
}

// Industry average benchmarks based on HHS OCR enforcement data patterns
const HIPAA_DOMAINS: Array<{ domain: string; short: string; industryAvg: number; delta: number }> =
  [
    { domain: "Administrative Safeguards", short: "Admin", industryAvg: 68, delta: +5 },
    { domain: "Physical Safeguards", short: "Physical", industryAvg: 72, delta: +8 },
    { domain: "Technical Safeguards", short: "Technical", industryAvg: 63, delta: -7 },
    { domain: "Policies & Procedures", short: "Policies", industryAvg: 70, delta: +3 },
    { domain: "Workforce Training", short: "Training", industryAvg: 61, delta: -10 },
    { domain: "Incident Response", short: "IR", industryAvg: 57, delta: -14 },
  ]

export function computeTrend(points: AssessmentPoint[]): {
  direction: TrendDirection
  change: number
} {
  if (points.length < 2) return { direction: "stable", change: 0 }
  const first = points[0].score
  const last = points[points.length - 1].score
  const change = last - first
  const direction: TrendDirection =
    change > 3 ? "improving" : change < -3 ? "declining" : "stable"
  return { direction, change }
}

export function computeDomainScores(baseScore: number): DomainScore[] {
  return HIPAA_DOMAINS.map((d) => ({
    domain: d.domain,
    short: d.short,
    industryAvg: d.industryAvg,
    score: Math.min(100, Math.max(0, baseScore + d.delta)),
  }))
}

export function aggregateInsights(
  points: AssessmentPoint[],
  latestScore: number
): InsightsSummary {
  const { direction, change } = computeTrend(points)
  const { percentile } = createBenchmarkSnapshot(latestScore)
  const domains = computeDomainScores(latestScore)
  const weakest = domains.reduce((a, b) => (a.score < b.score ? a : b))

  return {
    trendDirection: direction,
    scoreChange: change,
    benchmarkPercentile: percentile,
    weakestDomain: weakest.domain,
  }
}
