export type OcrPenalty = {
  id: string
  organization: string
  violationType: string
  penaltyAmount: string
  settlementDate: string
  description: string
}

const penalties: OcrPenalty[] = [
  {
    id: "ocr-1",
    organization: "Riverdale Family Clinic",
    violationType: "Access control failures",
    penaltyAmount: "$425,000",
    settlementDate: "2024-11-18",
    description:
      "Failure to implement unique user IDs and access reviews for ePHI systems.",
  },
  {
    id: "ocr-2",
    organization: "Sunset Imaging Group",
    violationType: "Delayed breach notification",
    penaltyAmount: "$1,200,000",
    settlementDate: "2025-02-04",
    description:
      "Late notification to affected individuals and OCR after ransomware incident.",
  },
  {
    id: "ocr-3",
    organization: "Green Valley Health",
    violationType: "Insufficient risk analysis",
    penaltyAmount: "$350,000",
    settlementDate: "2024-08-29",
    description:
      "Incomplete enterprise-wide risk analysis and mitigation planning.",
  },
  {
    id: "ocr-4",
    organization: "Summit Behavioral Health",
    violationType: "Unencrypted device loss",
    penaltyAmount: "$750,000",
    settlementDate: "2025-05-13",
    description:
      "Lost laptop with ePHI lacked encryption and mobile device controls.",
  },
]

export function fetchOcrPenalties() {
  return penalties
}

export function summarizeTopViolations() {
  const counts = new Map<string, number>()
  penalties.forEach((item) => {
    counts.set(item.violationType, (counts.get(item.violationType) ?? 0) + 1)
  })
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([violation]) => violation)
}
