export type QuizOption = {
  label: string
  isCorrect?: boolean
  score?: number
}

export type QuizQuestion = {
  id?: string
  question: string
  options: QuizOption[]
  correctIndex?: number
  correctAnswer?: string
  explanation?: string
}

export type ScenarioOption = {
  label: string
  nextId?: string
  isCorrect?: boolean
  score?: number
  scoreDelta?: number
  feedback?: string
}

export type ScenarioNode = {
  id: string
  prompt: string
  options: ScenarioOption[]
}

export type ScenarioDecision = {
  nodeId: string
  optionIndex: number
  score: number | null
  isCorrect: boolean | null
}

const fallbackQuestions: QuizQuestion[] = [
  {
    question: "Which HIPAA rule requires safeguards for electronic PHI?",
    options: [
      { label: "Privacy Rule" },
      { label: "Security Rule", isCorrect: true },
      { label: "Breach Notification Rule" },
      { label: "Enforcement Rule" },
    ],
  },
  {
    question: "What is the maximum time to notify patients after a breach?",
    options: [
      { label: "30 days" },
      { label: "45 days" },
      { label: "60 days", isCorrect: true },
      { label: "90 days" },
    ],
  },
  {
    question: "Which action best protects PHI when emailing?",
    options: [
      { label: "Use personal email" },
      { label: "Send without encryption" },
      { label: "Use encrypted email", isCorrect: true },
      { label: "Forward to any colleague" },
    ],
  },
  {
    question: "What should you do if a laptop with PHI is lost?",
    options: [
      { label: "Wait to see if it returns" },
      { label: "Report immediately to compliance", isCorrect: true },
      { label: "Ignore if it was locked" },
      { label: "Delete files remotely later" },
    ],
  },
]

function toOptionList(options: unknown): QuizOption[] {
  if (!Array.isArray(options)) return []
  return options
    .map((option) => {
      if (typeof option === "string") {
        return { label: option }
      }
      if (typeof option === "object" && option) {
        const label = String(
          (option as { label?: string; text?: string }).label ??
            (option as { label?: string; text?: string }).text ??
            ""
        )
        if (!label) return null
        return {
          label,
          isCorrect: Boolean(
            (option as { isCorrect?: boolean }).isCorrect ??
              (option as { correct?: boolean }).correct
          ) || undefined,
          score: typeof (option as { score?: number }).score === "number"
            ? (option as { score?: number }).score
            : undefined,
        }
      }
      return null
    })
    .filter(Boolean) as QuizOption[]
}

export function parseQuizQuestions(content: unknown): QuizQuestion[] {
  const rawQuestions: unknown[] = Array.isArray(content)
    ? content
    : typeof content === "object" && content && Array.isArray((content as { questions?: unknown }).questions)
      ? (content as { questions?: unknown[] }).questions ?? []
      : []

  const questions = rawQuestions
    .map((question) => {
      if (typeof question !== "object" || !question) return null
      const questionText = String(
        (question as { question?: string; prompt?: string }).question ??
          (question as { question?: string; prompt?: string }).prompt ??
          ""
      )
      if (!questionText) return null
      const options = toOptionList((question as { options?: unknown; choices?: unknown }).options ?? (question as { choices?: unknown }).choices)
      if (options.length === 0) return null
      return {
        id: (question as { id?: string }).id,
        question: questionText,
        options,
        correctIndex:
          typeof (question as { correctIndex?: number; correct_index?: number }).correctIndex === "number"
            ? (question as { correctIndex?: number }).correctIndex
            : typeof (question as { correct_index?: number }).correct_index === "number"
              ? (question as { correct_index?: number }).correct_index
              : undefined,
        correctAnswer:
          (question as { correctAnswer?: string; correct_answer?: string }).correctAnswer ??
          (question as { correct_answer?: string }).correct_answer ??
          undefined,
        explanation: (question as { explanation?: string }).explanation,
      }
    })
    .filter(Boolean) as QuizQuestion[]

  return questions.length ? questions : fallbackQuestions
}

export function resolveCorrectIndex(question: QuizQuestion) {
  if (typeof question.correctIndex === "number") return question.correctIndex
  const flaggedIndex = question.options.findIndex((option) => option.isCorrect)
  if (flaggedIndex >= 0) return flaggedIndex
  if (question.correctAnswer) {
    const normalized = question.correctAnswer.trim().toLowerCase()
    const matchIndex = question.options.findIndex(
      (option) => option.label.trim().toLowerCase() === normalized
    )
    if (matchIndex >= 0) return matchIndex
  }
  return null
}

export function shuffle<T>(items: T[]) {
  const array = [...items]
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const current = array[i]
    const next = array[j]
    if (current === undefined || next === undefined) continue
    array[i] = next
    array[j] = current
  }
  return array
}

export function parseScenario(content: unknown): { nodes: ScenarioNode[]; startId?: string } {
  if (typeof content === "object" && content && Array.isArray((content as { nodes?: unknown }).nodes)) {
    const rawNodes: unknown[] = (content as { nodes?: unknown[] }).nodes ?? []
    const nodes = rawNodes
      .map((node) => {
        if (typeof node !== "object" || !node) return null
        const id = String((node as { id?: string }).id ?? "")
        const prompt = String((node as { prompt?: string; question?: string }).prompt ?? (node as { question?: string }).question ?? "")
        const rawOptions = Array.isArray((node as { options?: unknown }).options)
          ? (node as { options?: unknown[] }).options ?? []
          : []
        const options = rawOptions
              .map((option) => {
                if (typeof option !== "object" || !option) return null
                return {
                  label: String((option as { label?: string }).label ?? ""),
                  nextId: (option as { nextId?: string; next_id?: string }).nextId ??
                    (option as { next_id?: string }).next_id,
                  isCorrect: (option as { isCorrect?: boolean; correct?: boolean }).isCorrect ??
                    (option as { correct?: boolean }).correct,
                  score: typeof (option as { score?: number }).score === "number"
                    ? (option as { score?: number }).score
                    : undefined,
                  scoreDelta: typeof (option as { scoreDelta?: number; score_delta?: number }).scoreDelta === "number"
                    ? (option as { scoreDelta?: number }).scoreDelta
                    : typeof (option as { score_delta?: number }).score_delta === "number"
                      ? (option as { score_delta?: number }).score_delta
                      : undefined,
                  feedback: (option as { feedback?: string }).feedback,
                }
              })
              .filter((option) => option && option.label) as ScenarioOption[]
        if (!id || !prompt || options.length === 0) return null
        return { id, prompt, options }
      })
      .filter(Boolean) as ScenarioNode[]

    return {
      nodes,
      startId: (content as { startId?: string; start_id?: string }).startId ??
        (content as { start_id?: string }).start_id,
    }
  }

  if (Array.isArray(content)) {
    return { nodes: parseScenario({ nodes: content }).nodes }
  }

  return { nodes: [] }
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export { fallbackQuestions }
