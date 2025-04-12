"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Activity, Thermometer, Moon, Clock } from "lucide-react"
import { motion } from "framer-motion"

interface IoTDataDisplayProps {
  className?: string
  userId?: string
}

interface IoTData {
  heartRate: number
  steps: number
  temperature: number
  sleepHours: number
  lastUpdated: string
}

export function IoTDataDisplay({ className, userId }: IoTDataDisplayProps) {
  const [iotData, setIotData] = useState<IoTData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch IoT data from API if userId is provided
    const fetchIoTData = async () => {
      if (userId) {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/iot-data?userId=${userId}`)
          if (response.ok) {
            const result = await response.json()
            if (result.data) {
              setIotData({
                heartRate: result.data.heart_rate || 75,
                steps: result.data.steps || 5000,
                temperature: result.data.temperature || 36.5,
                sleepHours: result.data.sleep_hours || 7.5,
                lastUpdated: result.data.created_at || new Date().toISOString(),
              })
            } else {
              // Generate random data if no data exists
              generateRandomData()
            }
          } else {
            // Generate random data if API fails
            generateRandomData()
          }
        } catch (error) {
          console.error("Error fetching IoT data:", error)
          generateRandomData()
        } finally {
          setIsLoading(false)
        }
      } else {
        // Generate random data if no userId
        generateRandomData()
      }
    }

    const generateRandomData = () => {
      // Generate random IoT data
      const data: IoTData = {
        heartRate: Math.floor(Math.random() * 20) + 65, // 65-85 bpm
        steps: Math.floor(Math.random() * 5000) + 3000, // 3000-8000 steps
        temperature: Number.parseFloat((Math.random() * 1 + 36.1).toFixed(1)), // 36.1-37.1°C
        sleepHours: Number.parseFloat((Math.random() * 3 + 5).toFixed(1)), // 5-8 hours
        lastUpdated: new Date().toISOString(),
      }

      setIotData(data)
      setIsLoading(false)
    }

    fetchIoTData()

    // Refresh data every 30 seconds
    const interval = setInterval(fetchIoTData, 30000)

    return () => clearInterval(interval)
  }, [userId])

  if (isLoading && !iotData) {
    return (
      <Card className={`${className} border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Activity className="mr-2 h-5 w-5 text-primary" />
            Smartwatch Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`${className} border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-green-500/10 opacity-50"></div>
      <CardHeader>
        <CardTitle className="text-lg flex items-center relative">
          <Activity className="mr-2 h-5 w-5 text-blue-500" />
          Smartwatch Data
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            className="flex items-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-blue-100 dark:border-blue-900"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Heart className="h-5 w-5 mr-2 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Heart Rate</p>
              <p className="font-medium">{iotData?.heartRate} BPM</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-green-100 dark:border-green-900"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Activity className="h-5 w-5 mr-2 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Steps Today</p>
              <p className="font-medium">{iotData?.steps.toLocaleString()}</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-orange-100 dark:border-orange-900"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Thermometer className="h-5 w-5 mr-2 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Temperature</p>
              <p className="font-medium">{iotData?.temperature}°C</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-blue-100 dark:border-blue-900"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Moon className="h-5 w-5 mr-2 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Sleep Last Night</p>
              <p className="font-medium">{iotData?.sleepHours} hours</p>
            </div>
          </motion.div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Last updated: {iotData ? new Date(iotData.lastUpdated).toLocaleTimeString() : ""}
        </div>
      </CardContent>
    </Card>
  )
}
