import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import {
  buildBreachCostPrompt,
  parseBreachCostPayload,
  type BreachCostResult,
} from "@/lib/ai/breach-cost-calculator"

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-3-7-sonnet-20250219"
const ANTHROPIC_VERSION = process.env.ANTHROPIC_VERSION ?? "2023-06-01"

function buildSystemPrompt() {
  return (
    "You are a healthcare data breach cost analyst. " +
    "Using industry patterns (IBM Cost of a Data Breach report, HHS OCR enforcement data), " +
    "estimate the financial exposure of a HIPAA data breach for the given organization. " +
    "Return ONLY valid JSON with exactly these fields: " +
    "estimated_cost_range (object with min and max as integer USD values), " +
    "cost_drivers (array of 3 to 5 specific strings explaining the main cost factors), " +
    "mitigation_savings (object with current_score, target_score set to 80, " +
    "current_cost and target_cost as integer USD values showing cost if score reaches 80)."
  )
}

function buildUserPrompt(payload: unknown) {
  return `Organization context:\n${JSON.stringify(payload, null, 2)}`
}

function mockResult(): BreachCostResult {
  return {
    estimated_cost_range: { min: 125000, max: 890000 },
    cost_drivers: [
      "Low training completion rate increases human-error breach probability",
      "Open critical vulnerabilities expose ePHI to unauthorized access",
      "Unresolved incidents indicate weak detection and response capabilities",
      "PHI volume and sensitivity elevate OCR penalty exposure",
    ],
    mitigation_savings: {
      current_score: 52,
      target_score: 80,
      current_cost: 890000,
      target_cost: 310000,
    },
  }
}

async function callClaude(payload: unknown): Promise<BreachCostResult> {
  if (!ANTHROPIC_API_KEY) return mockResult()

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 600,
      temperature: 0.2,
      system: buildSystemPrompt(),
      messages: [{ role: "user", content: buildUserPrompt(payload) }],
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Claude API error: ${response.status} ${errorBody}`)
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>
  }

  const text = data.content?.find((item) => item.type === "text")?.text ?? ""
  if (!text) throw new Error("Claude API returned empty response.")
  return parseBreachCostPayload(text)
}

export async function POST() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  const { data: membership } = await supabase
    .from("org_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!membership?.organization_id) {
    return NextResponse.json({ error: "No organization membership." }, { status: 403 })
  }

  const organizationId = membership.organization_id

  const [
    { data: orgProfile },
    { data: assessment },
    { data: incidents },
    { data: vulnerabilities },
  ] = await Promise.all([
    supabase
      .from("organizations")
      .select("org_type, org_size")
      .eq("id", organizationId)
      .maybeSingle(),
    supabase
      .from("assessments")
      .select("compliance_score")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("incidents")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("status", "open"),
    supabase
      .from("vulnerabilities")
      .select("severity")
      .eq("organization_id", organizationId)
      .eq("status", "open"),
  ])

  const vulnCounts = (vulnerabilities ?? []).reduce<Record<string, number>>((acc, v) => {
    const key = v.severity ?? "unknown"
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  const dataTypes = ["PHI"]
  const orgTypeLower = (orgProfile?.org_type ?? "").toLowerCase()
  if (orgTypeLower.includes("hospital") || orgTypeLower.includes("clinic")) dataTypes.push("PII")
  if (orgTypeLower.includes("billing") || orgTypeLower.includes("dental")) {
    dataTypes.push("financial")
  }

  const context = buildBreachCostPrompt({
    orgType: orgProfile?.org_type ?? null,
    orgSize: orgProfile?.org_size ?? null,
    complianceScore: assessment?.compliance_score ?? null,
    unresolvedIncidents: (incidents ?? []).length,
    openVulnerabilities: vulnCounts,
    dataTypes,
  })

  try {
    const result = await callClaude(context)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        ...mockResult(),
        error: error instanceof Error ? error.message : "AI breach cost estimation failed.",
      },
      { status: 200 }
    )
  }
}
