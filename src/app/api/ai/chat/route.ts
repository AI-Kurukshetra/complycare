import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import type { ChatMessage } from "@/hooks/useAIChat"

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-3-7-sonnet-20250219"
const ANTHROPIC_VERSION = process.env.ANTHROPIC_VERSION ?? "2023-06-01"

type OrgContext = {
  orgName: string
  orgType: string
  orgSize: string
  complianceScore: number | null
  riskLevel: string
  openIncidents: string[]
  openRisks: string[]
}

function buildSystemPrompt(ctx: OrgContext) {
  const incidentList =
    ctx.openIncidents.length > 0
      ? ctx.openIncidents.map((t) => `  - ${t}`).join("\n")
      : "  None"

  const riskList =
    ctx.openRisks.length > 0
      ? ctx.openRisks.map((t) => `  - ${t}`).join("\n")
      : "  None"

  const scoreText =
    ctx.complianceScore !== null
      ? `${ctx.complianceScore}/100 (${ctx.riskLevel} risk)`
      : "Not yet assessed"

  return `You are a HIPAA compliance assistant embedded in ComplyCare, a healthcare compliance management platform.

You are helping the compliance officer at ${ctx.orgName}, a ${ctx.orgType} organization (${ctx.orgSize} employees).

Current compliance context:
- Compliance score: ${scoreText}
- Open incidents:
${incidentList}
- Open risks:
${riskList}

Your role:
- Answer questions about HIPAA requirements, regulations, and best practices
- Help prioritise compliance actions based on the organisation's current state
- Provide incident response guidance
- Recommend policies and controls
- Explain CFR citations clearly (e.g. 45 CFR 164.308)

Guidelines:
- Be concise and practical — compliance officers are busy
- Reference HIPAA CFR sections when relevant
- Tailor advice to the org's current compliance score and open issues
- When the score is low, focus on high-impact quick wins
- Never make up regulatory citations — only cite ones you are confident about`
}

function mockStream(question: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  const lower = question.toLowerCase()

  let reply: string
  if (lower.includes("first") || lower.includes("improve") || lower.includes("score")) {
    reply =
      "Based on your current compliance score, I recommend focusing on these quick wins first:\n\n" +
      "1. **Complete overdue training** — workforce training gaps are the most common audit finding under 45 CFR 164.530(b). Assign modules to all staff and set a 30-day deadline.\n\n" +
      "2. **Remediate critical vulnerabilities** — any open critical vulnerabilities in systems handling ePHI should be patched within 7 days per your risk management policy.\n\n" +
      "3. **Close open incidents** — unresolved incidents can become reportable breaches. Document containment steps and resolution dates for each.\n\n" +
      "Would you like a step-by-step guide for any of these?"
  } else if (lower.includes("breach") || lower.includes("incident")) {
    reply =
      "Here is the HIPAA breach response workflow:\n\n" +
      "**Immediate (0–24 hours)**\n" +
      "- Contain the breach — isolate affected systems\n" +
      "- Preserve evidence — do not delete logs\n" +
      "- Notify your Privacy Officer\n\n" +
      "**Short-term (24–72 hours)**\n" +
      "- Conduct a risk assessment: nature of PHI, who accessed it, likelihood of harm\n" +
      "- If risk is not low, you have 60 days to notify affected individuals (45 CFR 164.404)\n\n" +
      "**Reporting obligations**\n" +
      "- < 500 individuals: report to HHS annually\n" +
      "- ≥ 500 individuals: report to HHS *and* local media within 60 days\n\n" +
      "Log this incident in ComplyCare under Operations → Incidents to start the paper trail."
  } else if (lower.includes("security rule") || lower.includes("hipaa")) {
    reply =
      "The HIPAA Security Rule (45 CFR Part 164, Subpart C) requires covered entities to protect **electronic PHI (ePHI)** through three safeguard categories:\n\n" +
      "**Administrative safeguards** (164.308)\n" +
      "- Risk analysis and risk management\n" +
      "- Workforce training and access management\n" +
      "- Contingency planning\n\n" +
      "**Physical safeguards** (164.310)\n" +
      "- Facility access controls\n" +
      "- Workstation use and security\n" +
      "- Device and media controls\n\n" +
      "**Technical safeguards** (164.312)\n" +
      "- Access controls and audit controls\n" +
      "- Integrity controls\n" +
      "- Transmission security (encryption)\n\n" +
      "Which area would you like to explore in more detail?"
  } else {
    reply =
      "I'm your HIPAA compliance assistant. I can help with:\n\n" +
      "- **Risk prioritisation** — what to fix first based on your current score\n" +
      "- **Breach response** — step-by-step incident handling\n" +
      "- **Policy guidance** — what policies you need and what they should cover\n" +
      "- **HIPAA explanations** — plain-language breakdowns of CFR requirements\n\n" +
      "What would you like to know?"
  }

  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(reply))
      controller.close()
    },
  })
}

