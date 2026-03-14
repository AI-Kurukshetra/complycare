import { createClient } from "@/utils/supabase/client"
import { LIST_LIMIT } from "@/lib/query-limits"

export type TeamMember = {
  id: string
  email: string | null
  role: string
  status: "active" | "invited"
}

export async function fetchTeamMembers(organizationId: string): Promise<TeamMember[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("org_members")
    .select("user_id, role")
    .eq("organization_id", organizationId)
    .limit(LIST_LIMIT)

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.user_id as string,
    email: null,
    role: row.role as string,
    status: "active",
  }))
}

export async function updateMemberRole(organizationId: string, userId: string, role: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("org_members")
    .update({ role })
    .eq("organization_id", organizationId)
    .eq("user_id", userId)

  if (error) throw error
}

export async function removeMember(organizationId: string, userId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("org_members")
    .delete()
    .eq("organization_id", organizationId)
    .eq("user_id", userId)

  if (error) throw error
}
