"use client"

import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import type {
  ScenarioDecision,
  ScenarioNode,
  ScenarioOption,
} from "@/lib/training-parser"

export function ScenarioPlayer({
  nodes,
  startId,
  onComplete,
  onProgress,
}: {
  nodes: ScenarioNode[]
  startId?: string
  onComplete: (decisions: ScenarioDecision[]) => void
  onProgress?: (progress: { current: number; total: number }) => void
}) {
  const nodeLookup = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes])
  const initialId = startId ?? nodes[0]?.id ?? ""
  const [currentId, setCurrentId] = useState(initialId)
  const [decisions, setDecisions] = useState<ScenarioDecision[]>([])

  const currentNode = nodeLookup.get(currentId)

  useEffect(() => {
    onProgress?.({ current: Math.min(decisions.length + 1, nodes.length), total: nodes.length })
  }, [decisions.length, nodes.length, onProgress])

  if (!currentNode) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Scenario content is missing.
      </div>
    )
  }

  function resolveScore(option: ScenarioOption) {
    if (typeof option.score === "number") return option.score
    if (typeof option.scoreDelta === "number") return option.scoreDelta
    if (typeof option.isCorrect === "boolean") return option.isCorrect ? 100 : 0
    return null
  }

  function handleSelect(index: number) {
    if (!currentNode) return
    const option = currentNode.options[index]
    if (!option) return
    const nextDecision: ScenarioDecision = {
      nodeId: currentNode.id,
      optionIndex: index,
      score: resolveScore(option),
      isCorrect: typeof option.isCorrect === "boolean" ? option.isCorrect : null,
    }
    const nextDecisions = [...decisions, nextDecision]
    setDecisions(nextDecisions)

    if (option.nextId && nodeLookup.has(option.nextId)) {
      setCurrentId(option.nextId)
      return
    }

    onComplete(nextDecisions)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Scenario
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">{currentNode.prompt}</h3>
      </div>

      <div className="grid gap-3">
        {currentNode.options.map((option, index) => (
          <button
            key={`${option.label}-${index}`}
            type="button"
            onClick={() => handleSelect(index)}
            className={cn(
              "rounded-2xl border px-4 py-3 text-left text-sm font-medium transition",
              "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            )}
          >
            <p className="font-semibold text-slate-900">{option.label}</p>
            {option.feedback ? (
              <p className="mt-1 text-xs text-slate-500">{option.feedback}</p>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  )
}
