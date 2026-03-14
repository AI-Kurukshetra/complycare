import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import {
  buildRiskPredictionPrompt,
  parseRiskPredictionPayload,
  sortRisks,
  type PredictedRisk,
} from "@/lib/ai/risk-prediction"

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-3-7-sonnet-20250219"
const ANTHROPIC_VERSION = process.env.ANTHROPIC_VERSION ?? "2023-06-01"

function buildSystemPrompt() {
  return (
    "You are a compliance risk analyst. " +
    "Given structured organization context, predict the top 3 compliance risks for the next 90 days. " +
    "Return ONLY valid JSON array. Each element must include: " +
    "risk_title, probability (low|medium|high), potential_impact, recommended_actions (array)."
  )
}

function buildUserPrompt(payload: unknown) {
  return `Context JSON:\n${JSON.stringify(payload, null, 2)}`
}

function mockPrediction(): PredictedRisk[] {
  return [
    {
      risk_title: "Incomplete workforce HIPAA refresher training",
      probability: "high",
      potential_impact: "Increased likelihood of privacy incidents and audit findings.",
      recommended_actions: [
        "Assign overdue training modules to all staff",
        "Track completion rates weekly",
        "Escalate non-compliance to managers",
      ],
    },
    {
      risk_title: "Delayed incident response documentation",
      probability: "medium",
      potential_impact: "Regulatory penalties for late breach reporting.",
      recommended_actions: [
        "Update incident response runbook",
        "Conduct tabletop breach exercise",
        "Document response timelines",
      ],
    },
    {
      risk_title: "Open critical vulnerabilities in clinical systems",
      probability: "medium",
      potential_impact: "Exposure of ePHI and service downtime.",
      recommended_actions: [
        "Patch high-risk assets within 7 days",
        "Increase scanning cadence",
        "Add compensating controls",
      ],
    },
  ]
}

async function callClaude(payload: unknown) {
  if (!ANTHROPIC_API_KEY) {
    return mockPrediction()
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

  const risks = parseRiskPredictionPayload(text)
  return sortRisks(risks)
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

  const { data: assessment } = await supabase
    .from("assessments")
    .select("compliance_score, risk_score, risk_level, answers, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: incidents } = await supabase
    .from("incidents")
    .select("title, severity, status, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: vulnerabilities } = await supabase
    .from("vulnerabilities")
    .select("severity, status")
    .eq("organization_id", organizationId)
    .eq("status", "open")

  const { data: orgProfile } = await supabase
    .from("organizations")
    .select("org_type, org_size")
    .eq("id", organizationId)
    .maybeSingle()

  const { data: members } = await supabase
    .from("org_members")
    .select("user_id")
    .eq("organization_id", organizationId)

  const memberIds = (members ?? []).map((member) => member.user_id)

  const { data: requiredModules } = await supabase
    .from("training_sims")
    .select("id, passing_score, is_required")
    .eq("organization_id", organizationId)
    .eq("is_required", true)

  const { data: completions } = memberIds.length
    ? await supabase
        .from("training_completions")
        .select("user_id, module_id, score, completed_at")
        .in("user_id", memberIds)
    : { data: [] }

  const requiredModuleIds = new Set((requiredModules ?? []).map((module) => module.id))
  const modulePassingScores = new Map(
    (requiredModules ?? []).map((module) => [module.id, module.passing_score ?? 0])
  )

  const totalAssignments = requiredModuleIds.size * memberIds.length
  const completedAssignments = (completions ?? []).filter((completion) => {
    if (!requiredModuleIds.has(completion.module_id)) return false
    if (!completion.completed_at) return false
    const passingScore = modulePassingScores.get(completion.module_id) ?? 0
    return (completion.score ?? 0) >= passingScore
  }).length

  const trainingCompletionRate = totalAssignments
    ? Math.round((completedAssignments / totalAssignments) * 100)
    : null

  const vulnerabilityCounts = (vulnerabilities ?? []).reduce<Record<string, number>>(
    (acc, vuln) => {
      const key = vuln.severity ?? "unknown"
      acc[key] = (acc[key] ?? 0) + 1
      acc.total = (acc.total ?? 0) + 1
      return acc
    },
    { total: 0 }
  )

  const context = buildRiskPredictionPrompt({
    orgType: orgProfile?.org_type ?? null,
    orgSize: orgProfile?.org_size ?? null,
    currentComplianceScore: assessment?.compliance_score ?? null,
    currentRiskScore: assessment?.risk_score ?? null,
    riskLevel: assessment?.risk_level ?? null,
    assessmentAnswers: (assessment?.answers as Record<string, unknown>) ?? null,
    incidents:
      incidents?.map((incident) => ({
        title: incident.title,
        severity: incident.severity,
        status: incident.status,
        createdAt: incident.created_at,
      })) ?? [],
    vulnerabilityCounts,
    trainingCompletionRate,
  })

  try {
    const risks = await callClaude(context)
    return NextResponse.json({ risks })
  } catch (error) {
    return NextResponse.json(
      {
        risks: mockPrediction(),
        error: error instanceof Error ? error.message : "AI risk prediction failed.",
      },
      { status: 200 }
    )
  }
}
