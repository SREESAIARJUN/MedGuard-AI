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
import { FileText, ExternalLink, Wallet, Plus, AlertCircle, Download, Loader2, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { getClientSupabaseClient } from "@/lib/supabase"
import type { HealthRecord } from "@/types/database"

export default function RecordsPage() {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getClientSupabaseClient()

  // Fetch records from database
  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        // Get userId from session storage
        const storedUserId = sessionStorage.getItem("userId")

        if (storedUserId) {
          setUserId(storedUserId)
          setIsConnected(true)

          // Fetch records from API
          const response = await fetch(`/api/health-records?userId=${storedUserId}`)

          if (!response.ok) {
            throw new Error("Failed to fetch records")
          }

          const data = await response.json()
          setRecords(data.records || [])
        } else {
          // No user ID, show connect screen
          setIsConnected(false)
        }
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
  }, [toast])

  // Connect with demo account
  const connectDemoAccount = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      // Create a demo user
      const tempWalletAddress = `demo_${Date.now()}`

      const { data, error } = await supabase
        .from("users")
        .insert({ wallet_address: tempWalletAddress })
        .select()
        .single()

      if (error) {
        throw new Error("Failed to create demo user")
      }

      // Save user ID to session storage
      sessionStorage.setItem("userId", data.id)
      setUserId(data.id)
      setWalletAddress(tempWalletAddress)
      setIsConnected(true)

      toast({
        title: "Connected",
        description: "Connected to demo account successfully.",
      })

      // Fetch records for the new user (will be empty initially)
      const response = await fetch(`/api/health-records?userId=${data.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch records")
      }

      const recordsData = await response.json()
      setRecords(recordsData.records || [])
    } catch (error) {
      console.error("Connection error:", error)
      setErrorMessage("Could not connect demo account. Please try again.")

      toast({
        title: "Connection Failed",
        description: "Could not connect to demo account.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Health Records</h1>
        <Card className="flex items-center justify-center h-64 border-2">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
            <p>Loading health records...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Health Records</h1>

      {errorMessage && (
        <div className="mb-4 p-4 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/20">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <div className="text-yellow-600 dark:text-yellow-400">
              <p className="font-semibold">Notice</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {!isConnected ? (
        <Card className="border-2 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Connect to View Records</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col items-center py-6">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Wallet className="w-12 h-12 text-primary" />
                </div>

                <p className="text-center text-muted-foreground max-w-md mb-6">
                  Connect to access your health records stored in our database.
                </p>
              </div>

              <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                <h3 className="font-semibold">Demo Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Create a demo account to explore the health records feature.
                </p>
                <Button onClick={connectDemoAccount} className="w-full">
                  Connect Demo Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {walletAddress && (
                <Badge variant="outline" className="font-mono px-3 py-1">
                  {walletAddress.substring(0, 10)}...
                </Badge>
              )}
              <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                Connected
              </Badge>
            </div>

            <Button variant="outline" size="sm" onClick={() => router.push("/chat")}>
              <Plus className="w-4 h-4 mr-2" />
              New Record
            </Button>
          </div>

          {records.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {records.map((record) => (
                <Card key={record.id} className="border-2 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <CardTitle className="text-lg">{record.title}</CardTitle>
                      {record.ipfs_hash && (
                        <Badge variant="outline" className="font-mono text-xs truncate max-w-xs">
                          {record.ipfs_hash.substring(0, 16)}...
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pb-2">
                    <div className="flex flex-col md:flex-row justify-between text-sm text-muted-foreground">
                      <div>Created: {formatDistanceToNow(new Date(record.created_at))} ago</div>
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        <span>{record.diagnosis}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" onClick={() => openViewDialog(record)}>
                      <FileText className="w-4 h-4 mr-2" />
                      View Details
                    </Button>

                    {record.tx_hash && (
                      <Button variant="ghost" size="sm" onClick={() => viewTransaction(record.tx_hash!)}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Explorer
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-2 bg-card/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center py-12">
                <p className="text-center text-muted-foreground mb-4">You don't have any health records yet.</p>
                <Button onClick={() => router.push("/chat")}>Create Your First Record</Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* View Record Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>View Health Record</DialogTitle>
            <DialogDescription>Your health record details.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
                    <Button onClick={downloadPDF} className="w-full" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      <Download className="w-4 h-4 mr-2" />
                      Open PDF Report
                    </Button>
                  </div>
                )}

                <div className="p-4 border rounded-lg bg-muted/50">
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

          <DialogFooter className="flex justify-between">
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

      <div className="text-sm text-muted-foreground text-center p-4 mt-8 bg-muted rounded-lg">
        <p className="font-medium">Privacy & Security</p>
        <p>
          Your health records are stored securely in our database. PDF reports are stored on IPFS via Pinata and are
          only accessible to those who have the IPFS hash.
        </p>
      </div>
    </div>
  )
}
