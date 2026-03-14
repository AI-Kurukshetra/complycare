const { createClient } = require("@supabase/supabase-js")

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const orgs = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Northwind Family Clinic",
    org_type: "Primary Care",
    org_size: "11-50",
    primary_contact: "compliance@northwind.test",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Lakeside Behavioral Health",
    org_type: "Behavioral Health",
    org_size: "51-200",
    primary_contact: "security@lakeside.test",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Summit Cardiology Group",
    org_type: "Specialty Care",
    org_size: "51-200",
    primary_contact: "risk@summit.test",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Harborview Pediatrics",
    org_type: "Pediatrics",
    org_size: "1-10",
    primary_contact: "ops@harborview.test",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    name: "BrightPath Rehab",
    org_type: "Rehabilitation",
    org_size: "11-50",
    primary_contact: "compliance@brightpath.test",
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    name: "Pinecrest Diagnostics",
    org_type: "Diagnostics",
    org_size: "201-500",
    primary_contact: "security@pinecrest.test",
  },
]

const users = [
  { email: "owner@northwind.test", password: "DemoPass!123", role: "owner", orgId: orgs[0].id },
  { email: "admin@northwind.test", password: "DemoPass!123", role: "admin", orgId: orgs[0].id },
  { email: "member@northwind.test", password: "DemoPass!123", role: "member", orgId: orgs[0].id },
  { email: "owner@lakeside.test", password: "DemoPass!123", role: "owner", orgId: orgs[1].id },
  { email: "member@lakeside.test", password: "DemoPass!123", role: "member", orgId: orgs[1].id },
  { email: "owner@summit.test", password: "DemoPass!123", role: "owner", orgId: orgs[2].id },
  { email: "admin@summit.test", password: "DemoPass!123", role: "admin", orgId: orgs[2].id },
  { email: "owner@harborview.test", password: "DemoPass!123", role: "owner", orgId: orgs[3].id },
  { email: "owner@brightpath.test", password: "DemoPass!123", role: "owner", orgId: orgs[4].id },
  { email: "admin@brightpath.test", password: "DemoPass!123", role: "admin", orgId: orgs[4].id },
  { email: "owner@pinecrest.test", password: "DemoPass!123", role: "owner", orgId: orgs[5].id },
  { email: "member@pinecrest.test", password: "DemoPass!123", role: "member", orgId: orgs[5].id },
]

async function getOrCreateUser(email, password) {
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  })
  if (listError) throw listError
  const existing = listData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
  if (existing) return existing

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (createError) throw createError
  return created.user
}

async function upsert(table, rows, onConflict = "id") {
  if (!rows.length) return
  const { error } = await supabase.from(table).upsert(rows, { onConflict })
  if (error) throw error
}

