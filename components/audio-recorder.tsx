"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, Square, Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AudioRecorderProps {
  onAudioRecorded: (audioBlob: Blob) => void
}

export function AudioRecorder({ onAudioRecorded }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const url = URL.createObjectURL(audioBlob)
        setAudioBlob(audioBlob)
        setAudioUrl(url)

        // Stop all tracks in the stream
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start timer
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record audio.",
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
    if (audioBlob) {
      setIsProcessing(true)

      // Simulate processing delay
      setTimeout(() => {
        onAudioRecorded(audioBlob)
        setAudioBlob(null)
        setAudioUrl(null)
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
          <div className={`rounded-full p-4 ${isRecording ? "bg-red-500/10 animate-pulse" : "bg-primary/10"}`}>
            <Mic className={`h-8 w-8 ${isRecording ? "text-red-500" : "text-primary"}`} />
          </div>

          {isRecording ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Recording...</p>
              <p className="text-xl font-mono">{formatTime(recordingTime)}</p>
              <Button variant="destructive" onClick={stopRecording} className="rounded-full">
                <Square className="mr-2 h-4 w-4" />
                Stop Recording
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium">{audioUrl ? "Recording complete" : "Click to start recording"}</p>
              {audioUrl && (
                <audio controls className="mt-2 w-full">
                  <source src={audioUrl} type="audio/wav" />
                  Your browser does not support audio playback.
                </audio>
              )}
              {!audioUrl ? (
                <Button onClick={startRecording} className="rounded-full">
                  <Mic className="mr-2 h-4 w-4" />
                  Start Recording
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={startRecording} className="flex-1">
                    <Mic className="mr-2 h-4 w-4" />
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
