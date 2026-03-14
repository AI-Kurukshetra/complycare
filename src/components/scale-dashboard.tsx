"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AuthPanel } from "@/components/auth-panel"
import { EmptyState } from "@/components/ui/empty-state"
import { SectionCard } from "@/components/ui/section-card"
import { ListItem } from "@/components/ui/list-item"
import { DashboardHeader } from "@/components/dashboard-header"
import { OrgSettingsCard } from "@/components/org-settings-card"
import { AuthRequiredBanner } from "@/components/auth-required-banner"
import { useScale } from "@/hooks/use-scale"

const navLinks = [
  { label: "AI Insights", href: "/insights" },
  { label: "Security", href: "/security" },
  { label: "Experimental Lab", href: "/lab" },
  { label: "Portfolio", href: "/portfolio" },
]

export function ScaleDashboard() {
  const {
    orgName,
    orgType,
    setOrgName,
    setOrgType,
    locations,
    keys,
    messages,
    addLocation,
    generateKey,
    sendMessage,
  } = useScale()

  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [locationName, setLocationName] = useState("Downtown Clinic")
  const [locationAddress, setLocationAddress] = useState("123 Main St, Springfield")
  const [keyLabel, setKeyLabel] = useState("EHR Integration")
  const [recipient, setRecipient] = useState("compliance@clinic.com")
  const [subject, setSubject] = useState("Policy update request")
  const [body, setBody] = useState("Please review the updated incident response checklist.")

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <DashboardHeader
        eyebrow="Phase 6 Scale"
        title="Scale & Expansion"
        description="Manage multi-location rollouts, integration keys, and secure communications."
        navLinks={navLinks}
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

      <section
        className={`grid gap-6 md:grid-cols-[1.1fr_0.9fr] ${
          currentUser ? "" : "pointer-events-none opacity-60"
        }`}
      >
        <div className="flex flex-col gap-6">
          <SectionCard
            title="Multi-location Management"
            description="Track facilities and rollout status."
          >
            <div className="flex flex-col gap-3">
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={locationName}
                onChange={(event) => setLocationName(event.target.value)}
              />
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={locationAddress}
                onChange={(event) => setLocationAddress(event.target.value)}
              />
              <Button onClick={() => addLocation(locationName, locationAddress)}>
                Add Location
              </Button>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {locations.length === 0 ? (
                <EmptyState
                  title="No locations yet"
                  description="Add a facility to start tracking rollouts."
                />
              ) : (
                locations.map((location) => (
                  <ListItem key={location.id} title={location.name} subtitle={location.address} />
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Integration APIs"
            description="Generate keys for EHR or security tools."
          >
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={keyLabel}
                onChange={(event) => setKeyLabel(event.target.value)}
              />
              <Button onClick={() => generateKey(keyLabel)}>Generate Key</Button>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {keys.length === 0 ? (
                <EmptyState
                  title="No keys generated"
                  description="Generate an integration key to connect tools."
                />
              ) : (
                keys.map((key) => (
                  <ListItem key={key.id} title={key.label} subtitle={key.token} />
                ))
              )}
            </div>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6">
          <SectionCard
            title="Encrypted Communication"
            description="Send secure, encrypted messages."
          >
            <div className="flex flex-col gap-3">
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
              />
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              />
              <textarea
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                rows={4}
                value={body}
                onChange={(event) => setBody(event.target.value)}
              />
              <Button onClick={() => sendMessage(recipient, subject, body)}>
                Send Secure Message
              </Button>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {messages.length === 0 ? (
                <EmptyState
                  title="No messages sent"
                  description="Send a secure message to see the audit trail."
                />
              ) : (
                messages.map((message) => (
                  <ListItem key={message.id} title={message.subject} subtitle={`To: ${message.recipient}`}>
                    <p className="text-xs text-slate-400">Encrypted payload stored.</p>
                  </ListItem>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title="Mobile Readiness" description="Track mobile rollout checklist.">
            <ul className="list-disc pl-5 text-sm text-slate-600">
              <li>Responsive layouts validated on small screens.</li>
              <li>Quick actions for incidents, checks, and alerts.</li>
              <li>PWA install prompt planned for Phase 6.2.</li>
            </ul>
          </SectionCard>
        </div>
      </section>
    </main>
  )
}
