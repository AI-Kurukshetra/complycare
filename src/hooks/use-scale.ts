"use client"

import { useState } from "react"
import type { IntegrationKey, Location, SecureMessage } from "@/types/scale"
import { ensureOrgMembership, ensureOrganization, logAuditEvent } from "@/services/operations"
import { createIntegrationKey, createLocation, sendSecureMessage } from "@/services/scale"

function generateToken() {
  return `ck_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
}

function encryptMessage(text: string) {
  return btoa(unescape(encodeURIComponent(text)))
}

export function useScale() {
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [orgName, setOrgName] = useState("Northwind Family Clinic")
  const [orgType, setOrgType] = useState("Primary Care")
  const [locations, setLocations] = useState<Location[]>([])
  const [keys, setKeys] = useState<IntegrationKey[]>([])
  const [messages, setMessages] = useState<SecureMessage[]>([])
  const [saving, setSaving] = useState(false)

  async function ensureOrg() {
    if (organizationId) return organizationId
    const id = await ensureOrganization(orgName, orgType)
    await ensureOrgMembership(id, "owner")
    setOrganizationId(id)
    return id
  }

  async function addLocation(name: string, address?: string) {
    setSaving(true)
    const orgId = await ensureOrg()
    const id = await createLocation(orgId, name, address)
    setLocations((prev) => [{ id, name, address, status: "active" }, ...prev])
    await logAuditEvent(orgId, "Location added", "location", id)
    setSaving(false)
  }

  async function generateKey(label: string) {
    setSaving(true)
    const orgId = await ensureOrg()
    const token = generateToken()
    const data = await createIntegrationKey(orgId, label, token)
    setKeys((prev) => [
      { id: data.id, label, token, createdAt: data.created_at },
      ...prev,
    ])
    await logAuditEvent(orgId, "Integration key created", "integration_key", data.id)
    setSaving(false)
  }

  async function sendMessage(recipient: string, subject: string, body: string) {
    setSaving(true)
    const orgId = await ensureOrg()
    const encryptedPayload = encryptMessage(body)
    const data = await sendSecureMessage(orgId, recipient, subject, encryptedPayload)
    setMessages((prev) => [
      {
        id: data.id,
        recipient,
        subject,
        encryptedPayload,
        createdAt: data.created_at,
      },
      ...prev,
    ])
    await logAuditEvent(orgId, "Secure message sent", "secure_message", data.id)
    setSaving(false)
  }

  return {
    orgName,
    orgType,
    setOrgName,
    setOrgType,
    locations,
    keys,
    messages,
    saving,
    addLocation,
    generateKey,
    sendMessage,
  }
}
