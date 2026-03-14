"use client"

import { useEffect, useState } from "react"
import { AuthPanel } from "@/components/auth-panel"
import { AuthRequiredBanner } from "@/components/auth-required-banner"
import { DashboardHeader } from "@/components/dashboard-header"
import { OrgSettingsCard } from "@/components/org-settings-card"
import { IoTDeviceInventory } from "@/components/security/iot-device-inventory"
import { useIoTDevices } from "@/hooks/use-iot-devices"

export default function IoTDevicePage() {
  const {
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
  } = useIoTDevices()
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  useEffect(() => {
    if (currentUser) {
      void load()
    }
  }, [currentUser, load])

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <DashboardHeader
        eyebrow="Phase 7 Security"
        title="IoT Device Inventory"
        description="Track medical IoT assets, exposure, and compliance risk."
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

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <section className={currentUser ? "" : "pointer-events-none opacity-60"}>
        <IoTDeviceInventory
          devices={devices}
          loading={loading}
          saving={saving}
          onAdd={addDevice}
        />
      </section>
    </main>
  )
}
