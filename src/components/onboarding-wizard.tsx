"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type OnboardingWizardProps = {
  organizationId: string
  orgName?: string | null
  orgType?: string | null
  orgSize?: string | null
  primaryContact?: string | null
}

export function OnboardingWizard({
  organizationId,
  orgName,
  orgType,
  orgSize,
  primaryContact,
}: OnboardingWizardProps) {
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteStatus, setInviteStatus] = useState<string | null>(null)
  const [inviting, setInviting] = useState(false)

  async function handleInvite() {
    if (!inviteEmail) {
      setInviteStatus("Enter an email address.")
      return
    }
    setInviting(true)
    setInviteStatus(null)
    try {
      const response = await fetch("/api/members/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          email: inviteEmail,
          role: "member",
        }),
      })
      const payload = await response.json()
      if (!response.ok) {
        setInviteStatus(payload?.error ?? "Unable to send invite.")
        return
      }
      setInviteStatus("Member added. They can sign in now.")
      setInviteEmail("")
    } catch (error) {
      setInviteStatus(error instanceof Error ? error.message : "Unable to send invite.")
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Onboarding
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Welcome to ComplyCare</h2>
        <p className="mt-2 text-sm text-slate-600">
          Complete these steps to activate your compliance workspace.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Step 1
              </p>
              <h3 className="text-lg font-semibold text-slate-900">Organization profile</h3>
              <p className="mt-2 text-sm text-slate-600">
                {orgName ?? "Organization"} · {orgType ?? "Type"} ·{" "}
                {orgSize ?? "Size"}
              </p>
              {primaryContact ? (
                <p className="mt-1 text-xs text-slate-500">Primary contact: {primaryContact}</p>
              ) : null}
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Done
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Step 2
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                Run the initial risk assessment
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Generate your first compliance score in under five minutes.
              </p>
            </div>
            <Button asChild>
              <Link href="/">Start assessment</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Step 3
              </p>
              <h3 className="text-lg font-semibold text-slate-900">Invite your team</h3>
              <p className="mt-2 text-sm text-slate-600">
                Add team members who already created their accounts.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <label className="flex flex-1 flex-col gap-2 text-sm font-medium text-slate-700">
                Team member email
                <input
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                />
              </label>
              <Button onClick={handleInvite} disabled={inviting}>
                {inviting ? "Inviting..." : "Add member"}
              </Button>
            </div>
            {inviteStatus ? <p className="text-xs text-slate-500">{inviteStatus}</p> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
