import { createClient } from "@/utils/supabase/client"

export async function createVulnerability(
  organizationId: string,
  title: string,
  severity: string,
  asset?: string
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("vulnerabilities")
    .insert({ organization_id: organizationId, title, severity, status: "open", asset })
    .select("id, created_at")
    .single()

  if (error) throw error
  return data
}

export async function createComplianceCheck(organizationId: string, title: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("compliance_checks")
    .insert({ organization_id: organizationId, title, status: "drift" })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}

export async function updateComplianceCheckStatus(
  checkId: string,
  status: string
) {
  const supabase = createClient()
  const { error } = await supabase
    .from("compliance_checks")
    .update({ status, last_checked_at: new Date().toISOString() })
    .eq("id", checkId)

  if (error) throw error
}

export async function createRegulatoryUpdate(
  organizationId: string,
  title: string,
  impact?: string,
  source?: string
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("regulatory_updates")
    .insert({ organization_id: organizationId, title, impact, source })
    .select("id, created_at")
    .single()

  if (error) throw error
  return data
}
