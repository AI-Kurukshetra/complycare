import { NextResponse } from "next/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  try {
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

    const canManageTraining = membership.role === "owner" || membership.role === "admin"
    if (!canManageTraining) {
      return NextResponse.json({ error: "Owner or admin access required." }, { status: 403 })
    }

    const admin = createAdminClient()

    const { data: modules, error: moduleError } = await admin
      .from("training_sims")
      .select("id, title, passing_score, is_required, due_date, module_type, estimated_minutes")
      .eq("organization_id", membership.organization_id)
      .order("created_at", { ascending: false })

    if (moduleError) {
      return NextResponse.json({ error: moduleError.message }, { status: 400 })
    }

    const { data: members, error: memberError } = await admin
      .from("org_members")
      .select("user_id, role, created_at")
      .eq("organization_id", membership.organization_id)

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 400 })
    }

    const memberDetails = await Promise.all(
      (members ?? []).map(async (member) => {
        const { data, error } = await admin.auth.admin.getUserById(member.user_id)
        return {
          userId: member.user_id,
          email: data?.user?.email ?? "Unknown",
          role: member.role,
          error: error?.message ?? null,
        }
      })
    )

    const moduleIds = (modules ?? []).map((module) => module.id)
    const completions = moduleIds.length
      ? await admin
          .from("training_completions")
          .select("id, module_id, user_id, score, completed_at, attempts")
          .in("module_id", moduleIds)
      : { data: [], error: null }

    if (completions.error) {
      return NextResponse.json({ error: completions.error.message }, { status: 400 })
    }

    return NextResponse.json({
      organizationId: membership.organization_id,
      members: memberDetails.map((member) => ({
        userId: member.userId,
        email: member.email,
        role: member.role,
      })),
      modules: (modules ?? []).map((module) => ({
        id: module.id,
        title: module.title,
        passingScore: module.passing_score ?? 0,
        isRequired: module.is_required ?? false,
        dueDate: module.due_date ?? null,
        moduleType: module.module_type ?? "quiz",
        estimatedMinutes: module.estimated_minutes ?? 0,
      })),
      completions: (completions.data ?? []).map((completion) => ({
        id: completion.id,
        moduleId: completion.module_id,
        userId: completion.user_id,
        score: completion.score ?? null,
        completedAt: completion.completed_at ?? null,
        attempts: completion.attempts ?? 1,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
