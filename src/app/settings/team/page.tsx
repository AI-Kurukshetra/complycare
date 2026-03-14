"use client"

import { useState } from "react"
import { AuthPanel } from "@/components/auth-panel"
import { AuthRequiredBanner } from "@/components/auth-required-banner"
import { DashboardHeader } from "@/components/dashboard-header"
import { OrgSettingsCard } from "@/components/org-settings-card"
import { TeamManagement } from "@/components/settings/team-management"
import { useTeam } from "@/hooks/use-team"

export default function TeamPage() {
  const {
    orgName,
    orgType,
    setOrgName,
    setOrgType,
    members,
    loading,
    saving,
    error,
    inviteMember,
    changeRole,
    removeMember,
  } = useTeam()
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <DashboardHeader
        eyebrow="Phase 9 Settings"
        title="Team Management"
        description="Invite team members and manage roles."
        navLinks={[{ label: "Security", href: "/security" }]}
      >
        <OrgSettingsCard
          orgName={orgName}
          orgType={orgType}
          onOrgNameChange={setOrgName}
          onOrgTypeChange={setOrgType}
        />
      </DashboardHeader>

      <AuthPanel onAuth={setCurrentUser} />
      {!currentUser && <AuthRequiredBanner />}

      <section className={currentUser ? "" : "pointer-events-none opacity-60"}>
        <TeamManagement
          members={members}
          loading={loading}
          saving={saving}
          error={error}
          onInvite={inviteMember}
          onChangeRole={changeRole}
          onRemove={removeMember}
        />
      </section>
    </main>
  )
}
