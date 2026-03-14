"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { clearActiveOrgId, getActiveOrgId, setActiveOrgId } from "@/lib/active-org"
import { LIST_LIMIT } from "@/lib/query-limits"

export type OrgSummary = {
  id: string
  name: string
  complianceScore: number | null
}

export function useActiveOrg() {
  const [organizations, setOrganizations] = useState<OrgSummary[]>([])
  const [activeOrgId, setActiveOrgIdState] = useState<string | null>(() => getActiveOrgId())
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setOrganizations([])
      setActiveOrgIdState(null)
      clearActiveOrgId()
      setLoading(false)
      return
    }

    const { data: memberships } = await supabase
      .from("org_members")
      .select("organization_id")
      .eq("user_id", userData.user.id)
      .limit(LIST_LIMIT)

    const orgIds = (memberships ?? [])
      .map((row) => row.organization_id)
      .filter((id): id is string => Boolean(id))
    if (orgIds.length === 0) {
      setOrganizations([])
      setActiveOrgIdState(null)
      clearActiveOrgId()
      setLoading(false)
      return
    }

    const { data: orgs } = await supabase
      .from("organizations")
      .select("id, name")
      .in("id", orgIds)
      .limit(LIST_LIMIT)

    const { data: assessments } = await supabase
      .from("assessments")
      .select("organization_id, compliance_score, created_at")
      .in("organization_id", orgIds)
      .order("created_at", { ascending: false })
      .limit(LIST_LIMIT)

    const latestScore = new Map<string, number>()
    ;(assessments ?? []).forEach((row) => {
      if (row.organization_id && !latestScore.has(row.organization_id)) {
        latestScore.set(row.organization_id, row.compliance_score)
      }
    })

    const summaries = (orgs ?? []).map((org) => ({
      id: org.id,
      name: org.name,
      complianceScore: latestScore.get(org.id) ?? null,
    }))

    setOrganizations(summaries)

    const stored = getActiveOrgId()
    const valid = stored && summaries.find((org) => org.id === stored)
    const nextActive = valid ? stored : summaries[0]?.id ?? null

    if (nextActive) {
      setActiveOrgId(nextActive)
      setActiveOrgIdState(nextActive)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    async function run() { await refresh() }
    void run()
  }, [refresh])

  const setActive = useCallback((orgId: string) => {
    setActiveOrgId(orgId)
    setActiveOrgIdState(orgId)
  }, [])

  const activeOrg = organizations.find((org) => org.id === activeOrgId) ?? null

  return {
    organizations,
    activeOrg,
    activeOrgId,
    loading,
    refresh,
    setActiveOrgId: setActive,
  }
}
