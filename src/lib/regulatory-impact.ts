import { createClient } from "@/utils/supabase/client"
import { LIST_LIMIT } from "@/lib/query-limits"
import type { RegulatoryUpdate } from "@/types/security"

export type ImpactedPolicy = {
  id: string
  title: string
  category: string
  status: string
}

export type RegulatoryImpact = {
  updates: RegulatoryUpdate[]
  impactedPolicies: ImpactedPolicy[]
  impactedByUpdate: Record<string, ImpactedPolicy[]>
}

function normalizeToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function matchesArea(area: string, policy: ImpactedPolicy) {
  const normalizedArea = normalizeToken(area)
  if (!normalizedArea) return false
  const category = normalizeToken(policy.category)
  const title = normalizeToken(policy.title)
  return (
    category.includes(normalizedArea) ||
    normalizedArea.includes(category) ||
    title.includes(normalizedArea)
  )
}

export async function fetchRegulatoryImpact(organizationId: string): Promise<RegulatoryImpact> {
  const supabase = createClient()
  const { data: updates, error: updatesError } = await supabase
    .from("regulatory_updates")
    .select(
      "id, title, summary, effective_date, impact_level, affected_areas, action_required, source_url, created_at"
    )
    .eq("organization_id", organizationId)
    .order("effective_date", { ascending: false })
    .limit(5)

  if (updatesError) throw updatesError

  const mappedUpdates: RegulatoryUpdate[] = (updates ?? []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    summary: (row.summary as string) ?? "",
    effectiveDate: (row.effective_date as string | null) ?? null,
    impactLevel: (row.impact_level as RegulatoryUpdate["impactLevel"]) ?? "medium",
    affectedAreas: (row.affected_areas as string[]) ?? [],
    actionRequired: (row.action_required as boolean) ?? false,
    sourceUrl: (row.source_url as string | null) ?? null,
    createdAt: row.created_at as string,
  }))

  const { data: policies, error: policiesError } = await supabase
    .from("policy_instances")
    .select("id, status, policy_templates (id, title, category)")
    .eq("organization_id", organizationId)
    .limit(LIST_LIMIT)

  if (policiesError) throw policiesError

  const impactedByUpdate: Record<string, ImpactedPolicy[]> = {}
  const impactedPoliciesMap = new Map<string, ImpactedPolicy>()

  mappedUpdates.forEach((update) => {
    const updatePolicies: ImpactedPolicy[] = []
    const areas = update.affectedAreas.length ? update.affectedAreas : []
    policies?.forEach((row) => {
      const template = (row as { policy_templates?: { title?: string; category?: string } })
        .policy_templates
      if (!template) return
      const policy: ImpactedPolicy = {
        id: row.id as string,
        title: template.title ?? "Untitled policy",
        category: template.category ?? "General",
        status: (row.status as string) ?? "draft",
      }

      const matches = areas.some((area) => matchesArea(area, policy))
      if (!matches) return

      updatePolicies.push(policy)
      impactedPoliciesMap.set(policy.id, policy)
    })

    impactedByUpdate[update.id] = updatePolicies
  })

  return {
    updates: mappedUpdates,
    impactedPolicies: Array.from(impactedPoliciesMap.values()),
    impactedByUpdate,
  }
}
