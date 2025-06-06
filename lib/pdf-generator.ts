import { jsPDF } from "jspdf"

type DiagnosisData = {
  diagnosis: string
  causes?: string[]
  possibleCauses?: string[] // Support both formats
  suggestions: string[]
  risk_level?: string
  riskLevel?: string // Support both formats
  followup_needed?: boolean
  additional_notes?: string
  summary?: string // Support both formats
  wellness_score?: number
}

export const generateHealthPDF = (diagnosisData: DiagnosisData) => {
  // Create a new PDF document
  const doc = new jsPDF()

  // Normalize data to handle different formats
  const diagnosis = diagnosisData.diagnosis || "Undetermined"
  const causes = diagnosisData.causes || diagnosisData.possibleCauses || []
  const suggestions = diagnosisData.suggestions || []
  const riskLevel = diagnosisData.risk_level || diagnosisData.riskLevel || "Undetermined"
  const additionalNotes = diagnosisData.additional_notes || diagnosisData.summary || ""
  const wellnessScore = diagnosisData.wellness_score || 0

  // Add title
  doc.setFontSize(22)
  doc.setTextColor(41, 98, 255) // Primary color
  doc.text("MedGuardAI Health Report", 105, 20, { align: "center" })

  // Add date
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: "center" })

  // Add diagnosis
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text("Diagnosis", 20, 45)

  doc.setFontSize(12)
  doc.text(diagnosis, 20, 55)

  // Add risk level
  doc.setFontSize(14)
  doc.text("Risk Level:", 20, 70)

  // Set color based on risk level
  let riskColor
  switch (riskLevel) {
    case "Low":
      riskColor = [39, 174, 96] // Green
      break
    case "Medium":
      riskColor = [241, 196, 15] // Yellow
      break
    case "High":
      riskColor = [231, 76, 60] // Red
      break
    default:
      riskColor = [149, 165, 166] // Gray
  }

  doc.setTextColor(riskColor[0], riskColor[1], riskColor[2])
  doc.setFontSize(12)
  doc.text(riskLevel, 70, 70)

  // Reset text color
  doc.setTextColor(0, 0, 0)

  // Add wellness score if available
  if (wellnessScore) {
    doc.setFontSize(14)
    doc.text("Wellness Score:", 120, 70)

    // Set color based on wellness score
    let scoreColor
    if (wellnessScore >= 80) {
      scoreColor = [39, 174, 96] // Green
    } else if (wellnessScore >= 60) {
      scoreColor = [241, 196, 15] // Yellow
    } else if (wellnessScore >= 40) {
      scoreColor = [230, 126, 34] // Orange
    } else {
      scoreColor = [231, 76, 60] // Red
    }

    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2])
    doc.setFontSize(12)
    doc.text(`${wellnessScore}/100`, 170, 70)

    // Reset text color
    doc.setTextColor(0, 0, 0)
  }

  // Add causes
  doc.setFontSize(14)
  doc.text("Possible Causes:", 20, 85)

  doc.setFontSize(12)
  let yPos = 95
  causes.forEach((cause, index) => {
    doc.text(`• ${cause}`, 25, yPos)
    yPos += 7
  })

  // Add suggestions
  doc.setFontSize(14)
  doc.text("Recommendations:", 20, yPos + 10)

  doc.setFontSize(12)
  yPos += 20
  suggestions.forEach((suggestion, index) => {
    doc.text(`• ${suggestion}`, 25, yPos)
    yPos += 7
  })

  // Add follow-up needed if available
  if (diagnosisData.followup_needed !== undefined) {
    doc.setFontSize(14)
    doc.text("Follow-up Needed:", 20, yPos + 10)

    doc.setFontSize(12)
    doc.text(diagnosisData.followup_needed ? "Yes" : "No", 90, yPos + 10)
    yPos += 10
  }

  // Add additional notes
  if (additionalNotes) {
    doc.setFontSize(14)
    doc.text("Additional Notes:", 20, yPos + 15)

    doc.setFontSize(12)

    // Split long text into multiple lines
    const splitText = doc.splitTextToSize(additionalNotes, 170)
    doc.text(splitText, 20, yPos + 25)
  }

  // Add disclaimer
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(
    "DISCLAIMER: This report is generated by an AI system and is for informational purposes only. " +
      "It is not a substitute for professional medical advice, diagnosis, or treatment. " +
      "Always seek the advice of your physician or other qualified health provider with any questions " +
      "you may have regarding a medical condition.",
    105,
    280,
    { align: "center", maxWidth: 180 },
  )

  // Return the PDF as a data URL
  return doc.output("dataurlstring")
}
