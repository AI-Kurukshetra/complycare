import { createClient } from "@/utils/supabase/client"
import { LIST_LIMIT } from "@/lib/query-limits"

export type PortfolioRow = {
  organizationId: string
  orgName: string
  complianceScore: number | null
  riskLevel: string | null
  openRisks: number
  overdueTraining: number
  activeIncidents: number
  lastAssessmentDate: string | null
}

export async function fetchPortfolioRows(userId: string): Promise<PortfolioRow[]> {
  const supabase = createClient()
  const { data: memberships } = await supabase
    .from("org_members")
    .select("organization_id")
    .eq("user_id", userId)
    .limit(LIST_LIMIT)

  const orgIds = (memberships ?? []).map((row) => row.organization_id)
  if (orgIds.length === 0) return []

  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name")
    .in("id", orgIds)
    .limit(LIST_LIMIT)

  const rows = await Promise.all(
    (orgs ?? []).map(async (org) => {
      const { data: assessment } = await supabase
        .from("assessments")
        .select("compliance_score, risk_level, created_at")
        .eq("organization_id", org.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      const { data: risks } = await supabase
        .from("risks")
        .select("id, status")
        .eq("organization_id", org.id)
        .limit(LIST_LIMIT)

      const { data: incidents } = await supabase
        .from("incidents")
        .select("id, status")
        .eq("organization_id", org.id)
        .limit(LIST_LIMIT)

      const todayIso = new Date().toISOString().slice(0, 10)
      const { data: training } = await supabase
        .from("training_sims")
        .select("id, due_date, is_required")
        .eq("organization_id", org.id)
        .eq("is_required", true)
        .lt("due_date", todayIso)
        .limit(LIST_LIMIT)

      const openRisks = (risks ?? []).filter((risk) => risk.status !== "closed").length
      const activeIncidents = (incidents ?? []).filter((incident) => incident.status !== "resolved").length
      const overdueTraining = training?.length ?? 0

      return {
        organizationId: org.id,
        orgName: org.name,
        complianceScore: assessment?.compliance_score ?? null,
        riskLevel: assessment?.risk_level ?? null,
        openRisks,
        overdueTraining,
        activeIncidents,
        lastAssessmentDate: assessment?.created_at ?? null,
      }
    })
  )

  return rows
}
