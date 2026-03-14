"use client"

import { useMemo, useState } from "react"
import type { ComplianceCheck, RegulatoryUpdate, Vulnerability } from "@/types/security"
import { ensureOrgMembership, ensureOrganization, logAuditEvent } from "@/services/operations"
import {
  createComplianceCheck,
  createVulnerability,
  updateComplianceCheckStatus,
} from "@/services/security"
import { fetchRegulatoryUpdates, syncRegulatoryUpdates } from "@/services/regulatory"
import { getActiveOrgId } from "@/lib/active-org"

export function useSecurity() {
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [orgName, setOrgName] = useState("Northwind Family Clinic")
  const [orgType, setOrgType] = useState("Primary Care")
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([])
  const [checks, setChecks] = useState<ComplianceCheck[]>([])
  const [updates, setUpdates] = useState<RegulatoryUpdate[]>([])
  const [saving, setSaving] = useState(false)
  const [regulatoryLoading, setRegulatoryLoading] = useState(false)

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

  async function addVulnerability(
    title: string,
    severity: "low" | "medium" | "high",
    asset?: string
  ) {
    setSaving(true)
    const orgId = await ensureOrg()
    const created = await createVulnerability(orgId, title, severity, asset)
    setVulnerabilities((prev) => [
      {
        id: created.id,
        title,
        severity,
        status: "open",
        asset,
        createdAt: created.created_at,
      },
      ...prev,
    ])
    await logAuditEvent(orgId, "Vulnerability logged", "vulnerability", created.id)
    setSaving(false)
  }

  function addScanResults(results: Vulnerability[]) {
    setVulnerabilities((prev) => [...results, ...prev])
  }

  async function addCheck(title: string) {
    setSaving(true)
    const orgId = await ensureOrg()
    const id = await createComplianceCheck(orgId, title)
    setChecks((prev) => [
      {
        id,
        title,
        status: "drift",
      },
      ...prev,
    ])
    await logAuditEvent(orgId, "Compliance check added", "compliance_check", id)
    setSaving(false)
  }

  async function updateCheckStatus(checkId: string, status: ComplianceCheck["status"]) {
    setSaving(true)
    const orgId = await ensureOrg()
    await updateComplianceCheckStatus(checkId, status)
    setChecks((prev) =>
      prev.map((check) =>
        check.id === checkId ? { ...check, status, lastCheckedAt: new Date().toISOString() } : check
      )
    )
    await logAuditEvent(orgId, "Compliance check updated", "compliance_check", checkId)
    setSaving(false)
  }

  async function refreshRegulatoryUpdates() {
    setRegulatoryLoading(true)
    try {
      const orgId = await ensureOrg()
      await syncRegulatoryUpdates(orgId)
      const rows = await fetchRegulatoryUpdates(orgId)
      setUpdates(
        rows.map((row) => ({
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
      )
    } finally {
      setRegulatoryLoading(false)
    }
  }

  const summary = useMemo(() => {
    const openVulns = vulnerabilities.filter((item) => item.status !== "resolved").length
    const driftChecks = checks.filter((item) => item.status === "drift").length
    return { openVulns, driftChecks }
  }, [checks, vulnerabilities])

  return {
    orgName,
    orgType,
    setOrgName,
    setOrgType,
    vulnerabilities,
    checks,
    updates,
    saving,
    summary,
    regulatoryLoading,
    addVulnerability,
    addScanResults,
    addCheck,
    updateCheckStatus,
    refreshRegulatoryUpdates,
  }
}
