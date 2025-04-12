"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface WellnessOMeterProps {
  score: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

export function WellnessOMeter({ score, size = "md", showLabel = false, className }: WellnessOMeterProps) {
  const [rotation, setRotation] = useState(0)

  // Calculate size based on prop
  const getSize = () => {
    switch (size) {
      case "sm":
        return "h-24 w-24"
      case "lg":
        return "h-48 w-48"
      default:
        return "h-32 w-32"
    }
  }

  // Calculate text size based on meter size
  const getTextSize = () => {
    switch (size) {
      case "sm":
        return "text-lg"
      case "lg":
        return "text-3xl"
      default:
        return "text-2xl"
    }
  }

  // Calculate label size based on meter size
  const getLabelSize = () => {
    switch (size) {
      case "sm":
        return "text-xs"
      case "lg":
        return "text-base"
      default:
        return "text-sm"
    }
  }

  // Calculate needle rotation based on score (0-100)
  // 0 = -90deg, 100 = 90deg
  useEffect(() => {
    const clampedScore = Math.max(0, Math.min(100, score))
    const newRotation = -90 + clampedScore * 1.8 // 180 degree range
    setRotation(newRotation)
  }, [score])

  // Get color based on score
  const getScoreColor = () => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    if (score >= 40) return "text-orange-500"
    return "text-red-500"
  }

  // Get label based on score
  const getScoreLabel = () => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    if (score >= 20) return "Poor"
    return "Critical"
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className={cn("wellness-meter relative", getSize())}>
        <div className="wellness-meter-bg"></div>
        <div className="wellness-meter-needle" style={{ "--rotation": `${rotation}deg` } as React.CSSProperties}></div>
        <div className="wellness-meter-inner">
          <span className={cn("font-bold", getScoreColor(), getTextSize())}>{score}</span>
          {showLabel && <span className={cn("text-muted-foreground", getLabelSize())}>{getScoreLabel()}</span>}
        </div>
      </div>
      {showLabel && <p className="mt-2 text-center text-muted-foreground text-sm">Wellness Score</p>}
    </div>
  )
}
