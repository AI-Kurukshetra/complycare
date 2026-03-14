const policyLibrary = [
  "Access Control Policy",
  "Incident Response Policy",
  "Workforce Training Policy",
  "Vendor Risk Policy",
  "Breach Notification Policy",
  "Data Retention Policy",
  "Mobile Device Policy",
]

export function analyzePolicyGaps(complianceScore: number, trainingRate: number) {
  const missing = [...policyLibrary]
  if (complianceScore > 75) missing.splice(0, 2)
  if (trainingRate > 80) missing.splice(0, 1)
  return missing.slice(0, 4)
}

export function predictRiskScore(
  orgSize: number,
  breachHistory: number,
  trainingRate: number,
  vendorCount: number
) {
  const sizeFactor = Math.min(30, orgSize / 20)
  const breachFactor = Math.min(25, breachHistory * 8)
  const vendorFactor = Math.min(20, vendorCount * 2)
  const trainingFactor = Math.max(0, 30 - trainingRate / 3)
  const riskScore = Math.round(sizeFactor + breachFactor + vendorFactor + trainingFactor)
  const complianceScore = Math.max(0, 100 - riskScore)

  return { riskScore, complianceScore }
}

export function analyzeContract(text: string) {
  const lower = text.toLowerCase()
  const findings: string[] = []

  if (!lower.includes("breach")) findings.push("Missing breach notification clause")
  if (!lower.includes("subcontract")) findings.push("Missing subcontractor obligations")
  if (!lower.includes("audit")) findings.push("Missing audit rights")
  if (!lower.includes("termination")) findings.push("Missing termination requirements")

  return findings
}

export function estimateBreachCost(records: number, sensitivity: "low" | "medium" | "high") {
  const base = sensitivity === "high" ? 420 : sensitivity === "medium" ? 300 : 180
  const cost = Math.round(records * base)
  return cost
}
