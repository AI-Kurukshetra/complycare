import { createClient } from "@/utils/supabase/client"
import type { Json } from "@/types/supabase"

type OrganizationProfileInput = {
  name: string
  orgType?: string | null
  orgSize?: string | null
  primaryContact?: string | null
}

type PostgrestErrorLike = {
  code?: string
  message?: string
}

function isOrgMembersRlsWriteError(error: unknown) {
  const err = error as PostgrestErrorLike | null
  if (!err || typeof err !== "object") return false
  if (err.code !== "42501") return false
  return typeof err.message === "string" && err.message.includes("org_members")
}

async function bootstrapOrganizationViaApi(input: {
  organizationId?: string
  name: string
  orgType?: string | null
  orgSize?: string | null
  primaryContact?: string | null
}) {
  const response = await fetch("/api/organizations/bootstrap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(payload?.error ?? "Unable to bootstrap organization.")
  }
  if (!payload?.organizationId || typeof payload.organizationId !== "string") {
    throw new Error("Organization bootstrap did not return an ID.")
  }
  return payload.organizationId as string
}

export async function ensureOrganization(name: string, orgType: string | null) {
  const supabase = createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const userId = userData.user?.id
  if (!userId) throw new Error("No authenticated user")

  const { data: membership, error: membershipError } = await supabase
    .from("org_members")
    .select("organization_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle()

  if (membershipError) throw membershipError
  if (membership?.organization_id) {
    return membership.organization_id
  }

  const organizationId = crypto.randomUUID()
  const { error } = await supabase
    .from("organizations")
    .insert({
      id: organizationId,
      name,
      org_type: orgType,
      created_by: userId,
    })

  if (error) throw error

  const { error: membershipInsertError } = await supabase.from("org_members").upsert(
    {
      organization_id: organizationId,
      user_id: userId,
      role: "owner",
    },
    {
      onConflict: "organization_id,user_id",
      ignoreDuplicates: true,
    }
  )

  if (membershipInsertError) {
    if (isOrgMembersRlsWriteError(membershipInsertError)) {
      return bootstrapOrganizationViaApi({
        organizationId,
        name,
        orgType,
      })
    }
    throw membershipInsertError
  }
  return organizationId
}

export async function createOrganization(profile: OrganizationProfileInput) {
  const supabase = createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const userId = userData.user?.id
  if (!userId) throw new Error("No authenticated user")

  const organizationId = crypto.randomUUID()
  const { error } = await supabase
    .from("organizations")
    .insert({
      id: organizationId,
      name: profile.name,
      org_type: profile.orgType ?? null,
      org_size: profile.orgSize ?? null,
      primary_contact: profile.primaryContact ?? null,
      created_by: userId,
    })

  if (error) throw error

  const { error: membershipError } = await supabase.from("org_members").upsert(
    {
      organization_id: organizationId,
      user_id: userId,
      role: "owner",
    },
    {
      onConflict: "organization_id,user_id",
      ignoreDuplicates: true,
    }
  )

  if (membershipError) {
    if (isOrgMembersRlsWriteError(membershipError)) {
      return bootstrapOrganizationViaApi({
        organizationId,
        name: profile.name,
        orgType: profile.orgType ?? null,
        orgSize: profile.orgSize ?? null,
        primaryContact: profile.primaryContact ?? null,
      })
    }
    throw membershipError
  }
  return organizationId
}

export async function ensureOrgMembership(organizationId: string, role: "owner" | "member") {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()
  const userId = data.user?.id
  if (!userId) throw new Error("No authenticated user")

  const { data: existingMembership, error: membershipLookupError } = await supabase
    .from("org_members")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle()

  if (membershipLookupError) throw membershipLookupError
  if (existingMembership) return

  const { error: insertError } = await supabase.from("org_members").insert({
    organization_id: organizationId,
    user_id: userId,
    role,
  })

  if (insertError) {
    if (isOrgMembersRlsWriteError(insertError)) {
      await bootstrapOrganizationViaApi({
        organizationId,
        name: "Organization",
      })
      return
    }
    throw insertError
  }
}

export async function createIncident(
  organizationId: string,
  title: string,
  severity: string
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("incidents")
    .insert({ organization_id: organizationId, title, severity, status: "open" })
    .select("id, created_at")
    .single()

  if (error) throw error
  return data
}

export async function addIncidentSteps(incidentId: string, steps: string[]) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("incident_steps")
    .insert(
      steps.map((title) => ({
        incident_id: incidentId,
        title,
        status: "pending",
      }))
    )
    .select("id, title, status, completed_at")

  if (error) throw error
  return data ?? []
}

export async function completeIncidentStep(stepId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("incident_steps")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("id", stepId)

  if (error) throw error
}

export async function createCalendarTask(
  organizationId: string,
  title: string,
  dueDate: string
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("calendar_tasks")
    .insert({ organization_id: organizationId, title, due_date: dueDate })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}

export async function createPolicyInstance(organizationId: string, templateId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("policy_instances")
    .insert({ organization_id: organizationId, template_id: templateId, status: "active" })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}


export async function uploadDocument(
  organizationId: string,
  file: File,
  title: string,
  tags: string[]
) {
  const supabase = createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const userId = userData.user?.id
  if (!userId) throw new Error("No authenticated user")

  const path = `${organizationId}/${Date.now()}-${file.name}`
  const { error: storageError } = await supabase.storage
    .from("compliance-documents")
    .upload(path, file, { upsert: false, contentType: file.type })

  if (storageError) throw storageError

  const { data, error } = await supabase
    .from("documents")
    .insert({
      organization_id: organizationId,
      title,
      tags,
      storage_path: path,
      file_name: file.name,
      file_path: path,
      file_size: file.size,
      mime_type: file.type,
      category: "other",
      version: 1,
      uploaded_by: userId,
    })
    .select("id")
    .single()

  if (error) throw error
  return { id: data.id as string, path }
}

export async function logAuditEvent(
  organizationId: string,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  const supabase = createClient()
  const { error } = await supabase.from("audit_logs").insert({
    organization_id: organizationId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    actor: "demo-user",
    metadata: (metadata ?? null) as Json,
  })

  if (error) throw error
}
