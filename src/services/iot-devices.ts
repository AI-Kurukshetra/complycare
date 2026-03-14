import { createClient } from "@/utils/supabase/client"
import { LIST_LIMIT } from "@/lib/query-limits"
import type { Database } from "@/types/supabase"
import type { IoTDevice } from "@/types/iot"

export type CreateIoTDeviceInput = Omit<IoTDevice, "id" | "createdAt">

type IoTDeviceRow = Pick<
  Database["public"]["Tables"]["iot_devices"]["Row"],
  | "id"
  | "name"
  | "device_type"
  | "ip_address"
  | "last_seen"
  | "firmware_version"
  | "firmware_updated_at"
  | "compliance_status"
  | "encryption_status"
  | "network_exposure"
  | "handles_phi"
  | "created_at"
>

function mapRow(row: IoTDeviceRow): IoTDevice {
  return {
    id: row.id,
    name: row.name,
    deviceType: row.device_type ?? "unknown",
    ipAddress: row.ip_address ?? null,
    lastSeen: row.last_seen ?? null,
    firmwareVersion: row.firmware_version ?? null,
    firmwareUpdatedAt: row.firmware_updated_at ?? null,
    complianceStatus: (row.compliance_status as IoTDevice["complianceStatus"]) ?? "compliant",
    encryptionStatus: (row.encryption_status as IoTDevice["encryptionStatus"]) ?? "encrypted",
    networkExposure: (row.network_exposure as IoTDevice["networkExposure"]) ?? "internal",
    handlesPhi: Boolean(row.handles_phi),
    createdAt: row.created_at,
  }
}

export async function fetchIoTDevices(organizationId: string): Promise<IoTDevice[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("iot_devices")
    .select(
      "id, name, device_type, ip_address, last_seen, firmware_version, firmware_updated_at, compliance_status, encryption_status, network_exposure, handles_phi, created_at"
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(LIST_LIMIT)

  if (error) throw error
  return (data ?? []).map(mapRow)
}

export async function createIoTDevice(
  organizationId: string,
  payload: CreateIoTDeviceInput
): Promise<IoTDevice> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("iot_devices")
    .insert({
      organization_id: organizationId,
      name: payload.name,
      device_type: payload.deviceType,
      ip_address: payload.ipAddress,
      last_seen: payload.lastSeen,
      firmware_version: payload.firmwareVersion,
      firmware_updated_at: payload.firmwareUpdatedAt,
      compliance_status: payload.complianceStatus,
      encryption_status: payload.encryptionStatus,
      network_exposure: payload.networkExposure,
      handles_phi: payload.handlesPhi,
    })
    .select(
      "id, name, device_type, ip_address, last_seen, firmware_version, firmware_updated_at, compliance_status, encryption_status, network_exposure, handles_phi, created_at"
    )
    .single()

  if (error) throw error
  return mapRow(data)
}
