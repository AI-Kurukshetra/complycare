import { NextResponse } from "next/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const { organizationId, email, role } = payload as {
      organizationId?: string
      email?: string
      role?: "owner" | "admin" | "member" | "auditor"
    }

    if (!organizationId || !email || !role) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
    }

    const { data: membership, error: membershipError } = await supabase
      .from("org_members")
      .select("id, role")
      .eq("organization_id", organizationId)
      .eq("user_id", userData.user.id)
      .maybeSingle()

    const canInvite = membership?.role === "owner" || membership?.role === "admin"
    if (membershipError || !membership || !canInvite) {
      return NextResponse.json({ error: "Owner or admin access required." }, { status: 403 })
    }

    const admin = createAdminClient()
    const { data: usersData, error: adminError } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    })

    const existingUser = usersData?.users.find(
      (candidate) => candidate.email?.toLowerCase() === email.toLowerCase()
    )

    if (adminError || !existingUser) {
      return NextResponse.json(
        { error: "User not found. Ask them to sign up first." },
        { status: 404 }
      )
    }

    const { error: insertError } = await admin.from("org_members").upsert(
      {
        organization_id: organizationId,
        user_id: existingUser.id,
        role,
      },
      { onConflict: "organization_id,user_id" }
    )

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
