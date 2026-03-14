import type { AssessmentQuestion, PolicyGap, RegulationAlert } from "@/types/compliance"

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: "access-controls",
    prompt: "How consistently are role-based access controls enforced?",
    category: "access",
    weight: 1,
    options: [
      { label: "Fully enforced with quarterly reviews", value: "strong", score: 10 },
      { label: "Mostly enforced, reviews are ad-hoc", value: "partial", score: 6 },
      { label: "Inconsistent or manual", value: "weak", score: 2 },
    ],
  },
  {
    id: "device-encryption",
    prompt: "Are endpoints storing ePHI encrypted and monitored?",
    category: "infrastructure",
    weight: 1,
    options: [
      { label: "All endpoints encrypted + monitored", value: "strong", score: 10 },
      { label: "Mixed coverage", value: "partial", score: 5 },
      { label: "No formal encryption program", value: "weak", score: 1 },
    ],
  },
  {
    id: "training",
    prompt: "How often is HIPAA training completed and tracked?",
    category: "training",
    weight: 1,
    options: [
      { label: "Annual training with completion tracking", value: "strong", score: 9 },
      { label: "Some training, limited tracking", value: "partial", score: 5 },
      { label: "No consistent program", value: "weak", score: 1 },
    ],
  },
  {
    id: "incident-response",
    prompt: "Is there a documented incident response workflow?",
    category: "incident",
    weight: 1,
    options: [
      { label: "Documented and rehearsed", value: "strong", score: 10 },
      { label: "Documented but not rehearsed", value: "partial", score: 6 },
      { label: "Ad-hoc handling", value: "weak", score: 2 },
    ],
  },
  {
    id: "risk-assessment",
    prompt: "When was the last formal HIPAA risk assessment completed?",
    category: "governance",
    weight: 1,
    options: [
      { label: "Within the last 12 months", value: "strong", score: 10 },
      { label: "12-24 months ago", value: "partial", score: 5 },
      { label: "More than 24 months ago", value: "weak", score: 1 },
    ],
  },
  {
    id: "vendor-review",
    prompt: "Are business associates reviewed for HIPAA compliance?",
    category: "vendor",
    weight: 1,
    options: [
      { label: "All vendors reviewed annually", value: "strong", score: 9 },
      { label: "Some vendors reviewed", value: "partial", score: 5 },
      { label: "No formal vendor review", value: "weak", score: 1 },
    ],
  },
  {
    id: "audit-logs",
    prompt: "How are access logs retained and reviewed?",
    category: "access",
    weight: 1,
    options: [
      { label: "Centralized logs with monthly review", value: "strong", score: 9 },
      { label: "Logs exist, review is irregular", value: "partial", score: 5 },
      { label: "Logs missing or incomplete", value: "weak", score: 1 },
    ],
  },
  {
    id: "policy-management",
    prompt: "Are HIPAA policies updated and version controlled?",
    category: "policies",
    weight: 1,
    options: [
      { label: "Updated annually with sign-offs", value: "strong", score: 9 },
      { label: "Updates are occasional", value: "partial", score: 5 },
      { label: "Policies are outdated", value: "weak", score: 1 },
    ],
  },
  {
    id: "asset-inventory",
    prompt: "Is there an inventory of systems storing ePHI?",
    category: "infrastructure",
    weight: 1,
    options: [
      { label: "Complete inventory with owners", value: "strong", score: 9 },
      { label: "Partial inventory", value: "partial", score: 5 },
      { label: "No inventory", value: "weak", score: 1 },
    ],
  },
  {
    id: "access-reviews",
    prompt: "How often are access permissions reviewed?",
    category: "access",
    weight: 1,
    options: [
      { label: "Quarterly reviews", value: "strong", score: 9 },
      { label: "Annual reviews", value: "partial", score: 6 },
      { label: "Rare or none", value: "weak", score: 1 },
    ],
  },
  {
    id: "device-disposal",
    prompt: "How are devices with ePHI decommissioned?",
    category: "infrastructure",
    weight: 1,
    options: [
      { label: "Documented wipe & disposal", value: "strong", score: 8 },
      { label: "Some wipes, inconsistent", value: "partial", score: 4 },
      { label: "No formal process", value: "weak", score: 1 },
    ],
  },
  {
    id: "access-monitoring",
    prompt: "Is abnormal access behavior monitored?",
    category: "access",
    weight: 1,
    options: [
      { label: "Automated monitoring", value: "strong", score: 8 },
      { label: "Manual spot checks", value: "partial", score: 4 },
      { label: "No monitoring", value: "weak", score: 1 },
    ],
  },
]

export const policyGaps: PolicyGap[] = [
  {
    id: "gap-access-review",
    title: "Access Review Policy",
    category: "access",
    description: "Define quarterly access reviews with sign-off requirements.",
    impact: "Reduces unauthorized access risk.",
  },
  {
    id: "gap-incident-playbook",
    title: "Incident Response Playbook",
    category: "incident",
    description: "Create a step-by-step breach response playbook.",
    impact: "Improves reporting speed and audit readiness.",
  },
  {
    id: "gap-training",
    title: "Workforce Training Policy",
    category: "training",
    description: "Schedule annual HIPAA training with completion tracking.",
    impact: "Builds compliance culture and reduces errors.",
  },
  {
    id: "gap-vendor",
    title: "Vendor Risk Management",
    category: "vendor",
    description: "Formalize BAA reviews and vendor due diligence.",
    impact: "Lowers third-party exposure.",
  },
  {
    id: "gap-inventory",
    title: "System & Device Inventory",
    category: "infrastructure",
    description: "Maintain a living inventory of systems storing ePHI.",
    impact: "Ensures coverage for all assets.",
  },
  {
    id: "gap-policy-version",
    title: "Policy Version Control",
    category: "policies",
    description: "Track policy revisions and approval dates.",
    impact: "Prevents outdated policy usage.",
  },
  {
    id: "gap-risk-assessment",
    title: "Annual Risk Assessment",
    category: "governance",
    description: "Schedule a formal HIPAA risk assessment annually.",
    impact: "Keeps compliance aligned with regulation changes.",
  },
]

export const peerComplianceScores = [38, 42, 45, 47, 51, 54, 57, 59, 60, 63, 65, 68, 70, 73, 77, 80, 82, 84]

export const regulationAlert: RegulationAlert = {
  title: "HIPAA Enforcement Bulletin Update",
  summary: "OCR highlighted increased penalties for delayed breach notifications.",
  action: "Verify your incident response timeline and 60-day notification workflow.",
  date: "March 01, 2026",
}

export const evidenceCategories = [
  "Access Controls",
  "Training",
  "Incident Response",
  "Policies",
  "Vendor Management",
  "Infrastructure",
]

export const recommendedActions = [
  "Complete a formal risk assessment within 30 days.",
  "Schedule quarterly access reviews with manager sign-off.",
  "Deploy endpoint encryption coverage to all devices handling ePHI.",
  "Run annual HIPAA training with completion tracking.",
  "Document an incident response playbook and run tabletop drills.",
]
