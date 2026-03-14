import { createClient } from "@/utils/supabase/client"
import { LIST_LIMIT } from "@/lib/query-limits"

export type RegulatoryImpactLevel = "low" | "medium" | "high" | "critical"

export type RegulatoryFeedItem = {
  title: string
  summary: string
  effectiveDate: string
  impactLevel: RegulatoryImpactLevel
  affectedAreas: string[]
  actionRequired: boolean
  sourceUrl: string
}

const mockFeed: RegulatoryFeedItem[] = [
  {
    title: "OCR issues updated guidance on breach notification timelines",
    summary:
      "Clarifies the 60-day window and emphasizes timely patient communications after discovery of a breach.",
    effectiveDate: "2026-03-01",
    impactLevel: "high",
    affectedAreas: ["incident_response", "communications"],
    actionRequired: true,
    sourceUrl: "https://www.hhs.gov/hipaa/index.html",
  },
  {
    title: "HIPAA Security Rule technical safeguard refresh",
    summary:
      "New expectations for MFA and encryption readiness for cloud-hosted ePHI systems.",
    effectiveDate: "2026-02-15",
    impactLevel: "critical",
    affectedAreas: ["access_control", "cloud_security"],
    actionRequired: true,
    sourceUrl: "https://www.hhs.gov/hipaa/index.html",
  },
  {
    title: "Updated training frequency recommendations",
    summary:
      "Recommends annual HIPAA refresher training with scenario-based modules.",
    effectiveDate: "2026-01-20",
    impactLevel: "medium",
    affectedAreas: ["training"],
    actionRequired: false,
    sourceUrl: "https://www.hhs.gov/hipaa/index.html",
  },
]

export async function fetchRegulatoryFeed(): Promise<RegulatoryFeedItem[]> {
  return mockFeed
}

export async function fetchRegulatoryUpdates(organizationId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("regulatory_updates")
    .select(
      "id, title, summary, effective_date, impact_level, affected_areas, action_required, source_url, created_at"
    )
    .eq("organization_id", organizationId)
    .order("effective_date", { ascending: false })
    .limit(LIST_LIMIT)

  if (error) throw error
  return data ?? []
}

async function createNotificationsForUpdate(
  organizationId: string,
  title: string,
  impactLevel: RegulatoryImpactLevel
) {
  const supabase = createClient()
  const { data: members, error } = await supabase
    .from("org_members")
    .select("user_id")
    .eq("organization_id", organizationId)
    .limit(LIST_LIMIT)

  if (error) throw error

  if (!members?.length) return

  const message =
    impactLevel === "critical"
      ? `Critical regulatory update: ${title}`
      : `High impact regulatory update: ${title}`

  const rows = members.map((member) => ({
    organization_id: organizationId,
    user_id: member.user_id,
    message,
    link: "/security",
  }))

  const { error: insertError } = await supabase.from("notifications").insert(rows)
  if (insertError) throw insertError
}

export async function syncRegulatoryUpdates(organizationId: string) {
  const supabase = createClient()
  const feed = await fetchRegulatoryFeed()

  const { data: existing, error: existingError } = await supabase
    .from("regulatory_updates")
    .select("title, effective_date")
    .eq("organization_id", organizationId)
    .limit(LIST_LIMIT)

  if (existingError) throw existingError

  const existingKeys = new Set(
    (existing ?? []).map((row) => `${row.title}::${row.effective_date ?? ""}`)
  )

  const toInsert = feed.filter(
    (item) => !existingKeys.has(`${item.title}::${item.effectiveDate}`)
  )

  if (!toInsert.length) return []

  const { data: inserted, error } = await supabase
    .from("regulatory_updates")
    .insert(
      toInsert.map((item) => ({
        organization_id: organizationId,
        title: item.title,
        summary: item.summary,
        effective_date: item.effectiveDate,
        impact_level: item.impactLevel,
        affected_areas: item.affectedAreas,
        action_required: item.actionRequired,
        source_url: item.sourceUrl,
      }))
    )
    .select("id, title, impact_level")

  if (error) throw error

  const highImpact = (inserted ?? []).filter(
    (row) => row.impact_level === "high" || row.impact_level === "critical"
  )

  for (const row of highImpact) {
    await createNotificationsForUpdate(
      organizationId,
      row.title as string,
      row.impact_level as RegulatoryImpactLevel
    )
  }

  return inserted ?? []
}
