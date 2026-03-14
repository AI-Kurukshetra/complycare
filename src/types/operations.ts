export type Incident = {
  id: string
  title: string
  severity: "low" | "medium" | "high"
  status: "open" | "resolved"
  createdAt: string
  steps: IncidentStep[]
}

export type IncidentStep = {
  id: string
  title: string
  status: "pending" | "done"
  completedAt?: string
}

export type CalendarTask = {
  id: string
  title: string
  dueDate: string
  status: "open" | "done"
  taskType: string
  recurrenceRule: string
  notificationDaysBefore: number[]
  assignedTo?: string | null
  linkedEntityId?: string | null
  completedAt?: string | null
}

export type PolicyTemplate = {
  id: string
  title: string
  category: string
  body: string
  version: string
}

export type PolicyInstance = {
  id: string
  templateId: string
  status: "draft" | "active"
  appliedAt?: string
}

export type DocumentItem = {
  id: string
  title: string
  tags: string[]
  storagePath?: string
  createdAt: string
}

export type AuditLog = {
  id: string
  action: string
  entityType: string
  entityId?: string
  actor?: string
  createdAt: string
  metadata?: Record<string, unknown>
}
