"use client"

import { useState } from "react"
import type {
  AuditChainEntry,
  BehaviorAlert,
  IoTDevice,
  PentestRun,
  TrainingSim,
} from "@/types/experimental"
import { ensureOrgMembership, ensureOrganization, logAuditEvent } from "@/services/operations"
import {
  createAuditChainEntry,
  createBehaviorAlert,
  createIoTDevice,
  createPentestRun,
  createTrainingSim,
} from "@/services/experimental"

function pseudoHash(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString(16)
}

export function useExperimental() {
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [orgName, setOrgName] = useState("Northwind Family Clinic")
  const [orgType, setOrgType] = useState("Primary Care")
  const [behaviorAlerts, setBehaviorAlerts] = useState<BehaviorAlert[]>([])
  const [pentests, setPentests] = useState<PentestRun[]>([])
  const [auditChain, setAuditChain] = useState<AuditChainEntry[]>([])
  const [trainingSims, setTrainingSims] = useState<TrainingSim[]>([])
  const [iotDevices, setIotDevices] = useState<IoTDevice[]>([])
  const [saving, setSaving] = useState(false)

  async function ensureOrg() {
    if (organizationId) return organizationId
    const id = await ensureOrganization(orgName, orgType)
    await ensureOrgMembership(id, "owner")
    setOrganizationId(id)
    return id
  }

  async function addBehaviorAlert(title: string, severity: "low" | "medium" | "high") {
    setSaving(true)
    const orgId = await ensureOrg()
    const id = await createBehaviorAlert(orgId, title, severity)
    setBehaviorAlerts((prev) => [{ id, title, severity }, ...prev])
    await logAuditEvent(orgId, "Behavior alert logged", "behavior_alert", id)
    setSaving(false)
  }

  async function addPentest(status: "scheduled" | "running" | "complete", findings: number) {
    setSaving(true)
    const orgId = await ensureOrg()
    const id = await createPentestRun(orgId, status, findings)
    setPentests((prev) => [{ id, status, findings }, ...prev])
    await logAuditEvent(orgId, "Pentest run logged", "pentest_run", id)
    setSaving(false)
  }

  async function addAuditEntry(payload: string) {
    setSaving(true)
    const orgId = await ensureOrg()
    const prevHash = auditChain[0]?.hash ?? null
    const hash = pseudoHash(`${payload}:${prevHash ?? ""}`)
    const id = await createAuditChainEntry(orgId, payload, prevHash, hash)
    setAuditChain((prev) => [{ id, payload, prevHash: prevHash ?? undefined, hash }, ...prev])
    await logAuditEvent(orgId, "Audit chain appended", "audit_chain_entry", id)
    setSaving(false)
  }

  async function addTrainingSim(title: string, mode: "gamified" | "vr") {
    setSaving(true)
    const orgId = await ensureOrg()
    const id = await createTrainingSim(orgId, title, mode)
    setTrainingSims((prev) => [{ id, title, mode, status: "draft" }, ...prev])
    await logAuditEvent(orgId, "Training sim created", "training_sim", id)
    setSaving(false)
  }

  async function addIoTDevice(name: string) {
    setSaving(true)
    const orgId = await ensureOrg()
    const id = await createIoTDevice(orgId, name)
    setIotDevices((prev) => [{ id, name, status: "monitored" }, ...prev])
    await logAuditEvent(orgId, "IoT device added", "iot_device", id)
    setSaving(false)
  }

  return {
    orgName,
    orgType,
    setOrgName,
    setOrgType,
    behaviorAlerts,
    pentests,
    auditChain,
    trainingSims,
    iotDevices,
    saving,
    addBehaviorAlert,
    addPentest,
    addAuditEntry,
    addTrainingSim,
    addIoTDevice,
  }
}
