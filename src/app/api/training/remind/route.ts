import { NextResponse } from "next/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      organizationId?: string
      overdue?: { userId: string; moduleId: string }[]
    }

    const supabase = await createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
    }

    const { data: membership, error: membershipError } = await supabase
      .from("org_members")
      .select("organization_id, role")
      .eq("user_id", userData.user.id)
      .maybeSingle()

    if (membershipError || !membership?.organization_id) {
      return NextResponse.json({ error: "Organization access required." }, { status: 403 })
    }

    const canSendReminder = membership.role === "owner" || membership.role === "admin"
    if (!canSendReminder) {
      return NextResponse.json({ error: "Owner or admin access required." }, { status: 403 })
    }

    const organizationId = payload.organizationId ?? membership.organization_id
    if (organizationId !== membership.organization_id) {
      return NextResponse.json({ error: "Organization mismatch." }, { status: 403 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin.functions.invoke("training-reminders", {
      body: {
        organizationId,
        overdue: payload.overdue ?? [],
      },
    })

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          warning:
            "Reminder service not configured. Hook a Supabase Edge Function named training-reminders to send emails.",
          error: error.message,
        },
        { status: 200 }
      )
    }

    return NextResponse.json({ ok: true, data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
