import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import {
  buildPolicyGapPrompt,
  parsePolicyGapPayload,
  type PolicyGap,
} from "@/lib/ai/policy-gap-analysis"

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-3-7-sonnet-20250219"
const ANTHROPIC_VERSION = process.env.ANTHROPIC_VERSION ?? "2023-06-01"

function buildSystemPrompt() {
  return (
    "You are a HIPAA compliance analyst. " +
    "Given an organization's current policy instances (name + last_reviewed), " +
    "compare against a comprehensive HIPAA policy checklist. " +
    "Return ONLY valid JSON array with: policy_name, hipaa_section, gap_type " +
    "(missing|outdated|incomplete), severity (critical|high|medium), recommendation."
  )
}

function buildUserPrompt(payload: unknown) {
  return `Context JSON:\n${JSON.stringify(payload, null, 2)}`
}

function mockGaps(): PolicyGap[] {
  return [
    {
      policy_name: "Workforce Training Policy",
      hipaa_section: "45 CFR 164.530(b)",
      gap_type: "outdated",
      severity: "high",
      recommendation: "Update training cadence to annual + event-based refreshers.",
    },
    {
      policy_name: "Access Control Policy",
      hipaa_section: "45 CFR 164.308(a)(4)",
      gap_type: "incomplete",
      severity: "medium",
      recommendation: "Define quarterly access review and MFA requirements.",
    },
    {
      policy_name: "Incident Response Policy",
      hipaa_section: "45 CFR 164.308(a)(6)",
      gap_type: "missing",
      severity: "critical",
      recommendation: "Create a formal breach response and notification workflow.",
    },
  ]
}

async function callClaude(payload: unknown) {
  if (!ANTHROPIC_API_KEY) {
    return mockGaps()
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 700,
      temperature: 0.2,
      system: buildSystemPrompt(),
      messages: [
        {
          role: "user",
          content: buildUserPrompt(payload),
        },
      ],
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

  return parsePolicyGapPayload(text)
}

export async function POST() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  const { data: membership } = await supabase
    .from("org_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!membership?.organization_id) {
    return NextResponse.json({ error: "No organization membership." }, { status: 403 })
  }

  const organizationId = membership.organization_id

  const { data: policies } = await supabase
    .from("policy_instances")
    .select("id, status, last_reviewed, policy_templates (title, category)")
    .eq("organization_id", organizationId)

  const policyList = (policies ?? []).map((row) => {
    const template = (row as { policy_templates?: { title?: string; category?: string } })
      .policy_templates
    return {
      name: template?.title ?? "Untitled policy",
      category: template?.category ?? "General",
      status: (row.status as string) ?? null,
      last_reviewed: (row.last_reviewed as string | null) ?? null,
    }
  })

  const payload = buildPolicyGapPrompt({
    policies: policyList.map((policy) => ({
      name: `${policy.name} (${policy.category})`,
      last_reviewed: policy.last_reviewed,
      status: policy.status,
    })),
  })

  try {
    const gaps = await callClaude(payload)
    return NextResponse.json({ gaps })
  } catch (error) {
    return NextResponse.json(
      {
        gaps: mockGaps(),
        error: error instanceof Error ? error.message : "AI policy gap analysis failed.",
      },
      { status: 200 }
    )
  }
}
