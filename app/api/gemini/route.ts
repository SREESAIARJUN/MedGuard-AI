import { GoogleGenerativeAI } from "@google/generative-ai"

// Get API key from environment variable
const apiKey = process.env.GEMINI_API_KEY || ""
const genAI = new GoogleGenerativeAI(apiKey)

// Function to convert base64 to Uint8Array for Gemini API
function base64ToUint8Array(base64String: string) {
  // Remove data URL prefix if present
  const base64WithoutPrefix = base64String.includes(",") ? base64String.split(",")[1] : base64String

  // Decode base64
  const binaryString = atob(base64WithoutPrefix)
  const bytes = new Uint8Array(binaryString.length)

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return bytes
}

export async function POST(req: Request) {
  try {
    const { prompt, attachments, systemPrompt } = await req.json()

    // Initialize the model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-thinking-exp-01-21", // Use vision model for multimodal
      systemInstruction:
        systemPrompt ||
        `
You are a medical diagnosis assistant. Based on the symptoms and files provided by the user (e.g. images, audio), your task is to return an informed, structured response. Do not speculate or make unsafe assumptions. You are **not a substitute for a licensed physician**.

Please format your response using clear, well-structured markdown:
- Use **bold text** for important information
- Use headings (## and ###) to organize your response
- Use bullet points for lists
- Add line breaks between sections for readability

Your response should include both a conversational analysis AND structured JSON data.

For the JSON data, please use this schema:

\`\`\`json
{
  "diagnosis": {
    "value": "string",
    "description": "The most likely medical condition or illness based on the user's symptoms."
  },
  "causes": {
    "value": ["string"],
    "description": "Probable reasons or triggers that might have caused the condition."
  },
  "suggestions": {
    "value": ["string"],
    "description": "Recommended steps the user can take to relieve symptoms or improve condition."
  },
  "risk_level": {
    "value": "Low | Medium | High | Undetermined",
    "description": "The severity or urgency of the condition, based on common clinical assessment."
  },
  "followup_needed": {
    "value": true/false,
    "description": "Whether the user should seek medical consultation or diagnosis confirmation from a healthcare provider."
  },
  "additional_notes": {
    "value": "string",
    "description": "Any warnings, context, or additional guidance the user should be aware of."
  }
}
\`\`\`

Be concise yet informative. Ensure the output is easy to parse and clearly structured.
`.trim(),
    })

    const generationConfig = {
      temperature: 0.7,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 65536,
    }

    // Prepare content parts with files if any
    const parts = []

    // Add text prompt
    parts.push({ text: prompt })

    // Add file parts if any
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        if (attachment.type === "image" && attachment.url) {
          try {
            // Convert base64 to Uint8Array
            const imageData = base64ToUint8Array(attachment.url)

            // Add image to parts
            parts.push({
              inlineData: {
                data: Buffer.from(imageData).toString("base64"),
                mimeType: "image/jpeg", // Assuming JPEG, adjust if needed
              },
            })
          } catch (error) {
            console.error("Error processing image:", error)
          }
        }
        // Note: Audio and video are not directly supported by Gemini API
        // We'll handle them as text descriptions
      }
    }

    // Generate content
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
    })

    const response = result.response
    const text = response.text()

    // Format the response text to enhance markdown readability
    let formattedText = text

    // Try to extract structured data
    let structuredData = null
    try {
      // Try to extract JSON from text
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        structuredData = JSON.parse(match[0])

        // Remove the JSON from the text to avoid duplication
        formattedText = text.replace(/```json[\s\S]*?```/, "")

        // Add some spacing and formatting to make the markdown more readable
        formattedText = formattedText
          .replace(/\n\n/g, "\n\n") // Ensure proper paragraph spacing
          .replace(/\*\*/g, "**") // Ensure bold text is properly formatted
          .trim()
      }
    } catch (error) {
      console.error("Error parsing structured data:", error)
    }

    // If we couldn't extract structured data, create a basic structure
    if (!structuredData) {
      structuredData = {
        diagnosis: "Undetermined",
        causes: ["Unable to determine from the provided information"],
        suggestions: ["Please consult with a healthcare professional for proper diagnosis"],
        risk_level: "Undetermined",
        followup_needed: true,
        additional_notes: "The AI was unable to provide a specific diagnosis based on the information provided.",
      }
    }

    return new Response(
      JSON.stringify({
        text: formattedText,
        structuredData,
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error in Gemini API route:", error)
    return new Response(JSON.stringify({ error: "Failed to process request", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
