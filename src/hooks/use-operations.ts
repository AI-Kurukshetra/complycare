"use client"

import { useMemo, useState } from "react"
import type {
  AuditLog,
  CalendarTask,
  DocumentItem,
  Incident,
  IncidentStep,
  PolicyTemplate,
} from "@/types/operations"
import { incidentStepTemplates, policyTemplates } from "@/lib/operations-data"
import {
  addIncidentSteps,
  completeIncidentStep,
  createCalendarTask,
  createIncident,
  createPolicyInstance,
  ensureOrgMembership,
  ensureOrganization,
  logAuditEvent,
  uploadDocument,
} from "@/services/operations"
import { getActiveOrgId } from "@/lib/active-org"

export function useOperations() {
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [orgName, setOrgName] = useState("Northwind Family Clinic")
  const [orgType, setOrgType] = useState("Primary Care")
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [calendarTasks, setCalendarTasks] = useState<CalendarTask[]>([])
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [saving, setSaving] = useState(false)
  const [inviteStatus, setInviteStatus] = useState<string | null>(null)
  const templates = useMemo<PolicyTemplate[]>(() => policyTemplates, [])

  async function ensureOrg() {
    if (organizationId) return organizationId
    const activeOrgId = getActiveOrgId()
    if (activeOrgId) {
      setOrganizationId(activeOrgId)
      return activeOrgId
    }
    const id = await ensureOrganization(orgName, orgType)
    await ensureOrgMembership(id, "owner")
    setOrganizationId(id)
    return id
  }

  async function startIncident(title: string, severity: "low" | "medium" | "high") {
    setSaving(true)
    const orgId = await ensureOrg()
    const incident = await createIncident(orgId, title, severity)
    const stepRows = await addIncidentSteps(incident.id, incidentStepTemplates)

    const steps: IncidentStep[] = stepRows.map((step) => ({
      id: step.id,
      title: step.title,
      status: step.status === "done" ? "done" : "pending",
      completedAt: step.completed_at ?? undefined,
    }))

    const incidentRecord: Incident = {
      id: incident.id,
      title,
      severity,
      status: "open",
      createdAt: incident.created_at,
      steps,
    }

    setIncidents((prev) => [incidentRecord, ...prev])
    await logAuditEvent(orgId, "Incident created", "incident", incident.id)
    setAuditLogs((prev) => [
      {
        id: `${Date.now()}-incident`,
        action: "Incident created",
        entityType: "incident",
        entityId: incident.id,
        actor: "demo-user",
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
    setSaving(false)
  }

  async function addCalendarItem(title: string, dueDate: string) {
    setSaving(true)
    const orgId = await ensureOrg()
    const id = await createCalendarTask(orgId, title, dueDate)
    setCalendarTasks((prev) => [
      {
        id,
        title,
        dueDate,
        status: "open",
        taskType: "custom",
        recurrenceRule: "none",
        notificationDaysBefore: [30, 7, 1],
      },
      ...prev,
    ])
    await logAuditEvent(orgId, "Calendar task created", "calendar_task", id)
    setAuditLogs((prev) => [
      {
        id: `${Date.now()}-calendar`,
        action: "Calendar task created",
        entityType: "calendar_task",
        entityId: id,
        actor: "demo-user",
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
    setSaving(false)
  }

  async function applyTemplate(templateId: string) {
    setSaving(true)
    const orgId = await ensureOrg()
    const id = await createPolicyInstance(orgId, templateId)
    await logAuditEvent(orgId, "Policy applied", "policy_instance", id, { templateId })
    setAuditLogs((prev) => [
      {
        id: `${Date.now()}-policy`,
        action: "Policy applied",
        entityType: "policy_instance",
        entityId: id,
        actor: "demo-user",
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
    setSaving(false)
  }

  async function addDocument(file: File, title: string, tags: string[]) {
    setSaving(true)
    const orgId = await ensureOrg()
    const { id, path } = await uploadDocument(orgId, file, title, tags)
    setDocuments((prev) => [
      {
        id,
        title,
        tags,
        storagePath: path,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
    await logAuditEvent(orgId, "Document uploaded", "document", id)
    setAuditLogs((prev) => [
      {
        id: `${Date.now()}-document`,
        action: "Document uploaded",
        entityType: "document",
        entityId: id,
        actor: "demo-user",
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
    setSaving(false)
  }

  return {
    orgName,
    orgType,
    setOrgName,
    setOrgType,
    incidents,
    calendarTasks,
    documents,
    auditLogs,
    saving,
    templates,
    startIncident,
    addCalendarItem,
    applyTemplate,
    addDocument,
    inviteStatus,
    inviteMember: async (email: string, role: "owner" | "member") => {
      setSaving(true)
      setInviteStatus(null)
      const orgId = await ensureOrg()
      const response = await fetch("/api/members/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId, email, role }),
      })

      if (!response.ok) {
        const payload = await response.json()
        setInviteStatus(payload?.error ?? "Invite failed.")
        setSaving(false)
        return
      }

      await logAuditEvent(orgId, "Member invited", "org_member")
      setAuditLogs((prev) => [
        {
          id: `${Date.now()}-invite`,
          action: "Member invited",
          entityType: "org_member",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ])
      setInviteStatus("Invite sent.")
      setSaving(false)
    },
    completeIncidentStep: async (incidentId: string, stepId: string) => {
      setSaving(true)
      await completeIncidentStep(stepId)
      setIncidents((prev) =>
        prev.map((incident) =>
          incident.id === incidentId
            ? {
                ...incident,
                steps: incident.steps.map((step) =>
                  step.id === stepId
                    ? { ...step, status: "done", completedAt: new Date().toISOString() }
                    : step
                ),
              }
            : incident
        )
      )
      const orgId = organizationId ?? ""
      if (orgId) {
        await logAuditEvent(orgId, "Incident step completed", "incident_step", stepId)
      }
      setAuditLogs((prev) => [
        {
          id: `${Date.now()}-incident-step`,
          action: "Incident step completed",
          entityType: "incident_step",
          entityId: stepId,
          actor: "demo-user",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ])
      setSaving(false)
    },
  }
}
