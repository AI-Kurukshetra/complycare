"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { SectionCard } from "@/components/ui/section-card"
import { createTrainingCompletion } from "@/services/training"
import type { TrainingModule } from "@/types/training"
import { createCertificatePdf } from "@/lib/certificate-generator"
import { QuizQuestionCard } from "@/components/training/quiz-question"
import { ScenarioPlayer } from "@/components/training/scenario-player"
import {
  formatDuration,
  parseQuizQuestions,
  parseScenario,
  resolveCorrectIndex,
  shuffle,
  type ScenarioDecision,
} from "@/lib/training-parser"

export function TrainingModulePlayer({
  module,
  employeeName,
  organizationName,
  previousAttempts,
  onCompletion,
}: {
  module: TrainingModule
  employeeName: string
  organizationName: string
  previousAttempts: number
  onCompletion?: () => void
}) {
  const [attemptCount, setAttemptCount] = useState(previousAttempts)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [answers, setAnswers] = useState<{ correct: boolean }[]>([])
  const [scenarioProgress, setScenarioProgress] = useState({ current: 1, total: 1 })
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [result, setResult] = useState<{
    score: number
    passed: boolean
    certificateId?: string
    certificateUrl?: string
    certificateName?: string
  } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [shuffleSeed, setShuffleSeed] = useState(0)

  const questions = useMemo(() => parseQuizQuestions(module.content), [module.content])
  const scenario = useMemo(() => parseScenario(module.content), [module.content])

  const orderedQuestions = useMemo(() => {
    if (module.moduleType !== "quiz") return []
    return shuffleSeed === 0 ? questions : shuffle(questions)
  }, [module.moduleType, questions, shuffleSeed])

  useEffect(() => {
    setAttemptCount(previousAttempts)
  }, [previousAttempts])

  useEffect(() => {
    if (result) return
    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
    return () => window.clearInterval(interval)
  }, [result])

  useEffect(() => {
    return () => {
      if (result?.certificateUrl) {
        URL.revokeObjectURL(result.certificateUrl)
      }
    }
  }, [result])

  const progressTotal =
    module.moduleType === "quiz"
      ? orderedQuestions.length
      : module.moduleType === "scenario"
        ? scenario.nodes.length
        : 1

  const progressCurrent =
    module.moduleType === "quiz"
      ? Math.min(questionIndex + 1, orderedQuestions.length)
      : module.moduleType === "scenario"
        ? scenarioProgress.current
        : 1

  async function finalize(score: number) {
    const passed = score >= module.passingScore
    const attemptNumber = attemptCount + 1
    setSubmitting(true)
    setStatusMessage(null)

    let certificateId: string | undefined
    let certificateUrl: string | undefined
    let certificateName: string | undefined

    if (passed) {
      const completionDate = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      const certificate = createCertificatePdf({
        employeeName,
        moduleTitle: module.title,
        completionDate,
        score,
        organizationName,
      })
      certificateId = certificate.certificateId
      certificateName = certificate.fileName
      certificateUrl = URL.createObjectURL(certificate.blob)
    }

    try {
      await createTrainingCompletion(module.id, score, certificateId ?? null, attemptNumber)
      setAttemptCount((prev) => prev + 1)
      setResult({ score, passed, certificateId, certificateUrl, certificateName })
      onCompletion?.()
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to save completion record."
      )
    } finally {
      setSubmitting(false)
    }
  }

  function handleNextQuestion() {
    if (selectedIndex === null) return
    const question = orderedQuestions[questionIndex]
    if (!question) return
    const correctIndex = resolveCorrectIndex(question)
    const isCorrect = correctIndex === null ? true : selectedIndex === correctIndex
    const nextAnswers = [...answers, { correct: isCorrect }]

    if (questionIndex + 1 >= orderedQuestions.length) {
      const correctCount = nextAnswers.filter((answer) => answer.correct).length
      const score = Math.round((correctCount / orderedQuestions.length) * 100)
      finalize(score)
      return
    }

    setAnswers(nextAnswers)
    setQuestionIndex((prev) => prev + 1)
    setSelectedIndex(null)
  }

  function handleScenarioComplete(decisions: ScenarioDecision[]) {
    const scores = decisions
      .map((decision) => decision.score)
      .filter((score): score is number => typeof score === "number")
    const scoredAverage = scores.length
      ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length)
      : 100
    finalize(scoredAverage)
  }

  function handleVideoComplete() {
    finalize(100)
  }

  function handleRetry() {
    setQuestionIndex(0)
    setSelectedIndex(null)
    setAnswers([])
    setScenarioProgress({ current: 1, total: Math.max(progressTotal, 1) })
    setElapsedSeconds(0)
    setResult(null)
    setStatusMessage(null)
    setShuffleSeed((prev) => prev + 1)
  }

  return (
    <SectionCard
      title="Module player"
      description={`Passing score ${module.passingScore}% · Estimated ${module.estimatedMinutes} min`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-700">
            Progress {progressCurrent} of {progressTotal}
          </p>
          <div className="mt-2 h-2 w-full max-w-[12rem] rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-cyan-600"
              style={{
                width: `${progressTotal ? Math.round((progressCurrent / progressTotal) * 100) : 0}%`,
              }}
            />
          </div>
        </div>
        <div className="text-sm text-slate-600">
          Time elapsed <span className="font-semibold text-slate-900">{formatDuration(elapsedSeconds)}</span>
        </div>
      </div>

      <div className="mt-6">
        {result ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-800">Attempt complete</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {result.score}% · {result.passed ? "Passed" : "Needs retry"}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Attempt #{attemptCount} · Passing score {module.passingScore}%
            </p>

            {result.passed ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-800">
                  Certificate generated
                </p>
                <p className="text-xs text-emerald-700">ID: {result.certificateId}</p>
                {result.certificateUrl && result.certificateName ? (
                  <div className="mt-3">
                    <Button asChild size="sm" variant="outline">
                      <a href={result.certificateUrl} download={result.certificateName}>
                        Download certificate
                      </a>
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {statusMessage ? (
              <p className="mt-3 text-xs text-rose-600">{statusMessage}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={handleRetry} variant={result.passed ? "outline" : "default"}>
                {result.passed ? "Retake module" : "Retry module"}
              </Button>
            </div>
          </div>
        ) : module.moduleType === "quiz" ? (
          orderedQuestions.length ? (
            <div className="grid gap-6">
              <QuizQuestionCard
                question={orderedQuestions[questionIndex]}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  Question {questionIndex + 1} of {orderedQuestions.length}
                </p>
                <Button size="sm" onClick={handleNextQuestion} disabled={selectedIndex === null || submitting}>
                  {questionIndex + 1 === orderedQuestions.length ? "Submit" : "Next question"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              This module does not have quiz content yet.
            </div>
          )
        ) : module.moduleType === "scenario" ? (
          scenario.nodes.length ? (
            <ScenarioPlayer
              key={shuffleSeed}
              nodes={scenario.nodes}
              startId={scenario.startId}
              onComplete={handleScenarioComplete}
              onProgress={setScenarioProgress}
            />
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              This scenario module does not have decision steps yet.
            </div>
          )
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold text-slate-800">Video module</p>
            <p className="mt-2 text-sm text-slate-600">
              Review the content and mark the training as complete.
            </p>
            <div className="mt-4 h-56 rounded-2xl border border-dashed border-slate-200 bg-slate-50" />
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={handleVideoComplete} disabled={submitting}>
                Mark complete
              </Button>
            </div>
          </div>
        )}
      </div>

      {statusMessage && !result ? (
        <p className="mt-4 text-xs text-rose-600">{statusMessage}</p>
      ) : null}

      {submitting ? (
        <p className="mt-4 text-xs text-slate-500">Saving completion...</p>
      ) : null}
    </SectionCard>
  )
}
