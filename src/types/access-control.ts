export type AccessCategory = "phi_records" | "billing" | "admin_settings" | "reports"

export type AccessUser = {
  id: string
  name: string
  role: string
}

export type AccessMatrixRow = {
  user: AccessUser
  access: Record<AccessCategory, boolean>
  required: AccessCategory[]
}

export type AccessFlag = {
  userId: string
  category: AccessCategory
  flagged: boolean
}