async function run() {
  const resolvedUsers = []
  for (const user of users) {
    const created = await getOrCreateUser(user.email, user.password)
    resolvedUsers.push({ ...user, id: created.id })
  }

  const usersByOrg = resolvedUsers.reduce((acc, user) => {
    acc[user.orgId] = acc[user.orgId] || []
    acc[user.orgId].push(user)
    return acc
  }, {})

  const pickUserId = (orgId, index = 0) => {
    const list = usersByOrg[orgId] || []
    if (!list.length) return resolvedUsers[0].id
    return list[Math.min(index, list.length - 1)].id
  }

  const day = 86400000
  const isoDate = (offsetDays) => new Date(Date.now() + day * offsetDays).toISOString().slice(0, 10)
  const isoDateTime = (offsetDays) => new Date(Date.now() + day * offsetDays).toISOString()
  const makeId = (prefix, index) => `${prefix}-${String(index).padStart(12, "0")}`

  await upsert("organizations", orgs)

  await upsert(
    "org_members",
    resolvedUsers.map((user) => ({
      organization_id: user.orgId,
      user_id: user.id,
      role: user.role,
    })),
    "organization_id,user_id"
  )

  const policyTemplates = [
    {
      id: "99999999-9999-9999-9999-999999999999",
      title: "Incident Response Policy",
      category: "Security",
      body: "Outline breach identification and response steps.",
      version: "v1.2",
    },
    {
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab",
      title: "Access Control Policy",
      category: "Security",
      body: "Define least-privilege access and periodic reviews.",
      version: "v2.0",
    },
  ]

  await upsert("policy_templates", policyTemplates)

  const assessments = []
  const evidenceItems = []
  const reports = []
  const incidents = []
  const incidentSteps = []
  const calendarTasks = []
  const policyInstances = []
  const documents = []
  const auditLogs = []
  const risks = []
  const riskActions = []
  const vendors = []
  const vendorAssessments = []
  const baasRecords = []
  const accessReviews = []
  const accessReviewItems = []
  const vulnerabilities = []
  const complianceChecks = []
  const regulatoryUpdates = []
  const locations = []
  const integrationKeys = []
  const secureMessages = []
  const notifications = []
  const behaviorAlerts = []
  const pentestRuns = []
  const auditChainEntries = []
  const trainingSims = []
  const trainingCompletions = []
  const iotDevices = []

  orgs.forEach((org, index) => {
    const idx = index + 1
    const orgUserId = pickUserId(org.id)
    const orgUserAltId = pickUserId(org.id, 1)

    const assessmentId = makeId("33333333-3333-3333-3333", idx)
    const incidentId = makeId("66666666-6666-6666-6666", idx)
    const policyInstanceId = makeId("aaaaaaaa-aaaa-aaaa-aaaa", idx)
    const riskId = makeId("dddddddd-dddd-dddd-dddd", idx)
    const vendorId = makeId("ffffffff-ffff-ffff-ffff", idx)
    const accessReviewId = makeId("14141414-1414-1414-1414", idx)
    const trainingModuleId = makeId("26262626-2626-2626-2626", idx)
    assessments.push({
      id: assessmentId,
      organization_id: org.id,
      compliance_score: 70 + index * 4,
      risk_score: 25 + index * 6,
      risk_level: index % 2 === 0 ? "medium" : "high",
      answers: {
        encryption: { value: index % 2 === 0 ? "partial" : "full", label: "Encryption", score: 3 + (index % 2) },
        training: { value: index % 3 === 0 ? "annual" : "quarterly", label: "Training", score: 4 + (index % 2) },
      },
    })

    evidenceItems.push({
      id: makeId("44444444-4444-4444-4444", idx),
      assessment_id: assessmentId,
      file_name: `policy-audit-${idx}.pdf`,
      file_type: "application/pdf",
      category: "policy",
      summary: "Policy review with noted remediation steps.",
      extracted: "Key sections confirmed; remediation tasks logged.",
    })

    reports.push({
      id: makeId("55555555-5555-5555-5555", idx),
      assessment_id: assessmentId,
      payload: { status: "ok", generatedAt: isoDateTime(-index * 3) },
    })

    incidents.push({
      id: incidentId,
      organization_id: org.id,
      title: index % 2 === 0 ? "Lost laptop with PHI" : "Phishing email reported",
      severity: index % 3 === 0 ? "high" : "medium",
      status: index % 2 === 0 ? "open" : "investigating",
    })

    incidentSteps.push({
      id: makeId("77777777-7777-7777-7777", idx),
      incident_id: incidentId,
      title: "Notify compliance officer",
      status: index % 2 === 0 ? "pending" : "complete",
    })

    calendarTasks.push({
      id: makeId("88888888-8888-8888-8888", idx),
      organization_id: org.id,
      title: "Annual Risk Assessment",
      due_date: isoDate(30 + index * 3),
      status: index % 2 === 0 ? "open" : "in_progress",
      task_type: "risk_assessment",
      recurrence_rule: "annually",
      notification_days_before: [30, 7, 1],
      assigned_to: orgUserId,
    })

    policyInstances.push({
      id: policyInstanceId,
      organization_id: org.id,
      template_id: policyTemplates[index % policyTemplates.length].id,
      status: index % 2 === 0 ? "active" : "review",
      applied_at: isoDateTime(-index * 10),
    })

    documents.push({
      id: makeId("bbbbbbbb-bbbb-bbbb-bbbb", idx),
      organization_id: org.id,
      title: index % 2 === 0 ? "HIPAA Privacy Policy" : "Security Risk Assessment",
      tags: index % 2 === 0 ? ["hipaa", "privacy"] : ["risk", "security"],
      storage_path: `${org.id}/doc-${idx}.pdf`,
      file_name: `doc-${idx}.pdf`,
      file_path: `${org.id}/doc-${idx}.pdf`,
      file_size: 380000 + index * 12000,
      mime_type: "application/pdf",
      category: index % 2 === 0 ? "policy" : "report",
      version: 1 + (index % 2),
      uploaded_by: orgUserId,
    })

    auditLogs.push({
      id: makeId("cccccccc-cccc-cccc-cccc", idx),
      organization_id: org.id,
      action: "Policy reviewed",
      entity_type: "policy_instance",
      entity_id: policyInstanceId,
      actor: usersByOrg[org.id]?.[0]?.email || "system@demo.test",
      metadata: { reviewer: usersByOrg[org.id]?.[0]?.email || "system@demo.test" },
    })

    risks.push({
      id: riskId,
      organization_id: org.id,
      title: index % 2 === 0 ? "Vendor access review overdue" : "Legacy endpoint exposure",
      severity: index % 3 === 0 ? "high" : "medium",
      status: index % 2 === 0 ? "open" : "mitigating",
    })

    riskActions.push({
      id: makeId("eeeeeeee-eeee-eeee-eeee", idx),
      risk_id: riskId,
      action: "Schedule access review meeting",
      status: index % 2 === 0 ? "planned" : "in_progress",
      due_date: isoDate(14 + index * 2),
    })

    vendors.push({
      id: vendorId,
      organization_id: org.id,
      name: index % 2 === 0 ? "CloudBilling LLC" : "SecureHost Systems",
      criticality: index % 2 === 0 ? "high" : "medium",
      status: index % 3 === 0 ? "active" : "monitoring",
    })

    vendorAssessments.push({
      id: makeId("12121212-1212-1212-1212", idx),
      vendor_id: vendorId,
      score: 80 + index * 2,
      status: index % 2 === 0 ? "approved" : "review",
      notes: "SOC 2 Type II verified.",
    })

    baasRecords.push({
      id: makeId("13131313-1313-1313-1313", idx),
      vendor_id: vendorId,
      status: index % 2 === 0 ? "signed" : "pending",
      renewal_date: isoDate(180 + index * 10),
    })

    accessReviews.push({
      id: accessReviewId,
      organization_id: org.id,
      title: "Quarterly Access Review",
      status: index % 2 === 0 ? "open" : "complete",
    })

    accessReviewItems.push({
      id: makeId("15151515-1515-1515-1515", idx),
      access_review_id: accessReviewId,
      subject: "Billing staff access to PHI",
      decision: index % 2 === 0 ? "pending" : "approved",
    })

    vulnerabilities.push({
      id: makeId("16161616-1616-1616-1616", idx),
      organization_id: org.id,
      title: index % 2 === 0 ? "Outdated SSL certificate" : "Weak MFA enrollment",
      severity: index % 2 === 0 ? "high" : "medium",
      status: index % 3 === 0 ? "open" : "monitoring",
      asset: index % 2 === 0 ? "patient-portal" : "ehr-gateway",
    })

    complianceChecks.push({
      id: makeId("17171717-1717-1717-1717", idx),
      organization_id: org.id,
      title: "Access logs review",
      status: index % 3 === 0 ? "drift" : "pass",
      last_checked_at: isoDateTime(-index * 2),
    })

    regulatoryUpdates.push({
      id: makeId("18181818-1818-1818-1818", idx),
      organization_id: org.id,
      title: "OCR settlement update",
      summary: "New enforcement action highlights encryption requirements.",
      impact_level: index % 2 === 0 ? "high" : "medium",
      affected_areas: index % 2 === 0 ? ["security", "training"] : ["access"],
      action_required: true,
      source_url: "https://www.hhs.gov/hipaa",
    })

    locations.push({
      id: makeId("19191919-1919-1919-1919", idx),
      organization_id: org.id,
      name: index % 2 === 0 ? "Downtown Clinic" : "Westside Annex",
      address: `${100 + index} Main St, Springfield`,
      status: index % 2 === 0 ? "active" : "inactive",
    })

    integrationKeys.push({
      id: makeId("20202020-2020-2020-2020", idx),
      organization_id: org.id,
      label: index % 2 === 0 ? "EHR Integration" : "SIEM Forwarder",
      token: `key_demo_${idx}_001`,
    })

    secureMessages.push({
      id: makeId("21212121-2121-2121-2121", idx),
      organization_id: org.id,
      recipient: org.primary_contact,
      subject: "Policy update request",
      encrypted_payload: "encrypted_payload_demo",
    })

    notifications.push({
      id: makeId("22222222-2222-2222-2222", idx),
      organization_id: org.id,
      user_id: orgUserId,
      message: "Upcoming risk assessment due in 30 days.",
      link: "/calendar",
    })

    behaviorAlerts.push({
      id: makeId("23232323-2323-2323-2323", idx),
      organization_id: org.id,
      title: "Unusual access pattern detected",
      severity: index % 2 === 0 ? "high" : "medium",
    })

    pentestRuns.push({
      id: makeId("24242424-2424-2424-2424", idx),
      organization_id: org.id,
      status: index % 2 === 0 ? "scheduled" : "completed",
      findings: index % 2 === 0 ? 3 : 0,
    })

    auditChainEntries.push({
      id: makeId("25252525-2525-2525-2525", idx),
      organization_id: org.id,
      payload: "Policy review signed by compliance lead",
      prev_hash: null,
      hash: `hash_demo_${idx}`,
    })

    trainingSims.push({
      id: trainingModuleId,
      organization_id: org.id,
      title: "HIPAA Basics",
      description: "Core HIPAA requirements for new staff.",
      module_type: "quiz",
      content_json: [
        {
          question: "What protects ePHI?",
          options: [
            { label: "Security Rule", isCorrect: true },
            { label: "Privacy Rule" },
          ],
        },
      ],
      estimated_minutes: 10,
      passing_score: 80,
      is_required: true,
      due_date: isoDate(45 + index * 3),
    })

    trainingCompletions.push({
      id: makeId("27272727-2727-2727-2727", idx),
      module_id: trainingModuleId,
      user_id: orgUserAltId,
      score: 78 + index * 3,
      completed_at: isoDateTime(-index * 5),
      certificate_url: `cert-demo-${idx}`,
      attempts: 1 + (index % 2),
    })

    iotDevices.push({
      id: makeId("28282828-2828-2828-2828", idx),
      organization_id: org.id,
      name: `Infusion Pump ${String.fromCharCode(65 + index)}-${10 + index}`,
      status: index % 2 === 0 ? "monitored" : "offline",
      device_type: "infusion_pump",
      ip_address: `10.0.${5 + index}.12`,
      last_seen: isoDateTime(-index),
      firmware_version: `3.${4 + index}.1`,
      firmware_updated_at: isoDate(-30 - index),
      compliance_status: index % 2 === 0 ? "compliant" : "at_risk",
      encryption_status: index % 2 === 0 ? "encrypted" : "partially_encrypted",
      network_exposure: index % 2 === 0 ? "internal" : "external",
      handles_phi: index % 2 === 0,
    })
  })

  await upsert("assessments", assessments)
  await upsert("evidence_items", evidenceItems)
  await upsert("reports", reports)
  await upsert("incidents", incidents)
  await upsert("incident_steps", incidentSteps)
  await upsert("calendar_tasks", calendarTasks)
  await upsert("policy_instances", policyInstances)
  await upsert("documents", documents)
  await upsert("audit_logs", auditLogs)
  await upsert("risks", risks)
  await upsert("risk_actions", riskActions)
  await upsert("vendors", vendors)
  await upsert("vendor_assessments", vendorAssessments)
  await upsert("baas", baasRecords)
  await upsert("access_reviews", accessReviews)
  await upsert("access_review_items", accessReviewItems)
  await upsert("vulnerabilities", vulnerabilities)
  await upsert("compliance_checks", complianceChecks)
  await upsert("regulatory_updates", regulatoryUpdates)
  await upsert("locations", locations)
  await upsert("integration_keys", integrationKeys)
  await upsert("secure_messages", secureMessages)
  await upsert("notifications", notifications)
  await upsert("behavior_alerts", behaviorAlerts)
  await upsert("pentest_runs", pentestRuns)
  await upsert("audit_chain_entries", auditChainEntries)
  await upsert("training_sims", trainingSims)
  await upsert("training_completions", trainingCompletions)
  await upsert("iot_devices", iotDevices)

  console.log("Seed completed.")
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
