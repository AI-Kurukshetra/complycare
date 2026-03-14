"use client"

import { useMemo, useState } from "react"
import type { AccessCategory, AccessMatrixRow } from "@/types/access-control"
import {
  calculateMinimumNecessaryScore,
  generateAccessMatrix,
  getAccessCategories,
} from "@/services/access-control"
import { ensureOrgMembership, ensureOrganization, logAuditEvent } from "@/services/operations"
import { getActiveOrgId } from "@/lib/active-org"

export function useAccessControl(orgName: string, orgType: string) {
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [rows] = useState<AccessMatrixRow[]>(() => generateAccessMatrix(orgName))
  const [flagged, setFlagged] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)

  async function ensureOrg() {
    if (organizationId) return organizationId
    const activeOrgId = getActiveOrgId()
    if (activeOrgId) {
      setOrganizationId(activeOrgId)
      return activeOrgId
    }
    const id = await ensureOrganization(orgName, orgType)
    await ensureOrgMembership(id, "owner")
    setOrganizationId(id)
    return id
  }

  const categories = useMemo(() => getAccessCategories(), [])

  const scoredRows = useMemo(() => {
    return rows.map((row) => {
      const { score, excessive, missing } = calculateMinimumNecessaryScore(
        row.access,
        row.required
      )
      return { ...row, score, excessive, missing }
    })
  }, [rows])

  function isFlagged(userId: string, category: AccessCategory) {
    return Boolean(flagged[`${userId}:${category}`])
  }

  async function toggleFlag(userId: string, category: AccessCategory) {
    setSaving(true)
    const key = `${userId}:${category}`
    setFlagged((prev) => ({ ...prev, [key]: !prev[key] }))
    const orgId = await ensureOrg()
    await logAuditEvent(orgId, "Access flagged", "access_review", undefined, {
      userId,
      category,
    })
    setSaving(false)
  }

  return {
    categories,
    rows: scoredRows,
    saving,
    isFlagged,
    toggleFlag,
  }
}
