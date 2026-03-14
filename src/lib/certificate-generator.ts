import { jsPDF } from "jspdf"

export type CertificatePayload = {
  employeeName: string
  moduleTitle: string
  completionDate: string
  score: number
  organizationName: string
}

export function createCertificatePdf({
  employeeName,
  moduleTitle,
  completionDate,
  score,
  organizationName,
}: CertificatePayload) {
  const certificateId = crypto.randomUUID()
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" })
  const width = doc.internal.pageSize.getWidth()
  const height = doc.internal.pageSize.getHeight()

  doc.setDrawColor(14, 116, 144)
  doc.setLineWidth(3)
  doc.rect(24, 24, width - 48, height - 48)

  doc.setFillColor(236, 254, 255)
  doc.rect(24, 24, width - 48, 90, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(28)
  doc.text("HIPAA Training Certificate", width / 2, 70, { align: "center" })

  doc.setDrawColor(148, 163, 184)
  doc.setLineWidth(1)
  doc.rect(width / 2 - 70, 118, 140, 38)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text("Organization Logo", width / 2, 141, { align: "center" })

  doc.setTextColor(15, 23, 42)
  doc.setFontSize(14)
  doc.text("This certifies that", width / 2, 190, { align: "center" })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(30)
  doc.text(employeeName || "Employee", width / 2, 235, { align: "center" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(13)
  doc.text("has successfully completed", width / 2, 265, { align: "center" })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text(moduleTitle, width / 2, 300, { align: "center" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(12)
  doc.text(`Score achieved: ${score}%`, width / 2, 330, { align: "center" })

  doc.setFontSize(11)
  doc.text(`Completion date: ${completionDate}`, width / 2, 355, { align: "center" })
  doc.text(`Organization: ${organizationName}`, width / 2, 375, { align: "center" })

  doc.setFontSize(10)
  doc.setTextColor(71, 85, 105)
  doc.text(`Certificate ID: ${certificateId}`, width / 2, height - 60, {
    align: "center",
  })

  const fileName = `hipaa-training-certificate-${certificateId}.pdf`
  const blob = doc.output("blob")

  return {
    certificateId,
    fileName,
    blob,
  }
}
