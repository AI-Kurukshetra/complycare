import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { TrainingModulePlayer } from "@/components/training/module-player"
import type { TrainingModule } from "@/types/training"

const createTrainingCompletion = vi.fn()
const createCertificatePdf = vi.fn()

vi.mock("@/services/training", () => ({
  createTrainingCompletion: (...args: unknown[]) => createTrainingCompletion(...args),
}))

vi.mock("@/lib/certificate-generator", () => ({
  createCertificatePdf: (...args: unknown[]) => createCertificatePdf(...args),
}))

describe("TrainingModulePlayer", () => {
  beforeEach(() => {
    createTrainingCompletion.mockReset()
    createCertificatePdf.mockReset()
    globalThis.URL.createObjectURL = vi.fn(
      () => "blob:certificate"
    ) as unknown as typeof URL.createObjectURL
    globalThis.URL.revokeObjectURL = vi.fn() as unknown as typeof URL.revokeObjectURL
  })

  it("submits quiz completion and generates certificate on pass", async () => {
    const trainingModule: TrainingModule = {
      id: "module-1",
      title: "HIPAA Basics",
      description: null,
      moduleType: "quiz",
      content: [
        {
          question: "What protects ePHI?",
          options: [
            { label: "Security Rule", isCorrect: true },
            { label: "Privacy Rule" },
          ],
        },
      ],
      estimatedMinutes: 5,
      passingScore: 80,
      isRequired: true,
      dueDate: null,
    }

    createCertificatePdf.mockReturnValue({
      certificateId: "cert-001",
      fileName: "certificate.pdf",
      blob: new Blob(["test"], { type: "application/pdf" }),
    })

    createTrainingCompletion.mockResolvedValue({ id: "completion-1" })

    const onCompletion = vi.fn()

    render(
      <TrainingModulePlayer
        module={trainingModule}
        employeeName="Jordan Lee"
        organizationName="Northwind"
        previousAttempts={0}
        onCompletion={onCompletion}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Security Rule" }))
    fireEvent.click(screen.getByRole("button", { name: /submit/i }))

    await waitFor(() => {
      expect(createTrainingCompletion).toHaveBeenCalledWith(
        "module-1",
        100,
        "cert-001",
        1
      )
    })

    expect(createCertificatePdf).toHaveBeenCalled()
    expect(onCompletion).toHaveBeenCalled()
    expect(await screen.findByText(/Certificate generated/i)).toBeInTheDocument()
  })
})
