"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { FileText, ExternalLink, Plus, AlertCircle, Download, Loader2, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { getClientSupabaseClient } from "@/lib/supabase"
import type { HealthRecord } from "@/types/database"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { motion } from "framer-motion"

export default function RecordsPage() {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const supabase = getClientSupabaseClient()

  // Fetch records from database
  useEffect(() => {
    const fetchRecords = async () => {
      if (!user) return

      setIsLoading(true)
      setErrorMessage(null)

      try {
        // Fetch records for the authenticated user
        const { data, error } = await supabase
          .from("health_records")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        setRecords(data || [])
      } catch (error) {
        console.error("Error fetching records:", error)
        setErrorMessage("Could not fetch health records. Please try again.")

        toast({
          title: "Error",
          description: "Failed to load health records.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecords()
  }, [user, toast, supabase])

  // Open view dialog
  const openViewDialog = (record: HealthRecord) => {
    setSelectedRecord(record)
    setShowViewDialog(true)
  }

  // Delete record
  const deleteRecord = async (id: string) => {
    if (!id) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/health-records/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete record")
      }

      // Remove from local state
      setRecords(records.filter((record) => record.id !== id))

      // Close dialog if open
      if (showViewDialog && selectedRecord?.id === id) {
        setShowViewDialog(false)
      }

      toast({
        title: "Record Deleted",
        description: "Health record has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting record:", error)

      toast({
        title: "Delete Failed",
        description: "Could not delete health record.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Download PDF from IPFS
  const downloadPDF = () => {
    if (!selectedRecord?.ipfs_url) {
      toast({
        title: "No PDF URL",
        description: "PDF URL is not available.",
        variant: "destructive",
      })
      return
    }

    try {
      // Open the PDF in a new tab
      window.open(selectedRecord.ipfs_url, "_blank")

      toast({
        title: "PDF opened",
        description: "Your health report has been opened in a new tab.",
      })
    } catch (error) {
      console.error("Error opening PDF:", error)
      toast({
        title: "Error",
        description: "Could not open the PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  // View transaction in explorer
  const viewTransaction = (txHash: string) => {
    if (!txHash) {
      toast({
        title: "No transaction hash",
        description: "Transaction hash is not available.",
        variant: "destructive",
      })
      return
    }

    try {
      // Use the correct URL format for Aptos explorer
      const explorerUrl = `https://explorer.aptoslabs.com/txn/${txHash}?network=devnet`
      window.open(explorerUrl, "_blank")
    } catch (error) {
      console.error("Error opening transaction link:", error)
      toast({
        title: "Error",
        description: "Could not open transaction in explorer. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="gradient-blob top-0 left-0 opacity-20 bg-blue-400 dark:bg-blue-600"></div>
          <div className="gradient-blob bottom-0 right-0 opacity-20 bg-purple-400 dark:bg-purple-600"></div>
        </div>

        <div className="relative flex flex-col p-4 md:p-8 max-w-4xl mx-auto">
          <motion.h1
            className="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-transparent bg-clip-text"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            My Health Records
          </motion.h1>

          {errorMessage && (
            <div className="mb-4 p-4 border border-yellow-200 rounded-lg bg-yellow-50/80 dark:bg-yellow-900/10 dark:border-yellow-900/20 backdrop-blur-sm">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <div className="text-yellow-600 dark:text-yellow-400">
                  <p className="font-semibold">Notice</p>
                  <p className="text-sm">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                Connected as {user?.email}
              </Badge>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={() => router.push("/chat")}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Record
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : records.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {records.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-50"></div>
                    <CardHeader className="pb-2 relative">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <CardTitle className="text-lg">{record.title}</CardTitle>
                        {record.ipfs_hash && (
                          <Badge
                            variant="outline"
                            className="font-mono text-xs truncate max-w-xs bg-white/50 dark:bg-gray-800/50"
                          >
                            {record.ipfs_hash.substring(0, 16)}...
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pb-2 relative">
                      <div className="flex flex-col md:flex-row justify-between text-sm text-muted-foreground">
                        <div>Created: {formatDistanceToNow(new Date(record.created_at))} ago</div>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-1 text-indigo-500" />
                          <span>{record.diagnosis}</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="flex justify-between pt-2 relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openViewDialog(record)}
                        className="bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 border-indigo-200 dark:border-indigo-800"
                      >
                        <FileText className="w-4 h-4 mr-2 text-indigo-500" />
                        View Details
                      </Button>

                      {record.tx_hash && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewTransaction(record.tx_hash!)}
                          className="hover:bg-white/50 dark:hover:bg-gray-800/50"
                        >
                          <ExternalLink className="w-4 h-4 mr-2 text-purple-500" />
                          View on Explorer
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-50"></div>
              <CardContent className="flex flex-col items-center py-12 relative">
                <p className="text-center text-muted-foreground mb-4">You don't have any health records yet.</p>
                <Button
                  onClick={() => router.push("/chat")}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-0"
                >
                  Create Your First Record
                </Button>
              </CardContent>
            </Card>
          )}

          {/* View Record Dialog */}
          <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
            <DialogContent className="sm:max-w-md border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-50 rounded-lg"></div>
              <DialogHeader className="relative">
                <DialogTitle>View Health Record</DialogTitle>
                <DialogDescription>Your health record details.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4 relative">
                {selectedRecord && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold">Diagnosis</h3>
                      <p className="text-lg font-medium">{selectedRecord.diagnosis}</p>

                      <div className="flex items-center mt-2">
                        <Badge
                          className={`px-3 py-1 text-sm font-medium border
                          ${
                            selectedRecord.risk_level === "Low"
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : selectedRecord.risk_level === "Medium"
                                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                : selectedRecord.risk_level === "High"
                                  ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                  : "bg-red-500/10 text-red-500 border-red-500/20"
                          }`}
                        >
                          Risk Level: {selectedRecord.risk_level}
                        </Badge>
                      </div>
                    </div>

                    {selectedRecord.summary && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold">Summary</h3>
                        <p className="text-sm text-muted-foreground">{selectedRecord.summary}</p>
                      </div>
                    )}

                    {selectedRecord.ipfs_url && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold">PDF Health Report</h3>
                        <Button
                          onClick={downloadPDF}
                          className="w-full"
                          variant="outline"
                          className="bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 border-indigo-200 dark:border-indigo-800"
                        >
                          <FileText className="w-4 h-4 mr-2 text-indigo-500" />
                          <Download className="w-4 h-4 mr-2 text-indigo-500" />
                          Open PDF Report
                        </Button>
                      </div>
                    )}

                    <div className="p-4 border rounded-lg bg-white/50 dark:bg-gray-800/50">
                      <h3 className="font-semibold mb-2">Record Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Created:</span>
                          <span>{new Date(selectedRecord.created_at).toLocaleString()}</span>
                        </div>
                        {selectedRecord.ipfs_hash && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">IPFS Hash:</span>
                            <span className="font-mono text-xs truncate max-w-xs">{selectedRecord.ipfs_hash}</span>
                          </div>
                        )}
                        {selectedRecord.wellness_score && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Wellness Score:</span>
                            <span>{selectedRecord.wellness_score}/100</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex justify-between relative">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => selectedRecord && deleteRecord(selectedRecord.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  Delete Record
                </Button>

                <Button onClick={() => setShowViewDialog(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="text-sm text-muted-foreground text-center p-4 mt-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg">
            <p className="font-medium">Privacy & Security</p>
            <p>
              Your health records are stored securely in our database. PDF reports are stored on IPFS via Pinata and are
              only accessible to those who have the IPFS hash.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
