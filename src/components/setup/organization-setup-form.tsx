"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { createOrganization } from "@/services/operations"
import { createClient } from "@/utils/supabase/client"
import { OnboardingWizard } from "@/components/onboarding-wizard"

const orgTypes = ["Clinic", "Hospital", "Dental", "Startup"]
const orgSizes = ["1-10", "11-50", "51-200", "200+"]

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      message?: unknown
      details?: unknown
      hint?: unknown
      code?: unknown
    }
    const parts = [
      typeof maybeError.message === "string" ? maybeError.message : null,
      typeof maybeError.details === "string" ? maybeError.details : null,
      typeof maybeError.hint === "string" ? maybeError.hint : null,
      typeof maybeError.code === "string" ? `code: ${maybeError.code}` : null,
    ].filter(Boolean)

    if (parts.length > 0) return parts.join(" | ")
  }

  return "Unable to create organization."
}

export function OrganizationSetupForm() {
  const [orgId, setOrgId] = useState<string | null>(null)
  const [orgName, setOrgName] = useState("")
  const [orgType, setOrgType] = useState<string>(orgTypes[0])
  const [orgSize, setOrgSize] = useState<string>(orgSizes[0])
  const [primaryContact, setPrimaryContact] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let active = true
    async function loadExistingOrg() {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      if (!userId) {
        if (active) setChecking(false)
        return
      }

      const { data: membership } = await supabase
        .from("org_members")
        .select("organization_id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle()

      if (!active) return
      if (!membership?.organization_id) {
        setChecking(false)
        return
      }

      const { data: org } = await supabase
        .from("organizations")
        .select("id, name, org_type, org_size, primary_contact")
        .eq("id", membership.organization_id)
        .limit(1)
        .single()

      if (!active) return
      if (org) {
        setOrgId(org.id)
        setOrgName(org.name)
        setOrgType(org.org_type ?? orgTypes[0])
        setOrgSize(org.org_size ?? orgSizes[0])
        setPrimaryContact(org.primary_contact ?? "")
      }
      setChecking(false)
    }

    loadExistingOrg()
    return () => {
      active = false
    }
  }, [])

  async function handleCreate() {
    if (!orgName.trim()) {
      setMessage("Organization name is required.")
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const id = await createOrganization({
        name: orgName.trim(),
        orgType,
        orgSize,
        primaryContact: primaryContact.trim() || null,
      })
      setOrgId(id)
      setMessage("Organization created.")
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Checking organization setup...
      </div>
    )
  }

  if (orgId) {
    return (
      <OnboardingWizard
        organizationId={orgId}
        orgName={orgName}
        orgType={orgType}
        orgSize={orgSize}
        primaryContact={primaryContact}
      />
    )
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Create your organization</h2>
      <p className="mt-2 text-sm text-slate-600">
        Set up the organization profile to personalize your compliance plan.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Organization name
          <input
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={orgName}
            onChange={(event) => setOrgName(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Organization type
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={orgType}
            onChange={(event) => setOrgType(event.target.value)}
          >
            {orgTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Organization size
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={orgSize}
            onChange={(event) => setOrgSize(event.target.value)}
          >
            {orgSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Primary contact
          <input
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={primaryContact}
            onChange={(event) => setPrimaryContact(event.target.value)}
            placeholder="Name or email"
          />
        </label>
        <Button onClick={handleCreate} disabled={loading}>
          {loading ? "Creating..." : "Create organization"}
        </Button>
        {message ? <p className="text-xs text-slate-500">{message}</p> : null}
      </div>
    </div>
  )
}