function claudeStream(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY!,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      stream: true,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  }).then((upstream) => {
    if (!upstream.ok) {
      throw new Error(`Claude API error: ${upstream.status}`)
    }

    let buffer = ""

    const transform = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const data = line.slice(6).trim()
          if (!data || data === "[DONE]") continue
          try {
            const event = JSON.parse(data) as {
              type: string
              delta?: { type: string; text?: string }
            }
            if (
              event.type === "content_block_delta" &&
              event.delta?.type === "text_delta" &&
              event.delta.text
            ) {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          } catch {
            // skip malformed SSE event
          }
        }
      },
    })

    upstream.body?.pipeTo(transform.writable).catch(() => {})
    return transform.readable
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  let body: { messages?: ChatMessage[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const messages = body.messages ?? []
  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages provided." }, { status: 400 })
  }

  const { data: membership } = await supabase
    .from("org_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .maybeSingle()

  const organizationId = membership?.organization_id ?? null

  const [{ data: orgProfile }, { data: assessment }, { data: incidents }, { data: risks }] =
    await Promise.all([
      organizationId
        ? supabase
            .from("organizations")
            .select("name, org_type, org_size")
            .eq("id", organizationId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      organizationId
        ? supabase
            .from("assessments")
            .select("compliance_score, risk_level")
            .eq("organization_id", organizationId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      organizationId
        ? supabase
            .from("incidents")
            .select("title")
            .eq("organization_id", organizationId)
            .eq("status", "open")
            .limit(5)
        : Promise.resolve({ data: [] }),
      organizationId
        ? supabase
            .from("risks")
            .select("title")
            .eq("organization_id", organizationId)
            .eq("status", "open")
            .limit(5)
        : Promise.resolve({ data: [] }),
    ])

  const ctx: OrgContext = {
    orgName: (orgProfile as { name?: string } | null)?.name ?? "your organisation",
    orgType: (orgProfile as { org_type?: string } | null)?.org_type ?? "healthcare",
    orgSize: (orgProfile as { org_size?: string } | null)?.org_size ?? "unknown",
    complianceScore:
      (assessment as { compliance_score?: number } | null)?.compliance_score ?? null,
    riskLevel: (assessment as { risk_level?: string } | null)?.risk_level ?? "unknown",
    openIncidents: ((incidents ?? []) as { title: string }[]).map((i) => i.title),
    openRisks: ((risks ?? []) as { title: string }[]).map((r) => r.title),
  }

  const systemPrompt = buildSystemPrompt(ctx)
  const lastUserMessage = messages.findLast((m) => m.role === "user")?.content ?? ""

  const streamHeaders = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-cache",
    "X-Accel-Buffering": "no",
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(mockStream(lastUserMessage), { headers: streamHeaders })
  }

  try {
    const stream = await claudeStream(messages, systemPrompt)
    return new Response(stream, { headers: streamHeaders })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Chat failed."
    return new Response(mockStream(lastUserMessage), {
      headers: { ...streamHeaders, "X-Chat-Error": msg },
    })
  }
}
