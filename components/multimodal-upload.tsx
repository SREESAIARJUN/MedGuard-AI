"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ImageIcon, FileUp, Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MultimodalUploadProps {
  onFilesUploaded: (files: File[]) => void
}

export function MultimodalUpload({ onFilesUploaded }: MultimodalUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files)
      handleFiles(files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    // Check file size
    const maxSizeMB = 10
    const maxSizeBytes = maxSizeMB * 1024 * 1024

    const oversizedFiles = files.filter((file) => file.size > maxSizeBytes)
    if (oversizedFiles.length > 0) {
      toast({
        title: "Files too large",
        description: `Some files exceed the ${maxSizeMB}MB limit and were not added.`,
        variant: "destructive",
      })
    }

    const validSizeFiles = files.filter((file) => file.size <= maxSizeBytes)

    // Check file type
    const validFiles = validSizeFiles.filter((file) => {
      const fileType = file.type.split("/")[0]
      return fileType === "image" || fileType === "audio" || fileType === "video"
    })

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid file type",
        description: "Only image, audio, and video files are supported.",
        variant: "destructive",
      })
    }

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async () => {
    if (selectedFiles.length > 0) {
      setIsProcessing(true)

      try {
        onFilesUploaded(selectedFiles)
        setSelectedFiles([])
      } catch (error) {
        console.error("Error processing files:", error)
        toast({
          title: "Error processing files",
          description: "There was an error processing your files. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsProcessing(false)
      }
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*,audio/*,video/*"
        multiple
        className="hidden"
      />

      <Card
        className={`border-2 border-dashed p-6 text-center ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-primary/10 p-4">
            <ImageIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Drag and drop files here, or click to select</p>
            <p className="text-xs text-muted-foreground mt-1">Supports images, audio, and video files (max 10MB)</p>
          </div>
          <Button type="button" variant="outline" onClick={handleUploadClick}>
            <FileUp className="mr-2 h-4 w-4" />
            Select Files
          </Button>
        </div>
      </Card>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected files:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {selectedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
          <Button onClick={handleSubmit} className="w-full" disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Upload and Attach
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
