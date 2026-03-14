import { createClient } from "@/utils/supabase/client"
import { LIST_LIMIT } from "@/lib/query-limits"
import type { Database } from "@/types/supabase"
import type { CalendarTask } from "@/types/operations"

type CalendarTaskRow = Pick<
  Database["public"]["Tables"]["calendar_tasks"]["Row"],
  | "id"
  | "title"
  | "due_date"
  | "status"
  | "task_type"
  | "recurrence_rule"
  | "notification_days_before"
  | "assigned_to"
  | "linked_entity_id"
  | "completed_at"
>

function mapRow(row: CalendarTaskRow): CalendarTask {
  return {
    id: row.id,
    title: row.title,
    dueDate: row.due_date,
    status: row.status === "done" ? "done" : "open",
    taskType: row.task_type ?? "custom",
    recurrenceRule: row.recurrence_rule ?? "none",
    notificationDaysBefore: row.notification_days_before ?? [],
    assignedTo: row.assigned_to ?? null,
    linkedEntityId: row.linked_entity_id ?? null,
    completedAt: row.completed_at ?? null,
  }
}

export async function fetchCalendarTasks(organizationId: string): Promise<CalendarTask[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("calendar_tasks")
    .select(
      "id, title, due_date, status, task_type, recurrence_rule, notification_days_before, assigned_to, linked_entity_id, completed_at"
    )
    .eq("organization_id", organizationId)
    .order("due_date", { ascending: true })
    .limit(LIST_LIMIT)

  if (error) throw error
  return (data ?? []).map(mapRow)
}

async function updateTask(
  taskId: string,
  updates: Partial<Database["public"]["Tables"]["calendar_tasks"]["Update"]>
): Promise<CalendarTask> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("calendar_tasks")
    .update(updates)
    .eq("id", taskId)
    .select(
      "id, title, due_date, status, task_type, recurrence_rule, notification_days_before, assigned_to, linked_entity_id, completed_at"
    )
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('Task not found')
  return mapRow(data)
}

export async function markCalendarTaskComplete(taskId: string): Promise<CalendarTask> {
  return updateTask(taskId, { status: "done", completed_at: new Date().toISOString() })
}

export async function snoozeCalendarTask(taskId: string, dueDate: string): Promise<CalendarTask> {
  return updateTask(taskId, { due_date: dueDate })
}

export async function reassignCalendarTask(
  taskId: string,
  assignedTo: string | null
): Promise<CalendarTask> {
  return updateTask(taskId, { assigned_to: assignedTo })
}
