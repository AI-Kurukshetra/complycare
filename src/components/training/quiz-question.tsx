import { cn } from "@/lib/utils"
import type { QuizQuestion } from "@/lib/training-parser"

export function QuizQuestionCard({
  question,
  selectedIndex,
  onSelect,
}: {
  question: QuizQuestion
  selectedIndex: number | null
  onSelect: (index: number) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Question
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">
          {question.question}
        </h3>
      </div>

      <div className="grid gap-3">
        {question.options.map((option, index) => (
          <button
            key={`${option.label}-${index}`}
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              "rounded-2xl border px-4 py-3 text-left text-sm font-medium transition",
              selectedIndex === index
                ? "border-cyan-500 bg-cyan-50 text-cyan-900"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {question.explanation ? (
        <p className="text-xs text-slate-500">{question.explanation}</p>
      ) : null}
    </div>
  )
}
