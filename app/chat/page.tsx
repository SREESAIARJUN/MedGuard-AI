"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Send, User, Bot, Mic, FileText, X, Camera, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { WellnessOMeter } from "@/components/wellness-o-meter"
import { MedicalDisclaimer } from "@/components/medical-disclaimer"
import { MultimodalUpload } from "@/components/multimodal-upload"
import { AudioRecorder } from "@/components/audio-recorder"
import { VideoRecorder } from "@/components/video-recorder"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  attachments?: Array<{
    type: "image" | "audio" | "video"
    url: string
    thumbnail?: string
  }>
}

type DiagnosisData = {
  diagnosis: string
  causes: string[]
  suggestions: string[]
  risk_level: "Low" | "Medium" | "High" | "Undetermined"
  followup_needed: boolean
  additional_notes: string
  wellness_score?: number
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your advanced AI health assistant. You can describe your symptoms via text, upload images, or record audio/video for analysis. How can I help you today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("text")
  const [attachments, setAttachments] = useState<Message["attachments"]>([])
  const [wellnessScore, setWellnessScore] = useState<number | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!input.trim() && (!attachments || attachments.length === 0)) {
      toast({
        title: "Empty message",
        description: "Please enter text or add attachments before sending.",
        variant: "destructive",
      })
      return
    }

    const messageId = Date.now().toString()
    const userMessage: Message = {
      id: messageId,
      role: "user",
      content: input,
      attachments: attachments?.length ? [...attachments] : undefined,
    }

    // Reset input and attachments
    setInput("")
    setAttachments([])
    setApiError(null)

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage])

    // Show typing indicator
    setIsLoading(true)

    try {
      // Create the AI prompt
      let prompt = input.trim()

      if (attachments?.length) {
        prompt += "\n\nThe user has also provided the following attachments:"
        attachments.forEach((attachment, index) => {
          prompt += `\n- Attachment ${index + 1}: ${attachment.type} file`
        })

        // For audio and video, add descriptions
        const audioAttachments = attachments.filter((att) => att.type === "audio")
        const videoAttachments = attachments.filter((att) => att.type === "video")

        if (audioAttachments.length > 0) {
          prompt += "\n\nNote: Audio files were provided. Please analyze based on the text description."
        }

        if (videoAttachments.length > 0) {
          prompt += "\n\nNote: Video files were provided. Please analyze based on the text description."
        }
      }

      // Use Gemini API
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          attachments: attachments, // Send the full attachments array
          systemPrompt: `You are a medical diagnosis assistant. Based on the symptoms provided by the user, your job is to:

1. Identify the most likely medical condition (diagnosis).
2. List common or probable causes.
3. Suggest steps the user can take for relief or treatment.
4. Assign a risk level (Low, Medium, High, Undetermined).
5. Indicate whether a follow-up with a medical professional is necessary.
6. Include additional notes with warnings or context, if needed.

Respond in a conversational, helpful manner. First provide a summary of your assessment in plain language, then provide the detailed analysis.

After your conversational response, include a JSON object with the structured data in the following format:
\`\`\`json
{
  "diagnosis": "string",
  "causes": ["string"],
  "suggestions": ["string"],
  "risk_level": "Low | Medium | High | Undetermined",
  "followup_needed": true/false,
  "additional_notes": "string"
}
\`\`\`

Be informative, safe, and never replace a real doctor.
`,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to get AI response: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Extract the conversational part of the response (before the JSON)
      let aiResponse = data.text

      // Clean up the response to ensure proper markdown rendering
      aiResponse = aiResponse
        .replace(/\n\n\n+/g, "\n\n") // Remove excessive line breaks
        .replace(/\*\*/g, "**") // Ensure proper bold formatting
        .trim()

      // Calculate a wellness score based on the diagnosis
      let calculatedScore = 85 // Default score
      if (data.structuredData && data.structuredData.risk_level) {
        switch (data.structuredData.risk_level) {
          case "Low":
            calculatedScore = Math.floor(Math.random() * 15) + 75 // 75-90
            break
          case "Medium":
            calculatedScore = Math.floor(Math.random() * 20) + 50 // 50-70
            break
          case "High":
            calculatedScore = Math.floor(Math.random() * 30) + 20 // 20-50
            break
          case "Undetermined":
            calculatedScore = 65 // Default for undetermined
            break
        }
      }

      setWellnessScore(calculatedScore)

      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: aiResponse,
        },
      ])

      // Store diagnosis in session storage for the summary page
      try {
        // Try to parse the JSON response
        let diagnosisData: DiagnosisData | null = null

        if (data.structuredData) {
          diagnosisData = data.structuredData
        } else {
          // Try to extract from text if structured data not available
          const jsonMatch = data.text.match(/```json\s*([\s\S]*?)\s*```/) || data.text.match(/({[\s\S]*})/)
          if (jsonMatch && jsonMatch[1]) {
            diagnosisData = JSON.parse(jsonMatch[1])
          }
        }

        if (diagnosisData) {
          // Convert to the format expected by the summary page
          const summaryData = {
            diagnosis: diagnosisData.diagnosis,
            possibleCauses: diagnosisData.causes,
            suggestions: diagnosisData.suggestions,
            riskLevel: diagnosisData.risk_level,
            summary: diagnosisData.additional_notes,
            wellness_score: calculatedScore,
          }

          // Store in session storage
          sessionStorage.setItem("diagnosisData", JSON.stringify(summaryData))
          sessionStorage.setItem(
            "fullChatHistory",
            JSON.stringify([
              ...messages,
              userMessage,
              {
                id: Date.now().toString(),
                role: "assistant",
                content: aiResponse,
              },
            ]),
          )

          // Show toast notification
          toast({
            title: "Analysis complete",
            description: "Your health analysis is ready to view.",
          })
        } else {
          throw new Error("Could not extract diagnosis data from response")
        }
      } catch (error) {
        console.error("Error storing diagnosis data:", error)
        toast({
          title: "Error processing diagnosis",
          description: "There was an issue with the AI response format. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error getting AI response:", error)
      setApiError(error.message)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "I apologize, but I encountered an error processing your request. Please try again later.",
        },
      ])

      toast({
        title: "Error",
        description: "Failed to connect to the AI service. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewSummary = () => {
    if (sessionStorage.getItem("diagnosisData")) {
      router.push("/summary")
    } else {
      toast({
        title: "No diagnosis available",
        description: "Please complete a symptom analysis first.",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async (files: File[]) => {
    const newAttachments: Message["attachments"] = []

    for (const file of files) {
      const fileType = file.type.split("/")[0]

      // Convert file to base64
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      if (fileType === "image") {
        newAttachments.push({
          type: "image",
          url: base64Data,
        })
      } else if (fileType === "audio") {
        newAttachments.push({
          type: "audio",
          url: base64Data,
        })
      } else if (fileType === "video") {
        newAttachments.push({
          type: "video",
          url: base64Data,
        })
      }
    }

    setAttachments((prev) => [...prev, ...newAttachments])

    toast({
      title: "Files uploaded",
      description: `${files.length} file(s) added to your message.`,
    })
  }

  const handleAudioRecorded = async (audioBlob: Blob) => {
    // Convert blob to base64
    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(audioBlob)
    })

    setAttachments((prev) => [...prev, { type: "audio", url: base64Data }])

    toast({
      title: "Audio recorded",
      description: "Your audio recording has been added to your message.",
    })
  }

  const handleVideoRecorded = async (videoBlob: Blob) => {
    // Convert blob to base64
    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(videoBlob)
    })

    setAttachments((prev) => [...prev, { type: "video", url: base64Data }])

    toast({
      title: "Video recorded",
      description: "Your video recording has been added to your message.",
    })
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev?.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">AI Health Assistant</h1>

        {wellnessScore !== null && (
          <div className="mt-4 md:mt-0">
            <WellnessOMeter score={wellnessScore} />
          </div>
        )}
      </div>

      {apiError && (
        <div className="mb-4 p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/10 dark:border-red-900/20">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div className="text-red-600 dark:text-red-400">
              <p className="font-semibold">API Error</p>
              <p className="text-sm">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      <Card className="flex-1 flex flex-col overflow-hidden border-2 mb-4 bg-card/50 backdrop-blur-sm glass">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={cn("flex items-start gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                      <Bot size={18} />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-lg p-4 max-w-[85%] md:max-w-[75%]", // Increased width for better readability
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose dark:prose-invert prose-sm max-w-none break-words">
                        <ReactMarkdown
                          components={{
                            h1: ({ node, ...props }) => <h1 className="text-xl font-bold my-4" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-lg font-bold my-3" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-md font-bold my-2" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-2" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-2" {...props} />,
                            li: ({ node, ...props }) => <li className="my-1" {...props} />,
                            p: ({ node, ...props }) => <p className="my-2" {...props} />,
                            code: ({ node, inline, className, children, ...props }) => {
                              if (inline) {
                                return (
                                  <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                                    {children}
                                  </code>
                                )
                              }
                              return (
                                <pre className="bg-muted p-3 rounded-md overflow-x-auto my-3">
                                  <code className="text-sm" {...props}>
                                    {children}
                                  </code>
                                </pre>
                              )
                            },
                            blockquote: ({ node, ...props }) => (
                              <blockquote
                                className="border-l-4 border-muted-foreground/30 pl-4 italic my-3"
                                {...props}
                              />
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap break-words">{message.content}</div>
                    )}

                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map((attachment, index) => (
                          <div key={index} className="rounded-md overflow-hidden border">
                            {attachment.type === "image" && (
                              <img
                                src={attachment.url || "/placeholder.svg"}
                                alt="User uploaded image"
                                className="max-h-48 w-auto object-contain"
                              />
                            )}
                            {attachment.type === "audio" && (
                              <audio controls className="w-full">
                                <source src={attachment.url} />
                                Your browser does not support audio playback.
                              </audio>
                            )}
                            {attachment.type === "video" && (
                              <video controls className="max-h-48 w-auto">
                                <source src={attachment.url} />
                                Your browser does not support video playback.
                              </video>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                      <User size={18} />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                  <Bot size={18} />
                </div>
                <div className="rounded-lg p-3 bg-muted">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          {attachments && attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachments.map((attachment, index) => (
                <div key={index} className="relative rounded-md overflow-hidden border h-16 w-16">
                  {attachment.type === "image" && (
                    <img
                      src={attachment.url || "/placeholder.svg"}
                      alt="Attachment preview"
                      className="h-full w-full object-cover"
                    />
                  )}
                  {attachment.type === "audio" && (
                    <div className="h-full w-full flex items-center justify-center bg-muted">
                      <Mic className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  {attachment.type === "video" && (
                    <div className="h-full w-full flex items-center justify-center bg-muted">
                      <Camera className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-0 right-0 h-5 w-5 rounded-full p-0"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-2">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
              <TabsTrigger value="video">Video</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="mt-0">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your symptoms in detail..."
                  className="min-h-[80px] flex-1 resize-none"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    type="submit"
                    disabled={isLoading || (!input.trim() && (!attachments || attachments.length === 0))}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleViewSummary} disabled={isLoading}>
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="upload" className="mt-0">
              <MultimodalUpload onFilesUploaded={handleFileUpload} />
            </TabsContent>

            <TabsContent value="audio" className="mt-0">
              <AudioRecorder onAudioRecorded={handleAudioRecorded} />
            </TabsContent>

            <TabsContent value="video" className="mt-0">
              <VideoRecorder onVideoRecorded={handleVideoRecorded} />
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      <MedicalDisclaimer />
    </div>
  )
}
