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
import { useExperimental } from "@/hooks/use-experimental"

const navLinks = [
  { label: "Scale", href: "/scale" },
  { label: "AI Insights", href: "/insights" },
]

export function ExperimentalDashboard() {
  const {
    orgName,
    orgType,
    setOrgName,
    setOrgType,
    behaviorAlerts,
    pentests,
    auditChain,
    trainingSims,
    iotDevices,
    addBehaviorAlert,
    addPentest,
    addAuditEntry,
    addTrainingSim,
    addIoTDevice,
  } = useExperimental()

  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [alertTitle, setAlertTitle] = useState("Unusual access pattern detected")
  const [alertSeverity, setAlertSeverity] = useState<"low" | "medium" | "high">("high")
  const [pentestStatus, setPentestStatus] = useState<"scheduled" | "running" | "complete">(
    "scheduled"
  )
  const [pentestFindings, setPentestFindings] = useState(3)
  const [chainPayload, setChainPayload] = useState("Policy review signed by compliance lead")
  const [trainingTitle, setTrainingTitle] = useState("VR breach response drill")
  const [trainingMode, setTrainingMode] = useState<"gamified" | "vr">("vr")
  const [deviceName, setDeviceName] = useState("Infusion Pump A-17")

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <DashboardHeader
        eyebrow="Phase 7 Experimental"
        title="Experimental Lab"
        description="Prototype advanced security, audit, and training concepts."
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
          <SectionCard title="Behavioral Analytics" description="Flag insider threat signals.">
            <div className="flex flex-col gap-3">
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={alertTitle}
                onChange={(event) => setAlertTitle(event.target.value)}
              />
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={alertSeverity}
                onChange={(event) =>
                  setAlertSeverity(event.target.value as "low" | "medium" | "high")
                }
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
              <Button onClick={() => addBehaviorAlert(alertTitle, alertSeverity)}>Log Alert</Button>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {behaviorAlerts.length === 0 ? (
                <EmptyState
                  title="No behavior alerts yet"
                  description="Log the first alert to start monitoring anomalies."
                />
              ) : (
                behaviorAlerts.map((alert) => (
                  <ListItem
                    key={alert.id}
                    title={alert.title}
                    subtitle={`Severity: ${alert.severity}`}
                  />
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Automated Penetration Testing"
            description="Track scheduled and running tests."
          >
            <div className="flex flex-col gap-3">
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={pentestStatus}
                onChange={(event) =>
                  setPentestStatus(event.target.value as "scheduled" | "running" | "complete")
                }
              >
                <option value="scheduled">scheduled</option>
                <option value="running">running</option>
                <option value="complete">complete</option>
              </select>
              <input
                type="number"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={pentestFindings}
                onChange={(event) => setPentestFindings(Number(event.target.value))}
              />
              <Button onClick={() => addPentest(pentestStatus, pentestFindings)}>Log Pentest</Button>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {pentests.length === 0 ? (
                <EmptyState
                  title="No pentests logged"
                  description="Track scheduled and running tests here."
                />
              ) : (
                pentests.map((run) => (
                  <ListItem
                    key={run.id}
                    title={`Status: ${run.status}`}
                    subtitle={`Findings: ${run.findings}`}
                  />
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Blockchain Audit Trail"
            description="Append immutable compliance events."
          >
            <div className="flex flex-col gap-3">
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={chainPayload}
                onChange={(event) => setChainPayload(event.target.value)}
              />
              <Button onClick={() => addAuditEntry(chainPayload)}>Append Entry</Button>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {auditChain.length === 0 ? (
                <EmptyState
                  title="No audit entries yet"
                  description="Append an entry to start the chain."
                />
              ) : (
                auditChain.map((entry) => (
                  <ListItem key={entry.id} title={entry.payload} subtitle={`Hash: ${entry.hash}`} />
                ))
              )}
            </div>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6">
          <SectionCard
            title="VR / Gamified Training"
            description="Prototype immersive learning modules."
          >
            <div className="flex flex-col gap-3">
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={trainingTitle}
                onChange={(event) => setTrainingTitle(event.target.value)}
              />
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={trainingMode}
                onChange={(event) => setTrainingMode(event.target.value as "gamified" | "vr")}
              >
                <option value="gamified">gamified</option>
                <option value="vr">vr</option>
              </select>
              <Button onClick={() => addTrainingSim(trainingTitle, trainingMode)}>
                Create Module
              </Button>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {trainingSims.length === 0 ? (
                <EmptyState
                  title="No training sims yet"
                  description="Prototype a training module to see it listed here."
                />
              ) : (
                trainingSims.map((sim) => (
                  <ListItem key={sim.id} title={sim.title} subtitle={`Mode: ${sim.mode}`} />
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title="IoT Device Security" description="Track and monitor medical IoT assets.">
            <div className="flex flex-col gap-3">
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={deviceName}
                onChange={(event) => setDeviceName(event.target.value)}
              />
              <Button onClick={() => addIoTDevice(deviceName)}>Add Device</Button>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {iotDevices.length === 0 ? (
                <EmptyState
                  title="No IoT devices yet"
                  description="Register a device to begin monitoring."
                />
              ) : (
                iotDevices.map((device) => (
                  <ListItem key={device.id} title={device.name} subtitle={`Status: ${device.status}`} />
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </section>
    </main>
  )
}
