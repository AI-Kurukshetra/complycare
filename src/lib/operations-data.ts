import type { PolicyTemplate } from "@/types/operations"

export const incidentStepTemplates = [
  "Identify and contain the breach",
  "Assess scope of impacted data",
  "Notify privacy officer and leadership",
  "Document incident timeline",
  "Prepare breach notification draft",
  "Complete corrective actions",
]

export const policyTemplates: PolicyTemplate[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    title: "Access Control Policy",
    category: "Access",
    body: "Define role-based access, quarterly reviews, and least-privilege requirements.",
    version: "v1.0",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    title: "Incident Response Policy",
    category: "Incident",
    body: "Outline breach identification, containment, notification, and documentation steps.",
    version: "v1.2",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    title: "Workforce Training Policy",
    category: "Training",
    body: "Require annual HIPAA training, tracking, and remediation for missed sessions.",
    version: "v1.1",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    title: "Vendor Risk Policy",
    category: "Vendor",
    body: "Establish BAA review cadence and vendor security assessment criteria.",
    version: "v1.0",
  },
]
