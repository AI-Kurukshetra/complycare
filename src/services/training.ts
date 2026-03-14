import { createClient } from "@/utils/supabase/client"
import { LIST_LIMIT } from "@/lib/query-limits"
import type { TrainingCompletion, TrainingModule, TrainingModuleType } from "@/types/training"

const moduleTypeLookup = new Set<TrainingModuleType>(["video", "quiz", "scenario"])

function normalizeModuleType(value: string | null | undefined): TrainingModuleType {
  if (value && moduleTypeLookup.has(value as TrainingModuleType)) {
    return value as TrainingModuleType
  }
  return "quiz"
}

export async function fetchTrainingModules(organizationId: string): Promise<TrainingModule[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("training_sims")
    .select(
      "id, title, description, module_type, content_json, estimated_minutes, passing_score, is_required, due_date"
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(LIST_LIMIT)

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    moduleType: normalizeModuleType(row.module_type),
    content: row.content_json ?? [],
    estimatedMinutes: row.estimated_minutes ?? 0,
    passingScore: row.passing_score ?? 0,
    isRequired: row.is_required ?? false,
    dueDate: row.due_date ?? null,
  }))
}

export async function fetchTrainingModuleById(moduleId: string): Promise<TrainingModule | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("training_sims")
    .select(
      "id, title, description, module_type, content_json, estimated_minutes, passing_score, is_required, due_date"
    )
    .eq("id", moduleId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    id: data.id,
    title: data.title,
    description: data.description ?? null,
    moduleType: normalizeModuleType(data.module_type),
    content: data.content_json ?? [],
    estimatedMinutes: data.estimated_minutes ?? 0,
    passingScore: data.passing_score ?? 0,
    isRequired: data.is_required ?? false,
    dueDate: data.due_date ?? null,
  }
}

export async function fetchTrainingCompletions(userId: string): Promise<TrainingCompletion[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("training_completions")
    .select("id, module_id, score, completed_at, certificate_url, attempts")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })
    .limit(LIST_LIMIT)

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    moduleId: row.module_id,
    score: row.score ?? null,
    completedAt: row.completed_at ?? null,
    certificateUrl: row.certificate_url ?? null,
    attempts: row.attempts ?? 1,
  }))
}

export async function fetchTrainingCompletionsForModule(
  userId: string,
  moduleId: string
): Promise<TrainingCompletion[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("training_completions")
    .select("id, module_id, score, completed_at, certificate_url, attempts")
    .eq("user_id", userId)
    .eq("module_id", moduleId)
    .order("completed_at", { ascending: false })
    .limit(LIST_LIMIT)

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    moduleId: row.module_id,
    score: row.score ?? null,
    completedAt: row.completed_at ?? null,
    certificateUrl: row.certificate_url ?? null,
    attempts: row.attempts ?? 1,
  }))
}

export async function createTrainingCompletion(
  moduleId: string,
  score: number,
  certificateUrl?: string | null,
  attempts = 1
) {
  const supabase = createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const userId = userData.user?.id
  if (!userId) throw new Error("No authenticated user")

  const { data, error } = await supabase
    .from("training_completions")
    .insert({
      module_id: moduleId,
      user_id: userId,
      score,
      completed_at: new Date().toISOString(),
      certificate_url: certificateUrl ?? null,
      attempts,
    })
    .select("id, completed_at")
    .single()

  if (error) throw error
  return data
}
