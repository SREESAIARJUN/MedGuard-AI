"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, Square, Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VideoRecorderProps {
  onVideoRecorded: (videoBlob: Blob) => void
}

export function VideoRecorder({ onVideoRecorded }: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const videoChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [videoUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      videoChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: "video/webm" })
        const url = URL.createObjectURL(videoBlob)
        setVideoBlob(videoBlob)
        setVideoUrl(url)

        // Stop all tracks in the stream
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null

        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start timer
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to record video.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const handleSubmit = () => {
    if (videoBlob) {
      setIsProcessing(true)

      // Simulate processing delay
      setTimeout(() => {
        onVideoRecorded(videoBlob)
        setVideoBlob(null)
        setVideoUrl(null)
        setIsProcessing(false)
      }, 1000)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 p-6 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative">
            {isRecording && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                <span className="h-2 w-2 bg-white rounded-full mr-1 animate-pulse"></span>
                REC {formatTime(recordingTime)}
              </div>
            )}
            {videoUrl ? (
              <video src={videoUrl} controls className="w-full h-full object-cover" />
            ) : (
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            )}
          </div>

          {isRecording ? (
            <Button variant="destructive" onClick={stopRecording} className="rounded-full">
              <Square className="mr-2 h-4 w-4" />
              Stop Recording
            </Button>
          ) : (
            <div className="space-y-2 w-full">
              <p className="text-sm font-medium">{videoUrl ? "Recording complete" : "Click to start recording"}</p>
              {!videoUrl ? (
                <Button onClick={startRecording} className="rounded-full">
                  <Camera className="mr-2 h-4 w-4" />
                  Start Recording
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={startRecording} className="flex-1">
                    <Camera className="mr-2 h-4 w-4" />
                    Record Again
                  </Button>
                  <Button onClick={handleSubmit} disabled={isProcessing} className="flex-1">
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Use Recording
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
