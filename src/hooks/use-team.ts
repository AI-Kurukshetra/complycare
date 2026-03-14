"use client"

import { useCallback, useEffect, useState } from "react"
import { ensureOrgMembership, ensureOrganization, logAuditEvent } from "@/services/operations"
import { fetchTeamMembers, removeMember, updateMemberRole, type TeamMember } from "@/services/team"

export function useTeam() {
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [orgName, setOrgName] = useState("Northwind Family Clinic")
  const [orgType, setOrgType] = useState("Primary Care")
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ensureOrg = useCallback(async () => {
    if (organizationId) return organizationId
    const id = await ensureOrganization(orgName, orgType)
    await ensureOrgMembership(id, "owner")
    setOrganizationId(id)
    return id
  }, [organizationId, orgName, orgType])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const orgId = await ensureOrg()
      const data = await fetchTeamMembers(orgId)
      setMembers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load team.")
    } finally {
      setLoading(false)
    }
  }, [ensureOrg])

  useEffect(() => {
    void load()
  }, [load])

  const inviteMember = useCallback(
    async (email: string, role: string) => {
      setSaving(true)
      setError(null)
      try {
        const orgId = await ensureOrg()
        const response = await fetch("/api/members/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ organizationId: orgId, email, role }),
        })

        if (!response.ok) {
          const payload = await response.json()
          throw new Error(payload?.error ?? "Invite failed.")
        }

        await logAuditEvent(orgId, "Member invited", "org_member")
        setMembers((prev) => [
          { id: `invite-${Date.now()}`, email, role, status: "invited" },
          ...prev,
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invite failed.")
      } finally {
        setSaving(false)
      }
    },
    [ensureOrg]
  )

  const changeRole = useCallback(
    async (userId: string, role: string) => {
      setSaving(true)
      setError(null)
      try {
        const orgId = await ensureOrg()
        await updateMemberRole(orgId, userId, role)
        await logAuditEvent(orgId, "Member role updated", "org_member", userId, { role })
        setMembers((prev) =>
          prev.map((member) =>
            member.id === userId ? { ...member, role } : member
          )
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to update role.")
      } finally {
        setSaving(false)
      }
    },
    [ensureOrg]
  )

  const remove = useCallback(
    async (userId: string) => {
      setSaving(true)
      setError(null)
      try {
        const orgId = await ensureOrg()
        await removeMember(orgId, userId)
        await logAuditEvent(orgId, "Member removed", "org_member", userId)
        setMembers((prev) => prev.filter((member) => member.id !== userId))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to remove member.")
      } finally {
        setSaving(false)
      }
    },
    [ensureOrg]
  )

  return {
    orgName,
    orgType,
    setOrgName,
    setOrgType,
    members,
    loading,
    saving,
    error,
    load,
    inviteMember,
    changeRole,
    removeMember: remove,
  }
}
