import type { AccessCategory, AccessUser, AccessMatrixRow } from "@/types/access-control"

const categories: AccessCategory[] = [
  "phi_records",
  "billing",
  "admin_settings",
  "reports",
]

const roleAccess: Record<string, AccessCategory[]> = {
  "Compliance Officer": ["phi_records", "billing", "reports"],
  "Billing Lead": ["billing", "reports"],
  "Clinician": ["phi_records", "reports"],
  "IT Admin": ["phi_records", "billing", "admin_settings", "reports"],
  "Front Desk": ["phi_records"],
}

const sampleUsers: AccessUser[] = [
  { id: "user-1", name: "Ava Patel", role: "Compliance Officer" },
  { id: "user-2", name: "Liam Reed", role: "Billing Lead" },
  { id: "user-3", name: "Maya Chen", role: "Clinician" },
  { id: "user-4", name: "Noah Brooks", role: "IT Admin" },
  { id: "user-5", name: "Sophia Ortiz", role: "Front Desk" },
]

function seededBool(seed: number) {
  return seed % 3 !== 0
}

export function generateAccessMatrix(orgName: string): AccessMatrixRow[] {
  const seedBase = orgName.length
  return sampleUsers.map((user, index) => {
    const seed = seedBase + index * 5
    const required = roleAccess[user.role] ?? []
    const access: Record<AccessCategory, boolean> = {
      phi_records: required.includes("phi_records") || seededBool(seed),
      billing: required.includes("billing") || seededBool(seed + 1),
      admin_settings: required.includes("admin_settings") || seededBool(seed + 2),
      reports: required.includes("reports") || seededBool(seed + 3),
    }
    return { user, access, required }
  })
}

export function calculateMinimumNecessaryScore(
  access: Record<AccessCategory, boolean>,
  required: AccessCategory[]
) {
  const requiredSet = new Set(required)
  let excessive = 0
  let missing = 0
  categories.forEach((category) => {
    const hasAccess = access[category]
    const shouldHave = requiredSet.has(category)
    if (hasAccess && !shouldHave) excessive += 1
    if (!hasAccess && shouldHave) missing += 1
  })
  const score = Math.max(0, 100 - excessive * 20 - missing * 10)
  return { score, excessive, missing }
}

export function getAccessCategories() {
  return categories
}
