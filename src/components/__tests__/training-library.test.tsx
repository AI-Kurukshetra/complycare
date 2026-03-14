import { render, screen } from "@testing-library/react"
import { useEffect } from "react"
import { describe, expect, it, vi } from "vitest"
import { TrainingLibrary } from "@/components/training/training-library"
import type { TrainingModule, TrainingCompletion } from "@/types/training"

const mockUseTraining = vi.fn()

vi.mock("@/hooks/use-training", () => ({
  useTraining: () => mockUseTraining(),
}))

vi.mock("@/components/auth-panel", () => ({
  AuthPanel: ({ onAuth }: { onAuth?: (email: string | null) => void }) => {
    useEffect(() => {
      onAuth?.("demo@acme.test")
    }, [onAuth])
    return <div>AuthPanel</div>
  },
}))

describe("TrainingLibrary", () => {
  it("renders module cards and progress summary", () => {
    const modules: TrainingModule[] = [
      {
        id: "mod-1",
        title: "HIPAA Basics",
        description: "Intro",
        moduleType: "quiz",
        content: [],
        estimatedMinutes: 10,
        passingScore: 80,
        isRequired: true,
        dueDate: null,
      },
      {
        id: "mod-2",
        title: "Privacy Scenarios",
        description: "Scenarios",
        moduleType: "scenario",
        content: [],
        estimatedMinutes: 12,
        passingScore: 80,
        isRequired: false,
        dueDate: null,
      },
    ]

    const completions: TrainingCompletion[] = [
      {
        id: "comp-1",
        moduleId: "mod-1",
        score: 90,
        completedAt: new Date().toISOString(),
        certificateUrl: null,
        attempts: 1,
      },
    ]

    mockUseTraining.mockReturnValue({
      modules,
      completions,
      loading: false,
      summary: {
        requiredTotal: 1,
        requiredCompleted: 1,
        averageScore: 90,
        overdueCount: 0,
      },
      refresh: vi.fn(),
    })

    render(<TrainingLibrary />)

    expect(screen.getByText("HIPAA Basics")).toBeInTheDocument()
    expect(screen.getByText("Privacy Scenarios")).toBeInTheDocument()
    expect(screen.getByText(/1 of 1 required modules/i)).toBeInTheDocument()
    expect(screen.getByText(/100% complete/i)).toBeInTheDocument()
  })

  it("shows empty state when no modules are available", () => {
    mockUseTraining.mockReturnValue({
      modules: [],
      completions: [],
      loading: false,
      summary: {
        requiredTotal: 0,
        requiredCompleted: 0,
        averageScore: 0,
        overdueCount: 0,
      },
      refresh: vi.fn(),
    })

    render(<TrainingLibrary />)

    expect(screen.getByText(/No training modules yet/i)).toBeInTheDocument()
  })
})
