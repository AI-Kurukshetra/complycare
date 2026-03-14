import { createClient } from "@/utils/supabase/client"

export async function createBehaviorAlert(
  organizationId: string,
  title: string,
  severity: string
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("behavior_alerts")
    .insert({ organization_id: organizationId, title, severity })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}

export async function createPentestRun(
  organizationId: string,
  status: string,
  findings: number
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("pentest_runs")
    .insert({ organization_id: organizationId, status, findings })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}

export async function createAuditChainEntry(
  organizationId: string,
  payload: string,
  prevHash: string | null,
  hash: string
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("audit_chain_entries")
    .insert({ organization_id: organizationId, payload, prev_hash: prevHash, hash })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}

export async function createTrainingSim(
  organizationId: string,
  title: string,
  mode: string
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("training_sims")
    .insert({ organization_id: organizationId, title, mode, status: "draft" })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}

export async function createIoTDevice(organizationId: string, name: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("iot_devices")
    .insert({ organization_id: organizationId, name, status: "monitored" })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}
