export type IoTDeviceStatus = "compliant" | "at_risk" | "non_compliant"
export type IoTEncryptionStatus = "encrypted" | "partially_encrypted" | "unencrypted"
export type IoTNetworkExposure = "internal" | "external" | "vpn"

export type IoTDevice = {
  id: string
  name: string
  deviceType: string
  ipAddress: string | null
  lastSeen: string | null
  firmwareVersion: string | null
  firmwareUpdatedAt: string | null
  complianceStatus: IoTDeviceStatus
  encryptionStatus: IoTEncryptionStatus
  networkExposure: IoTNetworkExposure
  handlesPhi: boolean
  createdAt: string
}
