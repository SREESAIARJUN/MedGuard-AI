"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2, Upload, Check, Copy } from "lucide-react"
import { generateHealthPDF } from "@/lib/pdf-generator"
import { useToast } from "@/hooks/use-toast"
import { ipfsClient } from "@/lib/ipfsClient"

interface PDFDownloadButtonProps {
  diagnosisData: any
  className?: string
}

export function PDFDownloadButton({ diagnosisData, className }: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null)
  const [ipfsHash, setIpfsHash] = useState<string | null>(null)
  const [ipfsUrl, setIpfsUrl] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!diagnosisData) {
      toast({
        title: "No diagnosis data",
        description: "There is no diagnosis data to generate a PDF from.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Generate PDF
      const dataUrl = generateHealthPDF(diagnosisData)
      setPdfDataUrl(dataUrl)

      toast({
        title: "PDF generated",
        description: "Your health report has been generated successfully.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error generating PDF",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!pdfDataUrl) {
      handleGenerate()
      return
    }

    // Create a link element
    const link = document.createElement("a")
    link.href = pdfDataUrl
    link.download = `MedGuardAI_Health_Report_${new Date().toISOString().split("T")[0]}.pdf`

    // Append to body, click, and remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "PDF downloaded",
      description: "Your health report has been downloaded.",
    })
  }

  const handleUploadToPinata = async () => {
    if (!pdfDataUrl) {
      await handleGenerate()
      if (!pdfDataUrl) return // If generation failed
    }

    setIsUploading(true)

    try {
      // Convert data URL to Blob
      const response = await fetch(pdfDataUrl!)
      const blob = await response.blob()

      // Create a File object from the Blob
      const file = new File([blob], `MedGuardAI_Health_Report_${new Date().toISOString().split("T")[0]}.pdf`, {
        type: "application/pdf",
      })

      // Upload to Pinata
      const result = await ipfsClient.uploadFile(file)

      if (result.success) {
        setIpfsHash(result.hash)
        setIpfsUrl(result.url)

        toast({
          title: "PDF uploaded to IPFS",
          description: "Your health report has been uploaded to IPFS via Pinata.",
        })
      } else {
        throw new Error("Failed to upload to IPFS")
      }
    } catch (error) {
      console.error("Error uploading PDF to IPFS:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your PDF to IPFS. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const copyIpfsHash = () => {
    if (ipfsHash) {
      navigator.clipboard.writeText(ipfsHash)
      toast({
        title: "Copied!",
        description: "IPFS hash copied to clipboard.",
      })
    }
  }

  const viewOnIPFS = () => {
    if (ipfsUrl) {
      window.open(ipfsUrl, "_blank")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={handleDownload} disabled={isGenerating} className={`flex-1 ${className}`}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 h-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Download PDF Report
            </>
          )}
        </Button>

        <Button
          onClick={handleUploadToPinata}
          disabled={isUploading || isGenerating}
          variant={ipfsHash ? "outline" : "default"}
          className="flex-1"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 h-4 animate-spin" />
              Uploading to IPFS...
            </>
          ) : ipfsHash ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Uploaded to IPFS
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload to IPFS
            </>
          )}
        </Button>
      </div>

      {ipfsHash && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md overflow-hidden">
            <code className="text-xs flex-1 truncate">{ipfsHash}</code>
            <Button onClick={copyIpfsHash} size="sm" variant="ghost">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <Button onClick={viewOnIPFS} variant="link" size="sm" className="w-full">
            View on IPFS Gateway
          </Button>
        </div>
      )}
    </div>
  )
}
