"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { SectionCard } from "@/components/ui/section-card"
import { ListItem } from "@/components/ui/list-item"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { DashboardHeader } from "@/components/dashboard-header"
import { OrgSettingsCard } from "@/components/org-settings-card"
import { AuthRequiredBanner } from "@/components/auth-required-banner"
import { useOperations } from "@/hooks/use-operations"
import { AuthPanel } from "@/components/auth-panel"

const severityOptions = ["low", "medium", "high"] as const

const navLinks = [
  { label: "Open Governance", href: "/governance" },
  { label: "Risk Snapshot", href: "/" },
]

export function OperationsDashboard() {
  const {
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
    completeIncidentStep,
    inviteMember,
    inviteStatus,
  } = useOperations()

  const [incidentTitle, setIncidentTitle] = useState("Suspicious access alert")
  const [incidentSeverity, setIncidentSeverity] = useState<(typeof severityOptions)[number]>(
    "medium"
  )
  const [taskTitle, setTaskTitle] = useState("Quarterly access review")
  const [taskDueDate, setTaskDueDate] = useState("")
  const [docTitle, setDocTitle] = useState("")
  const [docTags, setDocTags] = useState("")
  const [docFile, setDocFile] = useState<File | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"owner" | "member">("member")
  const [auditPage, setAuditPage] = useState(1)
  const auditPageSize = 20

  const filteredDocuments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return documents
    return documents.filter((doc) => {
      return (
        doc.title.toLowerCase().includes(term) ||
        doc.tags.some((tag) => tag.toLowerCase().includes(term))
      )
    })
  }, [documents, searchTerm])

  const auditPageCount = Math.max(1, Math.ceil(auditLogs.length / auditPageSize))
  const pagedAuditLogs = useMemo(
    () => auditLogs.slice((auditPage - 1) * auditPageSize, auditPage * auditPageSize),
    [auditLogs, auditPage, auditPageSize]
  )

  useEffect(() => {
    function reset() { setAuditPage(1) }
    reset()
  }, [auditLogs.length])

  useEffect(() => {
    function clamp() { if (auditPage > auditPageCount) setAuditPage(auditPageCount) }
    clamp()
  }, [auditPage, auditPageCount])

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <DashboardHeader
        eyebrow="Phase 2 Operations"
        title="Compliance Operations Core"
        description="Manage incident response, compliance calendars, policy templates, and evidence documentation from one place."
        saving={saving}
        navLinks={navLinks}
      >
        <OrgSettingsCard
          orgName={orgName}
          orgType={orgType}
          onOrgNameChange={setOrgName}
          onOrgTypeChange={setOrgType}
        >
          <p className="text-xs text-slate-500 md:col-span-2">
            Note: Supabase Storage bucket `compliance-documents` must exist for uploads.
          </p>
        </OrgSettingsCard>
      </DashboardHeader>

      <AuthPanel onAuth={setCurrentUser} />

      {!currentUser && <AuthRequiredBanner />}

      <section
        className={`grid gap-6 md:grid-cols-[1.1fr_0.9fr] ${
          currentUser ? "" : "pointer-events-none opacity-60"
        }`}
      >
        <div className="flex flex-col gap-6">
          <SectionCard>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Incident Response Workflow</h2>
                <p className="text-sm text-slate-500">
                  Start an incident and track every response step.
                </p>
              </div>
              <Button
                onClick={() => startIncident(incidentTitle, incidentSeverity)}
                disabled={saving}
              >
                Start Incident
              </Button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-[2fr_1fr]">
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={incidentTitle}
                onChange={(event) => setIncidentTitle(event.target.value)}
                placeholder="Incident title"
              />
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={incidentSeverity}
                onChange={(event) =>
                  setIncidentSeverity(event.target.value as (typeof severityOptions)[number])
                }
              >
                {severityOptions.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              {incidents.length === 0 ? (
                <EmptyState
                  title="No incidents started"
                  description="Start an incident to track response steps."
                />
              ) : (
                incidents.map((incident) => (
                  <div key={incident.id} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{incident.title}</p>
                        <p className="text-xs text-slate-500">Severity: {incident.severity}</p>
                      </div>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        {incident.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-col gap-2">
                      {incident.steps.map((step) => (
                        <label
                          key={step.id}
                          className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={step.status === "done"}
                            onChange={() =>
                              step.status === "done"
                                ? null
                                : completeIncidentStep(incident.id, step.id)
                            }
                            className="h-3 w-3 accent-emerald-600"
                          />
                          <span
                            className={step.status === "done" ? "text-slate-400" : "text-slate-700"}
                          >
                            {step.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Compliance Calendar"
            description="Track upcoming deadlines and recurring compliance tasks."
          >
            <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={taskTitle}
                onChange={(event) => setTaskTitle(event.target.value)}
                placeholder="Task title"
              />
              <input
                type="date"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={taskDueDate}
                onChange={(event) => setTaskDueDate(event.target.value)}
              />
            </div>
            <Button
              className="mt-3"
              onClick={() => taskDueDate && addCalendarItem(taskTitle, taskDueDate)}
              disabled={!taskDueDate || saving}
            >
              Add Task
            </Button>

            <div className="mt-4 flex flex-col gap-2">
              {calendarTasks.length === 0 ? (
                <EmptyState
                  title="No calendar tasks yet"
                  description="Add a compliance task to start tracking deadlines."
                />
              ) : (
                calendarTasks.map((task) => (
                  <ListItem key={task.id} title={task.title} subtitle={`Due ${task.dueDate}`} />
                ))
              )}
            </div>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6">
          <SectionCard
            title="Policy Template Library"
            description="Apply pre-built HIPAA policies to your organization."
          >
            <div className="flex flex-col gap-3">
              {templates.map((template) => (
                <div key={template.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{template.title}</p>
                      <p className="text-xs text-slate-500">{template.category}</p>
                      <p className="mt-2 text-xs text-slate-600">{template.body}</p>
                    </div>
                    <Button size="xs" variant="secondary" onClick={() => applyTemplate(template.id)}>
                      Apply
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{template.version}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Documentation Repository"
            description="Upload compliance evidence and tag for quick retrieval."
          >
            <div className="flex flex-col gap-3">
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="Document title"
                value={docTitle}
                onChange={(event) => setDocTitle(event.target.value)}
              />
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="Tags (comma separated)"
                value={docTags}
                onChange={(event) => setDocTags(event.target.value)}
              />
              <input
                type="file"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                onChange={(event) => setDocFile(event.target.files?.[0] ?? null)}
              />
              <Button
                onClick={() =>
                  docFile &&
                  addDocument(
                    docFile,
                    docTitle || docFile.name,
                    docTags
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                  )
                }
                disabled={!docFile || saving}
              >
                Upload Document
              </Button>
            </div>

            <div className="mt-4">
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="Search by title or tag"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <div className="mt-3 flex flex-col gap-2">
                {filteredDocuments.length === 0 ? (
                  <EmptyState
                    title="No documents found"
                    description="Upload a policy or evidence file to populate the repository."
                  />
                ) : (
                  filteredDocuments.map((doc) => (
                    <ListItem
                      key={doc.id}
                      title={doc.title}
                      subtitle={`Tags: ${doc.tags.join(", ") || "None"}`}
                    />
                  ))
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Audit Trail" description="Key compliance actions captured.">
            <div className="flex flex-col gap-2">
              {auditLogs.length === 0 ? (
                <EmptyState
                  title="No audit events yet"
                  description="Compliance activity will appear here."
                />
              ) : (
                <>
                  {pagedAuditLogs.map((log) => (
                    <ListItem key={log.id} title={log.action} subtitle={log.entityType} />
                  ))}
                  <PaginationControls
                    page={auditPage}
                    pageCount={auditPageCount}
                    totalItems={auditLogs.length}
                    pageSize={auditPageSize}
                    onPageChange={setAuditPage}
                  />
                </>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Team Access"
            description="Invite members by email and assign roles."
          >
            <div className="flex flex-col gap-3">
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="member@clinic.com"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
              />
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={inviteRole}
                onChange={(event) => setInviteRole(event.target.value as "owner" | "member")}
              >
                <option value="member">member</option>
                <option value="owner">owner</option>
              </select>
              <Button
                onClick={() => inviteEmail && inviteMember(inviteEmail, inviteRole)}
                disabled={!inviteEmail || saving}
              >
                Send Invite
              </Button>
              {inviteStatus ? <p className="text-xs text-slate-500">{inviteStatus}</p> : null}
            </div>
          </SectionCard>
        </div>
      </section>
    </main>
  )
}
