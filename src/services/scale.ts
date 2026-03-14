import { createClient } from "@/utils/supabase/client"

export async function createLocation(
  organizationId: string,
  name: string,
  address?: string
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("locations")
    .insert({ organization_id: organizationId, name, address, status: "active" })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}

export async function createIntegrationKey(
  organizationId: string,
  label: string,
  token: string
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("integration_keys")
    .insert({ organization_id: organizationId, label, token })
    .select("id, created_at")
    .single()

  if (error) throw error
  return data
}

export async function sendSecureMessage(
  organizationId: string,
  recipient: string,
  subject: string,
  encryptedPayload: string
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("secure_messages")
    .insert({ organization_id: organizationId, recipient, subject, encrypted_payload: encryptedPayload })
    .select("id, created_at")
    .single()

  if (error) throw error
  return data
}
