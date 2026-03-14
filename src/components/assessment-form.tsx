"use client"

import type { AssessmentAnswerMap, AssessmentQuestion } from "@/types/compliance"

type AssessmentFormProps = {
  questions: AssessmentQuestion[]
  answers: AssessmentAnswerMap
  onAnswer: (questionId: string, optionValue: string) => void
}

export function AssessmentForm({ questions, answers, onAnswer }: AssessmentFormProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Risk Assessment Sprint</h2>
          <p className="text-sm text-slate-500">
            Answer 12 questions to generate a compliance snapshot.
          </p>
        </div>
        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
          ~10 minutes
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-5">
        {questions.map((question, index) => (
          <div key={question.id} className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Q{index + 1}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{question.prompt}</p>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {question.options.map((option) => {
                const selected = answers[question.id]?.value === option.value
                return (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                      selected
                        ? "border-cyan-500 bg-cyan-50 text-cyan-900"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.value}
                      checked={selected}
                      onChange={() => onAnswer(question.id, option.value)}
                      className="h-3 w-3 accent-cyan-600"
                    />
                    {option.label}
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
