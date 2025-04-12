import { AlertCircle } from "lucide-react"

interface MedicalDisclaimerProps {
  className?: string
}

export function MedicalDisclaimer({ className }: MedicalDisclaimerProps) {
  return (
    <div className={`text-sm text-muted-foreground text-center p-4 bg-muted rounded-lg glass ${className}`}>
      <div className="flex items-center justify-center mb-2">
        <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
        <p className="font-medium">Medical Disclaimer</p>
      </div>
      <p>
        This AI assistant provides information for educational purposes only. It is not a substitute for professional
        medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health
        provider with any questions you may have regarding a medical condition.
      </p>
    </div>
  )
}
