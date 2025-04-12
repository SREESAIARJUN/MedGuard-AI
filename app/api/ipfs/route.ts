// Simulated IPFS API endpoint
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json()

    if (!data) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 })
    }

    // Simulate IPFS upload delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate a fake IPFS hash (CID)
    const hash = `Qm${Array.from({ length: 44 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`

    return NextResponse.json({
      success: true,
      hash,
      url: `https://ipfs.io/ipfs/${hash}`,
    })
  } catch (error) {
    console.error("IPFS upload error:", error)
    return NextResponse.json({ error: "Failed to upload to IPFS" }, { status: 500 })
  }
}
