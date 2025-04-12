"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WellnessOMeter } from "@/components/wellness-o-meter"
import { MedicalDisclaimer } from "@/components/medical-disclaimer"
import { PDFDownloadButton } from "@/components/pdf-download-button"
import { IoTDataDisplay } from "@/components/iot-data-display"
import { Sparkles, ArrowRight, ArrowUp, ArrowDown, Zap, Calendar } from "lucide-react"
import { motion } from "framer-motion"

interface WellnessData {
  score: number
  previousScore: number
  insights: {
    title: string
    description: string
    type: "positive" | "negative" | "neutral"
  }[]
  recommendations: string[]
  diagnosisData: any
}

export default function WellnessPage() {
  const [wellnessData, setWellnessData] = useState<WellnessData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching wellness data
    const fetchWellnessData = async () => {
      setIsLoading(true)

      // Try to get diagnosis data from session storage
      let diagnosisData = null
      try {
        const storedData = sessionStorage.getItem("diagnosisData")
        if (storedData) {
          diagnosisData = JSON.parse(storedData)
        }
      } catch (error) {
        console.error("Error retrieving diagnosis data:", error)
      }

      // Simulate API delay
      setTimeout(() => {
        // Generate random wellness data
        const score = diagnosisData?.wellness_score || Math.floor(Math.random() * 30) + 70 // 70-100
        const previousScore = score - (Math.floor(Math.random() * 10) - 5) // +/- 5 points

        const data: WellnessData = {
          score,
          previousScore,
          insights: [
            {
              title: "Sleep quality has improved",
              description: "Your average sleep duration has increased by 0.8 hours compared to last week.",
              type: "positive",
            },
            {
              title: "Heart rate variability is optimal",
              description: "Your heart rate variability indicates good cardiovascular health and stress management.",
              type: "positive",
            },
            {
              title: "Step count below target",
              description: "You've achieved only 65% of your daily step goal on average this week.",
              type: "negative",
            },
            {
              title: "Hydration levels are consistent",
              description: "You've maintained consistent hydration levels throughout the week.",
              type: "neutral",
            },
          ],
          recommendations: [
            "Try to increase your daily step count by taking short walks during breaks",
            "Maintain your current sleep schedule to continue the positive trend",
            "Consider adding 10 minutes of meditation to your daily routine to further improve stress levels",
            "Continue tracking your water intake to maintain optimal hydration",
          ],
          diagnosisData,
        }

        setWellnessData(data)
        setIsLoading(false)
      }, 1500)
    }

    fetchWellnessData()
  }, [])

  if (isLoading && !wellnessData) {
    return (
      <div className="flex flex-col min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Wellness Dashboard</h1>

        <Card className="flex items-center justify-center h-64 border-2">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
            <p>Loading wellness data...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Wellness Dashboard</h1>

      {wellnessData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Wellness Score</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <WellnessOMeter score={wellnessData.score} size="lg" showLabel />

                <div className="mt-4 flex items-center">
                  {wellnessData.score > wellnessData.previousScore ? (
                    <>
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-500 text-sm">
                        +{(wellnessData.score - wellnessData.previousScore).toFixed(1)} from last week
                      </span>
                    </>
                  ) : wellnessData.score < wellnessData.previousScore ? (
                    <>
                      <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-red-500 text-sm">
                        {(wellnessData.score - wellnessData.previousScore).toFixed(1)} from last week
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-yellow-500 text-sm">No change from last week</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 bg-card/50 backdrop-blur-sm col-span-2">
              <CardHeader>
                <CardTitle className="text-xl">Health Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wellnessData.insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 border rounded-lg"
                    >
                      <div className="flex items-start">
                        <div
                          className={`
                          rounded-full p-1 mr-3 
                          ${
                            insight.type === "positive"
                              ? "bg-green-100 text-green-500"
                              : insight.type === "negative"
                                ? "bg-red-100 text-red-500"
                                : "bg-yellow-100 text-yellow-500"
                          }
                        `}
                        >
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-medium">{insight.title}</h3>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {wellnessData.recommendations.map((recommendation, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start"
                    >
                      <Zap className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span>{recommendation}</span>
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-6">
                  <Button className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Health Check-up
                  </Button>
                </div>
              </CardContent>
            </Card>

            <IoTDataDisplay />
          </div>

          {wellnessData.diagnosisData && (
            <Card className="border-2 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Health Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Generate a comprehensive PDF report of your health analysis that you can share with healthcare
                  providers.
                </p>

                <PDFDownloadButton diagnosisData={wellnessData.diagnosisData} className="w-full" />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <MedicalDisclaimer className="mt-8" />
    </div>
  )
}
