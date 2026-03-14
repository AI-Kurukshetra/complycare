export type TrainingModuleType = "video" | "quiz" | "scenario"

export type TrainingModule = {
  id: string
  title: string
  description: string | null
  moduleType: TrainingModuleType
  content: unknown
  estimatedMinutes: number
  passingScore: number
  isRequired: boolean
  dueDate: string | null
}

export type TrainingCompletion = {
  id: string
  moduleId: string
  score: number | null
  completedAt: string | null
  certificateUrl: string | null
  attempts: number
}
