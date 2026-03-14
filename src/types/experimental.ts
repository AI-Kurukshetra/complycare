export type BehaviorAlert = {
  id: string
  title: string
  severity: "low" | "medium" | "high"
}

export type PentestRun = {
  id: string
  status: "scheduled" | "running" | "complete"
  findings: number
}

export type AuditChainEntry = {
  id: string
  payload: string
  prevHash?: string
  hash: string
}

export type TrainingSim = {
  id: string
  title: string
  mode: "gamified" | "vr"
  status: "draft" | "active"
}

export type IoTDevice = {
  id: string
  name: string
  status: "monitored" | "flagged"
}
