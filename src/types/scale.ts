export type Location = {
  id: string
  name: string
  address?: string
  status: "active" | "paused"
}

export type IntegrationKey = {
  id: string
  label: string
  token: string
  createdAt: string
}

export type SecureMessage = {
  id: string
  recipient: string
  subject: string
  encryptedPayload: string
  createdAt: string
}
