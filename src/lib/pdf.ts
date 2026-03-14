import { jsPDF } from "jspdf"
import type { EvidenceItem, ReportSummary } from "@/types/compliance"

const marginX = 18
const lineHeight = 6

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

export function downloadRiskSnapshotPdf({
  orgName,
  orgType,
  report,
  evidence,
}: {
  orgName: string
  orgType: string
  report: ReportSummary
  evidence: EvidenceItem[]
}) {
  const doc = new jsPDF()
  let y = 20

  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text("HIPAA Risk Snapshot", marginX, y)
  y += lineHeight + 2

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`${orgName || "Organization"} · ${orgType}`, marginX, y)
  y += lineHeight + 4

  y = addSectionTitle(doc, "Summary", y)
  y = addParagraph(doc, `Compliance Score: ${report.complianceScore}`, y)
  y = addParagraph(doc, `Risk Score: ${report.riskScore} (${report.riskLevel})`, y)
  y += 2

  y = addSectionTitle(doc, "Top Policy Gaps", y)
  report.topGaps.forEach((gap) => {
    y = addParagraph(doc, `${gap.title}: ${gap.description}`, y)
  })
  y += 2

  y = addSectionTitle(doc, "Recommended Actions", y)
  report.recommendedActions.forEach((action) => {
    y = addParagraph(doc, `• ${action}`, y)
  })
  y += 2

  y = addSectionTitle(doc, "Evidence Index", y)
  if (evidence.length === 0) {
    y = addParagraph(doc, "No evidence uploaded.", y)
  } else {
    evidence.forEach((item) => {
      y = addParagraph(doc, `${item.fileName} (${item.category})`, y)
    })
  }

  doc.save("hipaa-risk-snapshot.pdf")
}
