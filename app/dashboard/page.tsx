"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { getClientSupabaseClient } from "@/lib/supabase"
import { WellnessOMeter } from "@/components/wellness-o-meter"
import { IoTDataDisplay } from "@/components/iot-data-display"
import Link from "next/link"
import { FileText, Plus, Activity, Calendar } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const [recordCount, setRecordCount] = useState(0)
  const [latestRecord, setLatestRecord] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getClientSupabaseClient()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setIsLoading(true)

        // Get user profile from database
        const { data: userProfile } = await supabase.from("users").select("*").eq("email", user.email).single()

        if (userProfile) {
          // Get record count
          const { count } = await supabase
            .from("health_records")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userProfile.id)

          setRecordCount(count || 0)

          // Get latest record
          const { data: records } = await supabase
            .from("health_records")
            .select("*")
            .eq("user_id", userProfile.id)
            .order("created_at", { ascending: false })
            .limit(1)

          if (records && records.length > 0) {
            setLatestRecord(records[0])
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, supabase])

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Health Records</CardTitle>
                  <CardDescription>Your medical history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">{recordCount}</div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/records">
                      <FileText className="mr-2 h-4 w-4" />
                      View Records
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Wellness Score</CardTitle>
                  <CardDescription>Your health status</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <WellnessOMeter score={latestRecord?.wellness_score || 75} size="sm" />
                  <Button asChild variant="outline" className="w-full mt-4">
                    <Link href="/wellness">
                      <Activity className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>Common tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button asChild variant="default" className="w-full">
                    <Link href="/chat">
                      <Plus className="mr-2 h-4 w-4" />
                      New Health Analysis
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/mint">
                      <Calendar className="mr-2 h-4 w-4" />
                      Mint Health NFT
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <IoTDataDisplay />

            {latestRecord && (
              <Card className="border-2 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Latest Health Record</CardTitle>
                  <CardDescription>Created on {new Date(latestRecord.created_at).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold">{latestRecord.title}</h3>
                    <p className="text-muted-foreground">{latestRecord.diagnosis}</p>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/records/${latestRecord.id}`}>
                      <FileText className="mr-2 h-4 w-4" />
                      View Full Record
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
