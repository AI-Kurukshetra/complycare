import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { IoTDeviceInventory } from "@/components/security/iot-device-inventory"
import type { IoTDevice } from "@/types/iot"

const baseDevice: IoTDevice = {
  id: "device-1",
  name: "Infusion Pump A",
  deviceType: "infusion pump",
  ipAddress: "10.0.1.10",
  lastSeen: "2026-03-01",
  firmwareVersion: "1.2.0",
  firmwareUpdatedAt: "2025-12-01",
  complianceStatus: "at_risk",
  encryptionStatus: "unencrypted",
  networkExposure: "internal",
  handlesPhi: true,
  createdAt: new Date().toISOString(),
}

describe("IoTDeviceInventory", () => {
  it("renders devices and risk badge", () => {
    render(
      <IoTDeviceInventory
        devices={[baseDevice]}
        loading={false}
        saving={false}
        onAdd={vi.fn()}
      />
    )

    expect(screen.getByText(/Infusion Pump A/i)).toBeInTheDocument()
    expect(screen.getByText(/PHI unencrypted/i)).toBeInTheDocument()
  })

  it("submits device registration form", async () => {
    const onAdd = vi.fn().mockResolvedValue(baseDevice)

    render(
      <IoTDeviceInventory
        devices={[]}
        loading={false}
        saving={false}
        onAdd={onAdd}
      />
    )

    fireEvent.change(screen.getByPlaceholderText(/Device name/i), {
      target: { value: "XRay Scanner" },
    })

    fireEvent.click(screen.getByRole("button", { name: /Add device/i }))

    expect(onAdd).toHaveBeenCalled()
  })
})
