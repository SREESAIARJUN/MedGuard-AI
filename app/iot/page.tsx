"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WellnessOMeter } from "@/components/wellness-o-meter"
import { MedicalDisclaimer } from "@/components/medical-disclaimer"
import { Heart, Activity, Thermometer, Moon, Clock, Battery, Droplet, Utensils } from "lucide-react"
import { motion } from "framer-motion"

interface IoTDataPoint {
  timestamp: string
  value: number
}

interface IoTData {
  heartRate: {
    current: number
    history: IoTDataPoint[]
  }
  steps: {
    current: number
    goal: number
    history: IoTDataPoint[]
  }
  temperature: {
    current: number
    history: IoTDataPoint[]
  }
  sleep: {
    lastNight: number
    history: IoTDataPoint[]
  }
  bloodOxygen: {
    current: number
    history: IoTDataPoint[]
  }
  hydration: {
    current: number
    goal: number
  }
  calories: {
    consumed: number
    burned: number
    goal: number
  }
  batteryLevel: number
  wellnessScore: number
  lastUpdated: string
}

export default function IoTPage() {
  const [iotData, setIotData] = useState<IoTData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // Simulate fetching IoT data
    const fetchIoTData = () => {
      setIsLoading(true)

      // Simulate API delay
      setTimeout(() => {
        // Generate random IoT data with history
        const generateHistory = (min: number, max: number, count: number): IoTDataPoint[] => {
          return Array.from({ length: count }, (_, i) => {
            const date = new Date()
            date.setHours(date.getHours() - (count - i))

            return {
              timestamp: date.toISOString(),
              value: Math.floor(Math.random() * (max - min)) + min,
            }
          })
        }

        const data: IoTData = {
          heartRate: {
            current: Math.floor(Math.random() * 20) + 65, // 65-85 bpm
            history: generateHistory(60, 90, 24),
          },
          steps: {
            current: Math.floor(Math.random() * 5000) + 3000, // 3000-8000 steps
            goal: 10000,
            history: generateHistory(0, 1000, 24),
          },
          temperature: {
            current: Number.parseFloat((Math.random() * 1 + 36.1).toFixed(1)), // 36.1-37.1°C
            history: generateHistory(36, 37.2, 24).map((point) => ({
              ...point,
              value: Number.parseFloat(point.value.toFixed(1)),
            })),
          },
          sleep: {
            lastNight: Number.parseFloat((Math.random() * 3 + 5).toFixed(1)), // 5-8 hours
            history: generateHistory(4, 9, 7).map((point) => ({
              ...point,
              value: Number.parseFloat(point.value.toFixed(1)),
            })),
          },
          bloodOxygen: {
            current: Math.floor(Math.random() * 3) + 96, // 96-99%
            history: generateHistory(95, 100, 24),
          },
          hydration: {
            current: Math.floor(Math.random() * 1500) + 500, // 500-2000ml
            goal: 2500,
          },
          calories: {
            consumed: Math.floor(Math.random() * 1000) + 1000, // 1000-2000 calories
            burned: Math.floor(Math.random() * 500) + 300, // 300-800 calories
            goal: 2200,
          },
          batteryLevel: Math.floor(Math.random() * 50) + 50, // 50-100%
          wellnessScore: Math.floor(Math.random() * 30) + 70, // 70-100
          lastUpdated: new Date().toISOString(),
        }

        setIotData(data)
        setIsLoading(false)
      }, 1500)
    }

    fetchIoTData()

    // Refresh data every 30 seconds
    const interval = setInterval(fetchIoTData, 30000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading && !iotData) {
    return (
      <div className="flex flex-col min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">IoT Health Data</h1>

        <Card className="flex items-center justify-center h-64 border-2">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
            <p>Loading health data...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">IoT Health Data</h1>

        {iotData && (
          <div className="mt-4 md:mt-0 flex items-center">
            <div className="text-xs text-muted-foreground mr-4 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Last updated: {new Date(iotData.lastUpdated).toLocaleTimeString()}
            </div>
            <div className="flex items-center text-xs">
              <Battery className="h-3 w-3 mr-1 text-green-500" />
              <span>{iotData.batteryLevel}%</span>
            </div>
          </div>
        )}
      </div>

      {iotData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 bg-card/50 backdrop-blur-sm col-span-2">
              <CardHeader>
                <CardTitle className="text-xl">Health Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div
                    className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Heart className="h-8 w-8 mb-2 text-red-500" />
                    <p className="text-sm text-muted-foreground">Heart Rate</p>
                    <p className="text-xl font-medium">{iotData.heartRate.current} BPM</p>
                  </motion.div>

                  <motion.div
                    className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Activity className="h-8 w-8 mb-2 text-green-500" />
                    <p className="text-sm text-muted-foreground">Steps</p>
                    <p className="text-xl font-medium">{iotData.steps.current.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Goal: {iotData.steps.goal.toLocaleString()}</p>
                  </motion.div>

                  <motion.div
                    className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Thermometer className="h-8 w-8 mb-2 text-orange-500" />
                    <p className="text-sm text-muted-foreground">Temperature</p>
                    <p className="text-xl font-medium">{iotData.temperature.current}°C</p>
                  </motion.div>

                  <motion.div
                    className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Moon className="h-8 w-8 mb-2 text-blue-500" />
                    <p className="text-sm text-muted-foreground">Sleep</p>
                    <p className="text-xl font-medium">{iotData.sleep.lastNight} hrs</p>
                  </motion.div>

                  <motion.div
                    className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Droplet className="h-8 w-8 mb-2 text-blue-400" />
                    <p className="text-sm text-muted-foreground">Hydration</p>
                    <p className="text-xl font-medium">{iotData.hydration.current} ml</p>
                    <p className="text-xs text-muted-foreground">Goal: {iotData.hydration.goal} ml</p>
                  </motion.div>

                  <motion.div
                    className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Utensils className="h-8 w-8 mb-2 text-purple-500" />
                    <p className="text-sm text-muted-foreground">Calories</p>
                    <div className="flex gap-1 text-xl font-medium">
                      <span className="text-green-500">{iotData.calories.consumed}</span>
                      <span>/</span>
                      <span className="text-red-500">{iotData.calories.burned}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Goal: {iotData.calories.goal}</p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Wellness Score</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <WellnessOMeter score={iotData.wellnessScore} size="lg" showLabel />
                <p className="mt-4 text-sm text-muted-foreground text-center">
                  Your wellness score is calculated based on your activity, sleep, and vital signs.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Detailed Health Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="heart">Heart Rate</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="sleep">Sleep</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <p className="text-muted-foreground">
                    Your health data is collected from your connected smartwatch and other IoT devices. This data is
                    used to calculate your wellness score and provide personalized health insights.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Today's Activity</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Steps</span>
                          <span className="font-medium">
                            {iotData.steps.current.toLocaleString()} / {iotData.steps.goal.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{ width: `${Math.min(100, (iotData.steps.current / iotData.steps.goal) * 100)}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between mt-4">
                          <span className="text-muted-foreground">Hydration</span>
                          <span className="font-medium">
                            {iotData.hydration.current} / {iotData.hydration.goal} ml
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className="bg-blue-400 h-2.5 rounded-full"
                            style={{
                              width: `${Math.min(100, (iotData.hydration.current / iotData.hydration.goal) * 100)}%`,
                            }}
                          ></div>
                        </div>

                        <div className="flex justify-between mt-4">
                          <span className="text-muted-foreground">Calories</span>
                          <span className="font-medium">
                            {iotData.calories.consumed} / {iotData.calories.goal}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className="bg-purple-500 h-2.5 rounded-full"
                            style={{
                              width: `${Math.min(100, (iotData.calories.consumed / iotData.calories.goal) * 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Vital Signs</h3>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Heart className="h-5 w-5 mr-2 text-red-500" />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Heart Rate</p>
                            <p className="font-medium">{iotData.heartRate.current} BPM</p>
                          </div>
                          <div className="text-xs text-muted-foreground">Normal</div>
                        </div>

                        <div className="flex items-center">
                          <Thermometer className="h-5 w-5 mr-2 text-orange-500" />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Temperature</p>
                            <p className="font-medium">{iotData.temperature.current}°C</p>
                          </div>
                          <div className="text-xs text-muted-foreground">Normal</div>
                        </div>

                        <div className="flex items-center">
                          <Droplet className="h-5 w-5 mr-2 text-blue-400" />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Blood Oxygen</p>
                            <p className="font-medium">{iotData.bloodOxygen.current}%</p>
                          </div>
                          <div className="text-xs text-muted-foreground">Normal</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="heart">
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Heart rate chart would be displayed here</p>
                  </div>
                </TabsContent>

                <TabsContent value="activity">
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Activity chart would be displayed here</p>
                  </div>
                </TabsContent>

                <TabsContent value="sleep">
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Sleep chart would be displayed here</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      <MedicalDisclaimer className="mt-8" />
    </div>
  )
}
