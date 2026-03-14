import { describe, expect, it, vi } from "vitest"
import { fetchRegulatoryImpact } from "@/lib/regulatory-impact"

const updates = [
  {
    id: "u1",
    title: "Update access controls",
    summary: "MFA required",
    effective_date: "2025-02-01",
    impact_level: "high",
    affected_areas: ["access control"],
    action_required: true,
    source_url: null,
    created_at: "2025-01-10",
  },
  {
    id: "u2",
    title: "Training refresh",
    summary: "Annual refresh",
    effective_date: "2025-03-01",
    impact_level: "medium",
    affected_areas: ["training"],
    action_required: false,
    source_url: null,
    created_at: "2025-01-20",
  },
]

const policies = [
  {
    id: "p1",
    status: "active",
    policy_templates: { id: "t1", title: "Access Control Policy", category: "Access Control" },
  },
  {
    id: "p2",
    status: "draft",
    policy_templates: { id: "t2", title: "Data Retention", category: "Retention" },
  },
]

vi.mock("@/utils/supabase/client", () => {
  const buildQuery = (table: string) => {
    const data = table === "regulatory_updates" ? updates : policies
    const query = {
      select: () => query,
      eq: () => query,
      order: () => query,
      limit: () => Promise.resolve({ data, error: null }),
    }
    return query
  }

  return {
    createClient: () => ({
      from: (table: string) => buildQuery(table),
    }),
  }
})

describe("regulatory-impact", () => {
  it("maps updates to impacted policies", async () => {
    const result = await fetchRegulatoryImpact("org-1")

    expect(result.updates).toHaveLength(2)
    expect(result.impactedPolicies).toHaveLength(1)
    expect(result.impactedByUpdate["u1"]).toHaveLength(1)
    expect(result.impactedByUpdate["u1"][0].title).toContain("Access Control")
    expect(result.impactedByUpdate["u2"]).toHaveLength(0)
  })
})
