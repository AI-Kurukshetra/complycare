"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import type { IoTDevice } from "@/types/iot"
import type { IoTDeviceForm } from "@/hooks/use-iot-devices"
import { cn } from "@/lib/utils"

const typeOptions = [
  "infusion pump",
  "imaging device",
  "tablet",
  "wearable",
  "lab analyzer",
  "other",
]

const statusStyles: Record<IoTDevice["complianceStatus"], string> = {
  compliant: "bg-emerald-100 text-emerald-700",
  at_risk: "bg-amber-100 text-amber-700",
  non_compliant: "bg-rose-100 text-rose-700",
}

function calculateRisk(device: IoTDevice) {
  let score = 20
  if (device.encryptionStatus === "unencrypted") score += 30
  if (device.encryptionStatus === "partially_encrypted") score += 15
  if (device.networkExposure === "external") score += 20
  if (device.networkExposure === "vpn") score += 10

  if (device.firmwareUpdatedAt) {
    const updated = new Date(device.firmwareUpdatedAt)
    const diffDays = Math.floor((Date.now() - updated.getTime()) / 86400000)
    if (diffDays > 365) score += 20
    else if (diffDays > 180) score += 10
  }

  if (device.handlesPhi && device.encryptionStatus === "unencrypted") {
    score += 15
  }

  return Math.min(score, 100)
}

function formatDate(value: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

export function IoTDeviceInventory({
  devices,
  loading,
  onAdd,
  saving,
}: {
  devices: IoTDevice[]
  loading: boolean
  saving: boolean
  onAdd: (form: IoTDeviceForm) => Promise<IoTDevice | null>
}) {
  const [form, setForm] = useState<IoTDeviceForm>({
    name: "",
    deviceType: "infusion pump",
    ipAddress: "",
    lastSeen: "",
    firmwareVersion: "",
    firmwareUpdatedAt: "",
    complianceStatus: "compliant",
    encryptionStatus: "encrypted",
    networkExposure: "internal",
    handlesPhi: false,
  })

  const devicesWithRisk = useMemo(() => {
    return devices.map((device) => ({
      ...device,
      riskScore: calculateRisk(device),
    }))
  }, [devices])

  async function handleSubmit() {
    if (!form.name.trim()) return
    const created = await onAdd(form)
    if (created) {
      setForm({
        name: "",
        deviceType: "infusion pump",
        ipAddress: "",
        lastSeen: "",
        firmwareVersion: "",
        firmwareUpdatedAt: "",
        complianceStatus: "compliant",
        encryptionStatus: "encrypted",
        networkExposure: "internal",
        handlesPhi: false,
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Register device</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Device name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={form.deviceType}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, deviceType: event.target.value }))
            }
          >
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="IP address"
            value={form.ipAddress}
            onChange={(event) => setForm((prev) => ({ ...prev, ipAddress: event.target.value }))}
          />
          <input
            type="date"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={form.lastSeen}
            onChange={(event) => setForm((prev) => ({ ...prev, lastSeen: event.target.value }))}
          />
          <input
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Firmware version"
            value={form.firmwareVersion}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, firmwareVersion: event.target.value }))
            }
          />
          <input
            type="date"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={form.firmwareUpdatedAt}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, firmwareUpdatedAt: event.target.value }))
            }
          />
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={form.encryptionStatus}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                encryptionStatus: event.target.value as IoTDevice["encryptionStatus"],
              }))
            }
          >
            <option value="encrypted">Encrypted</option>
            <option value="partially_encrypted">Partially encrypted</option>
            <option value="unencrypted">Unencrypted</option>
          </select>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={form.networkExposure}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                networkExposure: event.target.value as IoTDevice["networkExposure"],
              }))
            }
          >
            <option value="internal">Internal network</option>
            <option value="vpn">VPN</option>
            <option value="external">External</option>
          </select>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={form.complianceStatus}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                complianceStatus: event.target.value as IoTDevice["complianceStatus"],
              }))
            }
          >
            <option value="compliant">Compliant</option>
            <option value="at_risk">At risk</option>
            <option value="non_compliant">Non-compliant</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.handlesPhi}
              onChange={(event) => setForm((prev) => ({ ...prev, handlesPhi: event.target.checked }))}
            />
            Handles PHI
          </label>
        </div>
        <div className="mt-3 flex justify-end">
          <Button size="sm" onClick={handleSubmit} disabled={saving || !form.name.trim()}>
            {saving ? "Saving..." : "Add device"}
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading devices...</p>
      ) : devicesWithRisk.length === 0 ? (
        <EmptyState
          title="No devices registered"
          description="Add your first connected device to begin monitoring."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {devicesWithRisk.map((device) => {
            const phiWarning = device.handlesPhi && device.encryptionStatus === "unencrypted"
            return (
              <div key={device.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{device.name}</p>
                    <p className="text-xs text-slate-500">{device.deviceType}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[device.complianceStatus]}`}>
                    {device.complianceStatus.replace("_", " ")}
                  </span>
                </div>

                <div className="mt-3 grid gap-1 text-xs text-slate-500">
                  <p>IP: {device.ipAddress ?? "-"}</p>
                  <p>Last seen: {formatDate(device.lastSeen)}</p>
                  <p>Firmware: {device.firmwareVersion ?? "-"}</p>
                  <p>Firmware updated: {formatDate(device.firmwareUpdatedAt)}</p>
                  <p>Exposure: {device.networkExposure}</p>
                  <p>Encryption: {device.encryptionStatus.replace("_", " ")}</p>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                    Risk score: {device.riskScore}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1",
                      phiWarning ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                    )}
                  >
                    {phiWarning ? "PHI unencrypted" : device.handlesPhi ? "Handles PHI" : "No PHI"}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
