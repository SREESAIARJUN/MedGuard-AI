"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Check, Copy, Upload, ChevronRight, Loader2 } from "lucide-react"

// Import our real implementations
import { ipfsClient } from "@/lib/ipfsClient"
import { generateHealthPDF } from "@/lib/pdf-generator"
import { getClientSupabaseClient } from "@/lib/supabase"

// Add imports for the components
import { PDFDownloadButton } from "@/components/pdf-download-button"
import { IoTDataDisplay } from "@/components/iot-data-display"
import { WellnessOMeter } from "@/components/wellness-o-meter"

type Diagnosis = {
  diagnosis: string
  possibleCauses: string[]
  suggestions: string[]
  riskLevel: "Low" | "Medium" | "High" | "Seek immediate medical attention"
  summary: string
  wellness_score?: number
}

export default function SummaryPage() {
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSavingToDb, setIsSavingToDb] = useState(false)
  const [ipfsHash, setIpfsHash] = useState<string | null>(null)
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getClientSupabaseClient()

  // Retrieve diagnosis data from session storage
  useEffect(() => {
    try {
      const data = sessionStorage.getItem("diagnosisData")
      if (data) {
        setDiagnosis(JSON.parse(data))
      } else {
        // No diagnosis data, redirect back to chat
        toast({
          title: "No diagnosis available",
          description: "Please complete a symptom analysis first.",
          variant: "destructive",
        })
        router.push("/chat")
      }

      // Check for existing user or create a temporary one
      const checkUser = async () => {
        // For demo purposes, we'll create a temporary user
        // In a real app, this would use proper authentication
        const tempWalletAddress = `demo_${Date.now()}`

        const { data, error } = await supabase
          .from("users")
          .insert({ wallet_address: tempWalletAddress })
          .select()
          .single()

        if (error) {
          console.error("Error creating user:", error)
          return
        }

        setUserId(data.id)
        sessionStorage.setItem("userId", data.id)
      }

      const existingUserId = sessionStorage.getItem("userId")
      if (existingUserId) {
        setUserId(existingUserId)
      } else {
        checkUser()
      }
    } catch (error) {
      console.error("Error retrieving diagnosis data:", error)
      toast({
        title: "Error",
        description: "Could not load diagnosis data. Please try again.",
        variant: "destructive",
      })
    }
  }, [router, toast, supabase])

  // Generate PDF
  const generatePDF = async () => {
    if (!diagnosis) {
      toast({
        title: "No data available",
        description: "Please complete a diagnosis first.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Generate the PDF
      const pdfDataUrl = generateHealthPDF(diagnosis)
      setPdfDataUrl(pdfDataUrl)

      toast({
        title: "PDF generated",
        description: "Your health report PDF has been generated successfully.",
      })
    } catch (error) {
      console.error("PDF generation error:", error)
      toast({
        title: "PDF generation failed",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Copy IPFS hash to clipboard
  const copyIpfsHash = () => {
    if (ipfsHash) {
      navigator.clipboard.writeText(ipfsHash)
      toast({
        title: "Copied!",
        description: "IPFS hash copied to clipboard.",
      })
    }
  }

  // Upload PDF to IPFS using Pinata
  const uploadToIPFS = async () => {
    if (!pdfDataUrl) {
      toast({
        title: "No PDF generated",
        description: "Please generate your PDF first.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Convert data URL to Blob
      const response = await fetch(pdfDataUrl)
      const blob = await response.blob()

      // Create a File object from the Blob
      const file = new File([blob], `MedGuardAI_Health_Report_${new Date().toISOString().split("T")[0]}.pdf`, {
        type: "application/pdf",
      })

      // Upload to Pinata
      const result = await ipfsClient.uploadFile(file)

      if (!result.success) {
        throw new Error("IPFS upload failed")
      }

      setIpfsHash(result.hash)

      // Save IPFS hash to session storage for the mint page
      sessionStorage.setItem("ipfsHash", result.hash)
      sessionStorage.setItem("ipfsUrl", result.url)
      sessionStorage.setItem("pdfUrl", result.url)

      toast({
        title: "Upload successful",
        description: "Your PDF has been uploaded to IPFS.",
      })
    } catch (error) {
      console.error("IPFS upload error:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading to IPFS. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Save record to Supabase
  const saveToDatabase = async () => {
    if (!diagnosis || !userId) {
      toast({
        title: "Missing data",
        description: "Diagnosis data or user ID is missing.",
        variant: "destructive",
      })
      return
    }

    setIsSavingToDb(true)

    try {
      // Prepare record data
      const recordData = {
        userId,
        title: `Medical Record: ${diagnosis.diagnosis}`,
        diagnosis: diagnosis.diagnosis,
        riskLevel: diagnosis.riskLevel,
        summary: diagnosis.summary,
        ipfsHash: ipfsHash || null,
        ipfsUrl: sessionStorage.getItem("ipfsUrl") || null,
        txHash: null, // Will be updated after blockchain minting
        wellnessScore: diagnosis.wellness_score || 75,
        possibleCauses: diagnosis.possibleCauses,
        suggestions: diagnosis.suggestions,
      }

      // Save to Supabase via API
      const response = await fetch("/api/health-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recordData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save record")
      }

      const data = await response.json()

      // Store record ID in session storage
      sessionStorage.setItem("currentRecordId", data.record.id)

      toast({
        title: "Record saved",
        description: "Your health record has been saved to the database.",
      })
    } catch (error) {
      console.error("Database save error:", error)
      toast({
        title: "Save failed",
        description: "There was an error saving to the database. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSavingToDb(false)
    }
  }

  // Proceed to the mint page
  const proceedToMint = async () => {
    if (!ipfsHash) {
      toast({
        title: "Upload required",
        description: "Please upload your PDF to IPFS first.",
        variant: "destructive",
      })
      return
    }

    // Save to database before proceeding if not already saved
    if (!sessionStorage.getItem("currentRecordId")) {
      await saveToDatabase()
    }

    router.push("/mint")
  }

  // Get risk level color
  const getRiskLevelColor = (riskLevel?: string) => {
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
    <div className="flex flex-col min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Diagnosis Summary</h1>

      {diagnosis ? (
        <div className="space-y-6">
          <Card className="border-2 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-2xl">{diagnosis.diagnosis}</CardTitle>
                <Badge className={`${getRiskLevelColor(diagnosis.riskLevel)} px-3 py-1 text-sm font-medium border`}>
                  Risk Level: {diagnosis.riskLevel}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Summary</h3>
                <p className="text-muted-foreground">{diagnosis.summary}</p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Possible Causes</h3>
                <ul className="list-disc list-inside space-y-1">
                  {diagnosis.possibleCauses.map((cause, index) => (
                    <li key={index} className="text-muted-foreground">
                      {cause}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
                <ul className="list-disc list-inside space-y-1">
                  {diagnosis.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-muted-foreground">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              {diagnosis.riskLevel === "High" || diagnosis.riskLevel === "Seek immediate medical attention" ? (
                <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/10 dark:border-red-900/20">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <div className="text-red-600 dark:text-red-400">
                      <p className="font-semibold">Important medical notice</p>
                      <p className="text-sm">
                        The AI has determined this may require urgent medical attention. Please consult with a
                        healthcare professional immediately.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <IoTDataDisplay />

            <Card className="border-2 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Health Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Generate a comprehensive PDF report of your health analysis that you can share with healthcare
                  providers.
                </p>

                <div className="flex justify-center py-2">
                  <WellnessOMeter score={diagnosis?.wellness_score || 75} />
                </div>

                <PDFDownloadButton diagnosisData={diagnosis} className="w-full" />
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Store Your Health Record</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Step 1: Generate PDF Report</h3>
                <Button onClick={generatePDF} disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating PDF...
                    </>
                  ) : pdfDataUrl ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      PDF Generated
                    </>
                  ) : (
                    "Generate PDF Report"
                  )}
                </Button>
                {pdfDataUrl && (
                  <div className="border rounded-lg p-2 h-40 overflow-hidden mt-2">
                    <iframe src={pdfDataUrl} className="w-full h-full" title="PDF Preview"></iframe>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Step 2: Upload to IPFS</h3>
                <Button
                  onClick={uploadToIPFS}
                  disabled={!pdfDataUrl || isUploading}
                  className="w-full"
                  variant={ipfsHash ? "outline" : "default"}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading to IPFS...
                    </>
                  ) : ipfsHash ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Uploaded to IPFS
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload to IPFS
                    </>
                  )}
                </Button>

                {ipfsHash && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md overflow-hidden">
                      <code className="text-xs flex-1 truncate">{ipfsHash}</code>
                      <Button onClick={copyIpfsHash} size="sm" variant="ghost">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Step 3: Save to Database</h3>
                <Button onClick={saveToDatabase} disabled={isSavingToDb || !diagnosis} className="w-full">
                  {isSavingToDb ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving to Database...
                    </>
                  ) : (
                    "Save to Database"
                  )}
                </Button>
              </div>
            </CardContent>

            <CardFooter>
              <Button onClick={proceedToMint} disabled={!ipfsHash} className="w-full">
                Proceed to Mint NFT
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <Card className="flex items-center justify-center h-64 border-2">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
            <p>Loading diagnosis data...</p>
          </div>
        </Card>
      )}

      <div className="text-sm text-muted-foreground text-center p-4 mt-8 bg-muted rounded-lg">
        <p className="font-medium">Privacy & Security Notice</p>
        <p>
          Your health report PDF is stored on IPFS via Pinata. While IPFS is a distributed system, your data is only
          accessible to those who have the IPFS hash. Your records are also securely stored in our database.
        </p>
      </div>
    </div>
  )
}
