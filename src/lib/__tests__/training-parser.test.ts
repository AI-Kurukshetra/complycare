import { describe, expect, it } from "vitest"
import {
  fallbackQuestions,
  formatDuration,
  parseQuizQuestions,
  parseScenario,
  resolveCorrectIndex,
} from "@/lib/training-parser"

describe("training parser helpers", () => {
  it("parses quiz questions and normalizes options", () => {
    const questions = parseQuizQuestions([
      {
        question: "Pick the secure action",
        options: [
          { label: "Use encryption", isCorrect: true },
          { label: "Share via public link" },
        ],
      },
      {
        question: "Alternate format",
        choices: ["Encrypt it", "Skip encryption"],
        correct_answer: "Encrypt it",
      },
    ])

    expect(questions).toHaveLength(2)
    expect(questions[0]?.options[0]?.label).toBe("Use encryption")
    expect(questions[1]?.options[0]?.label).toBe("Encrypt it")
  })

  it("falls back to canned questions when none are valid", () => {
    const result = parseQuizQuestions({ foo: "bar" })
    expect(result).toHaveLength(fallbackQuestions.length)
    expect(result[0].question).toBe(fallbackQuestions[0].question)
  })

  it("identifies the correct index from multiple cues", () => {
    const explicit = { question: "Q", options: [{ label: "A" }, { label: "B" }], correctIndex: 1 }
    const flagged = { question: "Q", options: [{ label: "A", isCorrect: true }, { label: "B" }] }
    const answerPhrase = { question: "Q", options: [{ label: "A" }, { label: "B" }], correctAnswer: "B" }

    expect(resolveCorrectIndex(explicit)).toBe(1)
    expect(resolveCorrectIndex(flagged)).toBe(0)
    expect(resolveCorrectIndex(answerPhrase)).toBe(1)
  })

  it("parses scenario nodes and respects start identifiers", () => {
    const scenario = {
      nodes: [
        {
          id: "start",
          prompt: "What would you do",
          options: [{ label: "Secure it", next_id: "end" }],
        },
        {
          id: "end",
          prompt: "End",
          options: [{ label: "Finish" }],
        },
      ],
      startId: "start",
    }

    const parsed = parseScenario(scenario)
    expect(parsed.nodes).toHaveLength(2)
    expect(parsed.startId).toBe("start")
  })

  it("formats duration as mm:ss", () => {
    expect(formatDuration(65)).toBe("1:05")
    expect(formatDuration(9)).toBe("0:09")
  })
})
