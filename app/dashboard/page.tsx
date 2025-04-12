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
import { FileText, Plus, Activity, Calendar, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

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

        // Get record count for the authenticated user
        const { count } = await supabase
          .from("health_records")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        setRecordCount(count || 0)

        // Get latest record for the authenticated user
        const { data: records } = await supabase
          .from("health_records")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)

        if (records && records.length > 0) {
          setLatestRecord(records[0])
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="gradient-blob top-0 left-0 opacity-20 bg-blue-400 dark:bg-blue-600"></div>
          <div className="gradient-blob bottom-0 right-0 opacity-20 bg-purple-400 dark:bg-purple-600"></div>
        </div>

        <div className="relative flex flex-col p-4 md:p-8 max-w-5xl mx-auto">
          <motion.h1
            className="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-transparent bg-clip-text"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Welcome, {user?.email?.split("@")[0] || "User"}
          </motion.h1>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-50"></div>
                    <CardHeader className="pb-2 relative">
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                        Health Records
                      </CardTitle>
                      <CardDescription>Your medical history</CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                        {recordCount}
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 border-indigo-200 dark:border-indigo-800"
                      >
                        <Link href="/records">
                          <FileText className="mr-2 h-4 w-4 text-indigo-500" />
                          View Records
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-50"></div>
                    <CardHeader className="pb-2 relative">
                      <CardTitle className="text-lg flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                        Wellness Score
                      </CardTitle>
                      <CardDescription>Your health status</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center relative">
                      <WellnessOMeter score={latestRecord?.wellness_score || 75} size="sm" />
                      <Button
                        asChild
                        variant="outline"
                        className="w-full mt-4 bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 border-purple-200 dark:border-purple-800"
                      >
                        <Link href="/wellness">
                          <Activity className="mr-2 h-4 w-4 text-purple-500" />
                          View Details
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-indigo-500/10 opacity-50"></div>
                    <CardHeader className="pb-2 relative">
                      <CardTitle className="text-lg flex items-center">
                        <Plus className="w-5 h-5 mr-2 text-pink-500" />
                        Quick Actions
                      </CardTitle>
                      <CardDescription>Common tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 relative">
                      <Button
                        asChild
                        variant="default"
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-0"
                      >
                        <Link href="/chat">
                          <Plus className="mr-2 h-4 w-4" />
                          New Health Analysis
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 border-pink-200 dark:border-pink-800"
                      >
                        <Link href="/mint">
                          <Calendar className="mr-2 h-4 w-4 text-pink-500" />
                          Mint Health NFT
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <IoTDataDisplay userId={user?.id} />
              </motion.div>

              {latestRecord && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-50"></div>
                    <CardHeader className="relative">
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                        Latest Health Record
                      </CardTitle>
                      <CardDescription>
                        Created on {new Date(latestRecord.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 relative">
                      <div>
                        <h3 className="font-semibold">{latestRecord.title}</h3>
                        <p className="text-muted-foreground">{latestRecord.diagnosis}</p>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 border-indigo-200 dark:border-indigo-800"
                      >
                        <Link href={`/records/${latestRecord.id}`}>
                          <FileText className="mr-2 h-4 w-4 text-indigo-500" />
                          View Full Record
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
