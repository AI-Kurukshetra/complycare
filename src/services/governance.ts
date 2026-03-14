import { createClient } from "@/utils/supabase/client"

export async function createRisk(organizationId: string, title: string, severity: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("risks")
    .insert({ organization_id: organizationId, title, severity, status: "open" })
    .select("id, created_at")
    .single()

  if (error) throw error
  return data
}

export async function addRiskAction(riskId: string, action: string, dueDate?: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("risk_actions")
    .insert({ risk_id: riskId, action, status: "planned", due_date: dueDate })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}

export async function createVendor(
  organizationId: string,
  name: string,
  criticality: string
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("vendors")
    .insert({ organization_id: organizationId, name, criticality, status: "active" })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}

export async function createVendorAssessment(
  vendorId: string,
  score: number,
  status: string,
  notes?: string
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("vendor_assessments")
    .insert({ vendor_id: vendorId, score, status, notes })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}

export async function createBaa(vendorId: string, status: string, renewalDate?: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("baas")
    .insert({ vendor_id: vendorId, status, renewal_date: renewalDate })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}

export async function createAccessReview(organizationId: string, title: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("access_reviews")
    .insert({ organization_id: organizationId, title, status: "open" })
    .select("id, created_at")
    .single()

  if (error) throw error
  return data
}

export async function addAccessReviewItem(accessReviewId: string, subject: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("access_review_items")
    .insert({ access_review_id: accessReviewId, subject, decision: "pending" })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}

export async function updateAccessReviewDecision(itemId: string, decision: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("access_review_items")
    .update({ decision })
    .eq("id", itemId)

  if (error) throw error
}
