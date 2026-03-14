import { createClient } from "@/utils/supabase/client"
import { LIST_LIMIT } from "@/lib/query-limits"

export type DateRange = {
  start: string
  end: string
}

export type ComplianceTrendPoint = {
  month: string
  score: number
}

export type RiskSummaryItem = {
  id: string
  title: string
  severity: string
  status: string
  createdAt: string
  ageDays: number
}

export type IncidentSummary = {
  open: number
  resolved: number
  total: number
}

export type VendorComplianceSummary = {
  compliant: number
  atRisk: number
  nonCompliant: number
}

export type TrainingDepartmentSummary = {
  department: string
  completionRate: number
}

function formatMonth(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
}

function differenceInDays(date: Date) {
  const diff = Date.now() - date.getTime()
  return Math.max(0, Math.floor(diff / 86400000))
}

export async function fetchComplianceTrend(
  organizationId: string,
  range: DateRange
): Promise<ComplianceTrendPoint[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("assessments")
    .select("compliance_score, created_at")
    .eq("organization_id", organizationId)
    .gte("created_at", range.start)
    .lte("created_at", range.end)
    .order("created_at", { ascending: true })
    .limit(LIST_LIMIT)

  if (error) throw error

  const buckets = new Map<string, { total: number; count: number }>()
  ;(data ?? []).forEach((row) => {
    const date = new Date(row.created_at)
    const key = formatMonth(date)
    const current = buckets.get(key) ?? { total: 0, count: 0 }
    current.total += row.compliance_score ?? 0
    current.count += 1
    buckets.set(key, current)
  })

  const points: ComplianceTrendPoint[] = []
  const start = new Date(range.start)
  start.setDate(1)
  const end = new Date(range.end)
  end.setDate(1)

  for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
    const key = formatMonth(d)
    const bucket = buckets.get(key)
    points.push({
      month: key,
      score: bucket ? Math.round(bucket.total / bucket.count) : 0,
    })
  }

  return points
}

export async function fetchOpenRisks(organizationId: string): Promise<RiskSummaryItem[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("risks")
    .select("id, title, severity, status, created_at")
    .eq("organization_id", organizationId)
    .neq("status", "closed")
    .order("created_at", { ascending: false })
    .limit(LIST_LIMIT)

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    severity: row.severity,
    status: row.status,
    createdAt: row.created_at,
    ageDays: differenceInDays(new Date(row.created_at)),
  }))
}

export async function fetchIncidentSummary(organizationId: string): Promise<IncidentSummary> {
  const supabase = createClient()
  const { count: total, error: totalError } = await supabase
    .from("incidents")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)

  if (totalError) throw totalError

  const { count: resolved, error: resolvedError } = await supabase
    .from("incidents")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "resolved")

  if (resolvedError) throw resolvedError

  const resolvedCount = resolved ?? 0
  const totalCount = total ?? 0
  const open = Math.max(0, totalCount - resolvedCount)
  return { open, resolved: resolvedCount, total: totalCount }
}

export async function fetchVendorComplianceSummary(
  organizationId: string
): Promise<VendorComplianceSummary> {
  const supabase = createClient()
  const { data: vendors, error } = await supabase
    .from("vendors")
    .select("id")
    .eq("organization_id", organizationId)
    .limit(LIST_LIMIT)

  if (error) throw error

  const vendorIds = (vendors ?? [])
    .map((vendor) => vendor.id)
    .filter((id): id is string => Boolean(id))
  if (vendorIds.length === 0) {
    return { compliant: 0, atRisk: 0, nonCompliant: 0 }
  }

  const { data: assessments } = await supabase
    .from("vendor_assessments")
    .select("vendor_id, status")
    .in("vendor_id", vendorIds)
    .order("created_at", { ascending: false })
    .limit(LIST_LIMIT)

  const { data: baas } = await supabase
    .from("baas")
    .select("vendor_id, status")
    .in("vendor_id", vendorIds)
    .limit(LIST_LIMIT)

  const latestAssessment = new Map<string, string>()
  ;(assessments ?? []).forEach((item) => {
    if (item.vendor_id && !latestAssessment.has(item.vendor_id)) {
      latestAssessment.set(item.vendor_id, item.status)
    }
  })

  const baaStatus = new Map<string, string>()
  ;(baas ?? []).forEach((item) => {
    if (item.vendor_id) {
      baaStatus.set(item.vendor_id, item.status)
    }
  })

  let compliant = 0
  let atRisk = 0
  let nonCompliant = 0

  vendorIds.forEach((vendorId) => {
    const assessment = latestAssessment.get(vendorId) ?? "pending"
    const baa = baaStatus.get(vendorId) ?? "pending"
    if (assessment === "approved" && baa === "signed") {
      compliant += 1
    } else if (assessment === "pending" || baa === "pending") {
      atRisk += 1
    } else {
      nonCompliant += 1
    }
  })

  return { compliant, atRisk, nonCompliant }
}

export function buildTrainingCompletionByDepartment(orgName: string): TrainingDepartmentSummary[] {
  const departments = ["Clinical", "Billing", "IT", "Operations", "Admin"]
  const seed = orgName.length
  return departments.map((department, index) => ({
    department,
    completionRate: 60 + ((seed + index * 11) % 35),
  }))
}

export function buildHipaaDomainBreakdown() {
  return [
    { label: "Administrative", value: 45 },
    { label: "Physical", value: 25 },
    { label: "Technical", value: 30 },
  ]
}
