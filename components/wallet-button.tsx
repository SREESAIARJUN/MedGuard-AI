"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Wallet, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { aptosClient } from "@/lib/aptosClient"

type WalletButtonProps = {
  onConnect: (address: string) => void
  className?: string
}

export function WalletButton({ onConnect, className }: WalletButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const { toast } = useToast()

  const connectWallet = async () => {
    if (isConnected || isConnecting) return

    setIsConnecting(true)

    try {
      toast({
        title: "Connecting wallet",
        description: "Please approve the connection request in your wallet",
      })

      // Simulate wallet connection
      const { address, isConnected } = await aptosClient.connect()

      if (isConnected) {
        setWalletAddress(address)
        setIsConnected(true)
        onConnect(address)

        toast({
          title: "Wallet connected",
          description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
        })
      } else {
        throw new Error("Failed to connect wallet")
      }
    } catch (error) {
      console.error("Wallet connection error:", error)

      toast({
        title: "Connection failed",
        description: "Could not connect to your wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Button onClick={connectWallet} disabled={isConnecting || isConnected} className={className}>
      {isConnecting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Connecting...
        </>
      ) : isConnected ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Connected
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </>
      )}
    </Button>
  )
}
