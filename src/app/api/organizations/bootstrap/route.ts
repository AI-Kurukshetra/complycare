import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"

type BootstrapPayload = {
  organizationId?: string
  name?: string
  orgType?: string | null
  orgSize?: string | null
  primaryContact?: string | null
}

type MembershipRole = "owner" | "admin" | "member" | "auditor"

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BootstrapPayload
    const desiredOrgId = payload.organizationId ?? randomUUID()
    const name = payload.name?.trim()

    const supabase = await createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
    }

    const userId = userData.user.id
    const admin = createAdminClient()

    const { data: existingMembership, error: existingMembershipError } = await admin
      .from("org_members")
      .select("organization_id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle()

    if (existingMembershipError) {
      return NextResponse.json({ error: existingMembershipError.message }, { status: 400 })
    }

    if (existingMembership?.organization_id) {
      return NextResponse.json({ organizationId: existingMembership.organization_id })
    }

    const { data: existingOrg, error: orgLookupError } = await admin
      .from("organizations")
      .select("id, created_by")
      .eq("id", desiredOrgId)
      .maybeSingle()

    if (orgLookupError) {
      return NextResponse.json({ error: orgLookupError.message }, { status: 400 })
    }

    let roleForMembership: MembershipRole = "owner"

    if (!existingOrg) {
      if (!name) {
        return NextResponse.json({ error: "Organization name is required." }, { status: 400 })
      }

      const { error: createOrgError } = await admin.from("organizations").insert({
        id: desiredOrgId,
        name,
        org_type: payload.orgType ?? null,
        org_size: payload.orgSize ?? null,
        primary_contact: payload.primaryContact ?? null,
        created_by: userId,
      })

      if (createOrgError) {
        return NextResponse.json({ error: createOrgError.message }, { status: 400 })
      }
    } else if (existingOrg.created_by !== userId) {
      const { data: membershipForTarget, error: membershipForTargetError } = await admin
        .from("org_members")
        .select("role")
        .eq("organization_id", desiredOrgId)
        .eq("user_id", userId)
        .maybeSingle()

      if (membershipForTargetError) {
        return NextResponse.json({ error: membershipForTargetError.message }, { status: 400 })
      }

      if (!membershipForTarget) {
        return NextResponse.json({ error: "Invalid organization context." }, { status: 403 })
      }

      roleForMembership = membershipForTarget.role as MembershipRole
    }

    const { error: membershipError } = await admin.from("org_members").upsert(
      {
        organization_id: desiredOrgId,
        user_id: userId,
        role: roleForMembership,
      },
      {
        onConflict: "organization_id,user_id",
        ignoreDuplicates: true,
      }
    )

    if (membershipError) {
      return NextResponse.json({ error: membershipError.message }, { status: 400 })
    }

    return NextResponse.json({ organizationId: desiredOrgId })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
