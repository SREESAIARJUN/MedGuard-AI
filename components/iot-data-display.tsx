"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Activity, Thermometer, Moon, Clock } from "lucide-react"

interface IoTDataDisplayProps {
  className?: string
}

interface IoTData {
  heartRate: number
  steps: number
  temperature: number
  sleepHours: number
  lastUpdated: string
}

export function IoTDataDisplay({ className }: IoTDataDisplayProps) {
  const [iotData, setIotData] = useState<IoTData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching IoT data
    const fetchIoTData = () => {
      setIsLoading(true)

      // Simulate API delay
      setTimeout(() => {
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
      }, 1500)
    }

    fetchIoTData()

    // Refresh data every 30 seconds
    const interval = setInterval(fetchIoTData, 30000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading && !iotData) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="text-lg">Smartwatch Data</CardTitle>
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
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Activity className="mr-2 h-5 w-5 text-primary" />
          Smartwatch Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Heart Rate</p>
              <p className="font-medium">{iotData?.heartRate} BPM</p>
            </div>
          </div>

          <div className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Steps Today</p>
              <p className="font-medium">{iotData?.steps.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center">
            <Thermometer className="h-5 w-5 mr-2 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Temperature</p>
              <p className="font-medium">{iotData?.temperature}°C</p>
            </div>
          </div>

          <div className="flex items-center">
            <Moon className="h-5 w-5 mr-2 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Sleep Last Night</p>
              <p className="font-medium">{iotData?.sleepHours} hours</p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Last updated: {iotData ? new Date(iotData.lastUpdated).toLocaleTimeString() : ""}
        </div>
      </CardContent>
    </Card>
  )
}
