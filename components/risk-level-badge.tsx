import { Badge } from "@/components/ui/badge"

type RiskLevelBadgeProps = {
  level: "Low" | "Medium" | "High" | "Seek immediate medical attention" | string
  className?: string
}

export function RiskLevelBadge({ level, className }: RiskLevelBadgeProps) {
  // Get risk level color based on severity
  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20"
      case "Medium":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20"
      case "High":
        return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20"
      case "Seek immediate medical attention":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
      default:
        return "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
    }
  }

  return (
    <Badge className={`${getRiskLevelColor(level)} ${className} px-3 py-1 text-sm font-medium border`}>
      Risk Level: {level}
    </Badge>
  )
}
