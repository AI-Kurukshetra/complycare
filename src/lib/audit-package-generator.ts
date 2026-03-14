import { jsPDF } from "jspdf"
import type { EvidenceItem, ReportSummary } from "@/types/compliance"

export type AuditPackageInput = {
  orgName: string
  orgType: string
  report: ReportSummary
  evidence: EvidenceItem[]
  complianceHistory: Array<{ date: string; score: number }>
  policies: Array<{ title: string; category: string; status: string; lastReviewed: string | null }>
  risks: Array<{
    title: string
    severity: string
    status: string
    createdAt: string
    actions: Array<{ action: string; status: string; dueDate: string | null }>
  }>
  training: {
    summary: { totalCompletions: number; averageScore: number }
    records: Array<{ module: string; completedAt: string | null; score: number | null }>
  }
  incidents: Array<{ title: string; severity: string; status: string; createdAt: string }>
  vendors: Array<{
    name: string
    status: string
    baaStatus: string | null
    assessmentStatus: string | null
  }>
}

const marginX = 18
const lineHeight = 6
const pageHeight = 280

function formatDate(value: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function addSectionTitle(doc: jsPDF, title: string, y: number) {
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text(title, marginX, y)
  return y + lineHeight
}

function addParagraph(doc: jsPDF, text: string, y: number, maxWidth = 170) {
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  const lines = doc.splitTextToSize(text, maxWidth)
  doc.text(lines, marginX, y)
  return y + lines.length * lineHeight
}

function ensureSpace(doc: jsPDF, y: number, buffer = 18) {
  if (y > pageHeight - buffer) {
    doc.addPage()
    return 20
  }
  return y
}

export function generateAuditPackagePdf(input: AuditPackageInput) {
  const doc = new jsPDF()
  let y = 20

  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text("HIPAA Compliance Audit Package", marginX, y)
  y += lineHeight + 4

  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.text(`${input.orgName || "Organization"} · ${input.orgType}`, marginX, y)
  y += lineHeight
  doc.text(`Generated ${formatDate(new Date().toISOString())}`, marginX, y)

  doc.addPage()
  const tocPage = doc.getNumberOfPages()
  y = 20
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text("Table of Contents", marginX, y)

  const sections: Array<{ title: string; page: number }> = []

  function startSection(title: string) {
    doc.addPage()
    y = 20
    sections.push({ title, page: doc.getNumberOfPages() })
    y = addSectionTitle(doc, title, y)
  }

  startSection("Executive Summary")
  y = addParagraph(doc, `Compliance Score: ${input.report.complianceScore}`, y)
  y = addParagraph(doc, `Risk Score: ${input.report.riskScore} (${input.report.riskLevel})`, y)
  y = addParagraph(
    doc,
    `Top gaps: ${input.report.topGaps.map((gap) => gap.title).join(", ") || "None"}.`,
    y
  )
  y = addParagraph(
    doc,
    `Recommended actions: ${input.report.recommendedActions.join(", ") || "None"}.`,
    y
  )

  startSection("Compliance Score History")
  if (input.complianceHistory.length === 0) {
    y = addParagraph(doc, "No assessment history available.", y)
  } else {
    input.complianceHistory.forEach((point) => {
      y = ensureSpace(doc, y)
      y = addParagraph(doc, `${formatDate(point.date)} — Score ${point.score}`, y)
    })
  }

  startSection("Policy Inventory")
  if (input.policies.length === 0) {
    y = addParagraph(doc, "No policy instances recorded.", y)
  } else {
    input.policies.forEach((policy) => {
      y = ensureSpace(doc, y)
      y = addParagraph(
        doc,
        `${policy.title} (${policy.category}) — ${policy.status} · Reviewed ${formatDate(
          policy.lastReviewed
        )}`,
        y
      )
    })
  }

  startSection("Risk Register")
  if (input.risks.length === 0) {
    y = addParagraph(doc, "No open risks recorded.", y)
  } else {
    input.risks.forEach((risk) => {
      y = ensureSpace(doc, y)
      y = addParagraph(
        doc,
        `${risk.title} — ${risk.severity} · ${risk.status} · Logged ${formatDate(
          risk.createdAt
        )}`,
        y
      )
      if (risk.actions.length) {
        risk.actions.forEach((action) => {
          y = ensureSpace(doc, y)
          y = addParagraph(
            doc,
            `• ${action.action} (${action.status}${action.dueDate ? `, due ${action.dueDate}` : ""})`,
            y
          )
        })
      }
    })
  }

  startSection("Training Completion Records")
  y = addParagraph(
    doc,
    `Total completions: ${input.training.summary.totalCompletions} · Average score: ${input.training.summary.averageScore}%`,
    y
  )
  input.training.records.forEach((record) => {
    y = ensureSpace(doc, y)
    y = addParagraph(
      doc,
      `${record.module} — ${record.completedAt ? formatDate(record.completedAt) : "Not completed"} · Score ${
        record.score ?? "-"
      }`,
      y
    )
  })

  startSection("Incident Log")
  if (input.incidents.length === 0) {
    y = addParagraph(doc, "No incidents logged.", y)
  } else {
    input.incidents.forEach((incident) => {
      y = ensureSpace(doc, y)
      y = addParagraph(
        doc,
        `${incident.title} — ${incident.severity} · ${incident.status} · ${formatDate(
          incident.createdAt
        )}`,
        y
      )
    })
  }

  startSection("Vendor Agreements")
  if (input.vendors.length === 0) {
    y = addParagraph(doc, "No vendors recorded.", y)
  } else {
    input.vendors.forEach((vendor) => {
      y = ensureSpace(doc, y)
      y = addParagraph(
        doc,
        `${vendor.name} — status ${vendor.status} · BAA ${vendor.baaStatus ?? "n/a"} · Assessment ${
          vendor.assessmentStatus ?? "n/a"
        }`,
        y
      )
    })
  }

  startSection("Evidence Index")
  if (input.evidence.length === 0) {
    y = addParagraph(doc, "No evidence uploaded.", y)
  } else {
    input.evidence.forEach((item) => {
      y = ensureSpace(doc, y)
      y = addParagraph(doc, `${item.fileName} (${item.category})`, y)
    })
  }

  doc.setPage(tocPage)
  let tocY = 30
  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  sections.forEach((section) => {
    doc.text(`${section.title} ....... ${section.page}`, marginX, tocY)
    tocY += lineHeight
    if (tocY > pageHeight - 10) {
      doc.addPage()
      tocY = 20
    }
  })

  const totalPages = doc.getNumberOfPages()
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page)
    doc.setFontSize(9)
    doc.setTextColor(120)
    doc.text(`Page ${page} of ${totalPages}`, 180, 290)
    doc.setTextColor(0)
  }

  const fileName = `hipaa-audit-package-${new Date().toISOString().slice(0, 10)}.pdf`
  return { blob: doc.output("blob"), fileName }
}
