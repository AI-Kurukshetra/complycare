"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import type { TeamMember } from "@/services/team"

const roles = ["owner", "admin", "member", "auditor"] as const

type Props = {
  members: TeamMember[]
  loading: boolean
  saving: boolean
  error: string | null
  onInvite: (email: string, role: string) => void
  onChangeRole: (userId: string, role: string) => void
  onRemove: (userId: string) => void
}

export function TeamManagement({
  members,
  loading,
  saving,
  error,
  onInvite,
  onChangeRole,
  onRemove,
}: Props) {
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<string>("member")

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Invite member</p>
        <div className="mt-3 grid gap-3 md:grid-cols-[1.5fr_1fr_auto]">
          <input
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Email address"
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
          />
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={inviteRole}
            onChange={(event) => setInviteRole(event.target.value)}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <Button
            onClick={() => {
              if (!inviteEmail.trim()) return
              onInvite(inviteEmail.trim(), inviteRole)
              setInviteEmail("")
            }}
            disabled={saving}
          >
            {saving ? "Sending..." : "Invite"}
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Team members</p>
          {loading ? <p className="text-xs text-slate-500">Loading...</p> : null}
        </div>

        {members.length === 0 ? (
          <EmptyState
            title="No members yet"
            description="Invite teammates to start collaborating."
          />
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {members.map((member) => (
              <div key={member.id} className="rounded-2xl border border-slate-100 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {member.email ?? "Pending invite"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Status: {member.status === "invited" ? "Invite pending" : "Active"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                      value={member.role}
                      onChange={(event) => onChangeRole(member.id, event.target.value)}
                      disabled={member.status === "invited" || saving}
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => onRemove(member.id)}
                      disabled={member.status === "invited" || saving}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
