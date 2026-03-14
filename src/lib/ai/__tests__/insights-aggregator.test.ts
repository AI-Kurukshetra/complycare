import { describe, expect, it } from "vitest"
import {
  aggregateInsights,
  computeDomainScores,
  computeTrend,
} from "@/lib/ai/insights-aggregator"
import type { AssessmentPoint } from "@/lib/ai/insights-aggregator"

// ---------------------------------------------------------------------------
// computeTrend
// ---------------------------------------------------------------------------

describe("computeTrend", () => {
  it("returns stable with zero or one data point", () => {
    expect(computeTrend([])).toEqual({ direction: "stable", change: 0 })
    expect(computeTrend([{ score: 70, date: "2025-01-01" }])).toEqual({
      direction: "stable",
      change: 0,
    })
  })

  it("detects improving trend when last score > first by more than 3", () => {
    const points: AssessmentPoint[] = [
      { score: 60, date: "2025-01-01" },
      { score: 65, date: "2025-02-01" },
      { score: 72, date: "2025-03-01" },
    ]
    const { direction, change } = computeTrend(points)
    expect(direction).toBe("improving")
    expect(change).toBe(12)
  })

  it("detects declining trend when last score < first by more than 3", () => {
    const points: AssessmentPoint[] = [
      { score: 80, date: "2025-01-01" },
      { score: 75, date: "2025-02-01" },
      { score: 70, date: "2025-03-01" },
    ]
    const { direction, change } = computeTrend(points)
    expect(direction).toBe("declining")
    expect(change).toBe(-10)
  })

  it("detects stable trend when change is within ±3", () => {
    const points: AssessmentPoint[] = [
      { score: 70, date: "2025-01-01" },
      { score: 72, date: "2025-02-01" },
    ]
    const { direction, change } = computeTrend(points)
    expect(direction).toBe("stable")
    expect(change).toBe(2)
  })

  it("uses first and last points only, ignoring middle values", () => {
    const points: AssessmentPoint[] = [
      { score: 50, date: "2025-01-01" },
      { score: 90, date: "2025-02-01" }, // spike in middle, ignored
      { score: 55, date: "2025-03-01" },
    ]
    const { direction, change } = computeTrend(points)
    // 55 - 50 = 5, which is > 3, so "improving"
    expect(direction).toBe("improving")
    expect(change).toBe(5)
  })
})

// ---------------------------------------------------------------------------
// computeDomainScores
// ---------------------------------------------------------------------------

describe("computeDomainScores", () => {
  it("returns one entry per HIPAA domain (6 total)", () => {
    const scores = computeDomainScores(70)
    expect(scores).toHaveLength(6)
  })

  it("applies domain deltas to the base score", () => {
    const baseScore = 70
    const scores = computeDomainScores(baseScore)
    scores.forEach((d) => {
      expect(d.score).toBeGreaterThanOrEqual(0)
      expect(d.score).toBeLessThanOrEqual(100)
    })
  })

  it("clamps scores to [0, 100] even at extremes", () => {
    const low = computeDomainScores(0)
    low.forEach((d) => expect(d.score).toBeGreaterThanOrEqual(0))

    const high = computeDomainScores(100)
    high.forEach((d) => expect(d.score).toBeLessThanOrEqual(100))
  })

  it("includes industryAvg, short name, domain name, and score on each entry", () => {
    const scores = computeDomainScores(65)
    const entry = scores[0]
    expect(entry).toHaveProperty("domain")
    expect(entry).toHaveProperty("short")
    expect(entry).toHaveProperty("score")
    expect(entry).toHaveProperty("industryAvg")
    expect(typeof entry.industryAvg).toBe("number")
  })

  it("lower base score produces lower domain scores", () => {
    const low = computeDomainScores(40)
    const high = computeDomainScores(90)
    const lowTotal = low.reduce((s, d) => s + d.score, 0)
    const highTotal = high.reduce((s, d) => s + d.score, 0)
    expect(highTotal).toBeGreaterThan(lowTotal)
  })
})

// ---------------------------------------------------------------------------
// aggregateInsights
// ---------------------------------------------------------------------------

describe("aggregateInsights", () => {
  it("returns a summary with all required fields", () => {
    const points: AssessmentPoint[] = [
      { score: 60, date: "2025-01-01" },
      { score: 72, date: "2025-02-01" },
    ]
    const result = aggregateInsights(points, 72)

    expect(result).toHaveProperty("trendDirection")
    expect(result).toHaveProperty("scoreChange")
    expect(result).toHaveProperty("benchmarkPercentile")
    expect(result).toHaveProperty("weakestDomain")
    expect(typeof result.benchmarkPercentile).toBe("number")
    expect(typeof result.weakestDomain).toBe("string")
  })

  it("identifies improving trend from improving data", () => {
    const points: AssessmentPoint[] = [
      { score: 50, date: "2025-01-01" },
      { score: 75, date: "2025-03-01" },
    ]
    const { trendDirection, scoreChange } = aggregateInsights(points, 75)
    expect(trendDirection).toBe("improving")
    expect(scoreChange).toBe(25)
  })

  it("identifies the weakest domain (lowest computed score)", () => {
    // At base=70, the domain with the most negative delta should be weakest
    const result = aggregateInsights([{ score: 70, date: "2025-01-01" }], 70)
    // "Incident Response" has delta=-14, the largest negative, making it weakest at any mid-range score
    expect(result.weakestDomain).toBe("Incident Response")
  })

  it("returns stable trend with a single assessment point", () => {
    const { trendDirection, scoreChange } = aggregateInsights(
      [{ score: 65, date: "2025-01-01" }],
      65
    )
    expect(trendDirection).toBe("stable")
    expect(scoreChange).toBe(0)
  })

  it("percentile is within 0–100", () => {
    const { benchmarkPercentile } = aggregateInsights([], 85)
    expect(benchmarkPercentile).toBeGreaterThanOrEqual(0)
    expect(benchmarkPercentile).toBeLessThanOrEqual(100)
  })
})
