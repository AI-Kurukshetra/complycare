"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { fetchRegulatoryImpact } from "@/lib/regulatory-impact"
import { logAuditEvent } from "@/services/operations"
import type { ImpactedPolicy } from "@/lib/regulatory-impact"
import type { RegulatoryUpdate } from "@/types/security"

export function PolicyImpactAlert({ active }: { active: boolean }) {
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [updates, setUpdates] = useState<RegulatoryUpdate[]>([])
  const [impactMap, setImpactMap] = useState<Record<string, ImpactedPolicy[]>>({})
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [reviewed, setReviewed] = useState(false)

  useEffect(() => {
    if (!active) return
    const supabase = createClient()
    let mounted = true

    async function load() {
      setLoading(true)
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        setLoading(false)
        return
      }

      const { data: membership } = await supabase
        .from("org_members")
        .select("organization_id")
        .eq("user_id", userData.user.id)
        .limit(1)
        .maybeSingle()

      if (!membership?.organization_id || !mounted) {
        setLoading(false)
        return
      }

      setOrganizationId(membership.organization_id)
      const impact = await fetchRegulatoryImpact(membership.organization_id)
      if (!mounted) return
      setUpdates(impact.updates)
      setImpactMap(impact.impactedByUpdate)
      setLoading(false)
    }

    void load()

    return () => {
      mounted = false
    }
  }, [active])

  const impactedPolicies = useMemo(() => {
    const policies: ImpactedPolicy[] = []
    Object.values(impactMap).forEach((items) => {
      items.forEach((policy) => {
        if (!policies.find((existing) => existing.id === policy.id)) {
          policies.push(policy)
        }
      })
    })
    return policies
  }, [impactMap])

  const actionableUpdates = updates.filter(
    (update) => update.actionRequired && (impactMap[update.id]?.length ?? 0) > 0
  )

  const totalImpacted = impactedPolicies.length

  async function markReviewed() {
    if (!organizationId || actionableUpdates.length === 0) return
    await logAuditEvent(organizationId, "Regulatory impact reviewed", "regulatory_update", undefined, {
      updateIds: actionableUpdates.map((update) => update.id),
      policyIds: impactedPolicies.map((policy) => policy.id),
    })
    setReviewed(true)
  }

  if (!active || dismissed || totalImpacted === 0) return null

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-amber-900">
            New regulation affects {totalImpacted} of your policies — review required.
          </p>
          <p className="mt-1 text-xs text-amber-700">
            {actionableUpdates.length} high-priority update{actionableUpdates.length === 1 ? "" : "s"} flagged.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? "Hide details" : "Review details"}
          </Button>
          <Button size="sm" onClick={markReviewed} disabled={reviewed || loading}>
            {reviewed ? "Reviewed" : "Mark as reviewed"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>
            Dismiss
          </Button>
        </div>
      </div>

      {expanded ? (
        <div className="mt-4 grid gap-4">
          {actionableUpdates.map((update) => (
            <div key={update.id} className="rounded-2xl border border-amber-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{update.title}</p>
                  <p className="text-xs text-slate-500">Effective {update.effectiveDate ?? "TBD"}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                  {update.impactLevel}
                </span>
              </div>
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Change summary
                </p>
                <p className="mt-2 text-sm text-slate-700">{update.summary}</p>
              </div>
              <div className="mt-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Impacted policies
                </p>
                <div className="mt-2 grid gap-2">
                  {(impactMap[update.id] ?? []).map((policy) => (
                    <div
                      key={`${update.id}-${policy.id}`}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                    >
                      <p className="font-semibold text-slate-700">{policy.title}</p>
                      <p className="text-[11px] text-slate-500">
                        Category: {policy.category} · Status: {policy.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
