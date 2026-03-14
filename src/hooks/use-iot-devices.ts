"use client"

import { useCallback, useState } from "react"
import type { IoTDevice, IoTDeviceStatus, IoTEncryptionStatus, IoTNetworkExposure } from "@/types/iot"
import { createIoTDevice, fetchIoTDevices } from "@/services/iot-devices"
import { ensureOrgMembership, ensureOrganization, logAuditEvent } from "@/services/operations"
import { getActiveOrgId } from "@/lib/active-org"

export type IoTDeviceForm = {
  name: string
  deviceType: string
  ipAddress: string
  lastSeen: string
  firmwareVersion: string
  firmwareUpdatedAt: string
  complianceStatus: IoTDeviceStatus
  encryptionStatus: IoTEncryptionStatus
  networkExposure: IoTNetworkExposure
  handlesPhi: boolean
}

export function useIoTDevices() {
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [orgName, setOrgName] = useState("Northwind Family Clinic")
  const [orgType, setOrgType] = useState("Primary Care")
  const [devices, setDevices] = useState<IoTDevice[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ensureOrg = useCallback(async () => {
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
  }, [organizationId, orgName, orgType])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const orgId = await ensureOrg()
      const data = await fetchIoTDevices(orgId)
      setDevices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load devices.")
    } finally {
      setLoading(false)
    }
  }, [ensureOrg])

  const addDevice = useCallback(
    async (form: IoTDeviceForm) => {
      setSaving(true)
      setError(null)
      try {
        const orgId = await ensureOrg()
        const device = await createIoTDevice(orgId, {
          name: form.name,
          deviceType: form.deviceType,
          ipAddress: form.ipAddress || null,
          lastSeen: form.lastSeen || null,
          firmwareVersion: form.firmwareVersion || null,
          firmwareUpdatedAt: form.firmwareUpdatedAt || null,
          complianceStatus: form.complianceStatus,
          encryptionStatus: form.encryptionStatus,
          networkExposure: form.networkExposure,
          handlesPhi: form.handlesPhi,
        })
        setDevices((prev) => [device, ...prev])
        await logAuditEvent(orgId, "IoT device registered", "iot_device", device.id)
        return device
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to add device.")
        return null
      } finally {
        setSaving(false)
      }
    },
    [ensureOrg]
  )

  return {
    orgName,
    orgType,
    setOrgName,
    setOrgType,
    devices,
    loading,
    saving,
    error,
    load,
    addDevice,
  }
}
