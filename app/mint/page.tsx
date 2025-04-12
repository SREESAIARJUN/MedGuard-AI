"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  Wallet,
  Check,
  Loader2,
  FileCheck,
  ArrowRight,
  AlertCircle,
  Coins,
  FileText,
  Download,
  RefreshCw,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { aptosClient } from "@/lib/aptosClient"

type MintState = "connect-wallet" | "prepare" | "minting" | "success"

export default function MintPage() {
  const [mintState, setMintState] = useState<MintState>("connect-wallet")
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<string>("0")
  const [nftMetadata, setNftMetadata] = useState<any>(null)
  const [ipfsHash, setIpfsHash] = useState<string | null>(null)
  const [ipfsUrl, setIpfsUrl] = useState<string | null>(null)
  const [diagnosis, setDiagnosis] = useState<string>("")
  const [txHash, setTxHash] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isMartianInstalled, setIsMartianInstalled] = useState<boolean>(false)
  const [transactionRejected, setTransactionRejected] = useState<boolean>(false)
  // Add a new state variable for simulation mode after the other state variables
  const [simulationMode, setSimulationMode] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()

  // Check if Martian wallet is installed
  useEffect(() => {
    const checkMartian = async () => {
      const installed = aptosClient.isMartianInstalled()
      setIsMartianInstalled(installed)

      if (!installed) {
        setErrorMessage("Martian wallet is not installed. Please install the Martian wallet extension to continue.")
      } else {
        // Check if already connected
        const connected = await aptosClient.isConnected()
        if (connected) {
          const account = await aptosClient.getAccount()
          setWalletAddress(account.address)

          // Get balance
          try {
            const balance = await aptosClient.getBalance(account.address)
            setWalletBalance(balance)
          } catch (error) {
            console.error("Error fetching balance:", error)
            setWalletBalance("0")
          }

          // Move to prepare state
          setMintState("prepare")
        }
      }
    }

    checkMartian()
  }, [])

  // Retrieve data from session storage
  useEffect(() => {
    try {
      const hash = sessionStorage.getItem("ipfsHash")
      const url = sessionStorage.getItem("ipfsUrl")
      const pdfUrl = sessionStorage.getItem("pdfUrl")
      const diagnosisData = sessionStorage.getItem("diagnosisData")

      if (hash && diagnosisData) {
        setIpfsHash(hash)
        setIpfsUrl(pdfUrl || url || `https://gateway.pinata.cloud/ipfs/${hash}`)
        const parsedDiagnosis = JSON.parse(diagnosisData)
        setDiagnosis(parsedDiagnosis.diagnosis)
      } else {
        // For demo purposes, create mock data if none exists
        const mockHash = `Qm${Array.from({ length: 44 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`
        const mockUrl = `https://gateway.pinata.cloud/ipfs/${mockHash}`
        const mockDiagnosis = {
          diagnosis: "Common Cold",
          possibleCauses: ["Rhinovirus", "Coronavirus", "Adenovirus"],
          suggestions: ["Rest", "Stay hydrated", "Take over-the-counter cold medications"],
          riskLevel: "Low",
          summary: "A mild upper respiratory infection with typical symptoms of sore throat, runny nose, and cough.",
        }

        setIpfsHash(mockHash)
        setIpfsUrl(mockUrl)
        setDiagnosis(mockDiagnosis.diagnosis)

        // Store mock data in session storage
        sessionStorage.setItem("ipfsHash", mockHash)
        sessionStorage.setItem("ipfsUrl", mockUrl)
        sessionStorage.setItem("pdfUrl", mockUrl)
        sessionStorage.setItem("diagnosisData", JSON.stringify(mockDiagnosis))
      }
    } catch (error) {
      console.error("Error retrieving data:", error)
      toast({
        title: "Error",
        description: "Could not load required data. Please try again.",
        variant: "destructive",
      })
    }
  }, [router, toast])

  // Connect to Martian wallet
  const connectWallet = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const accountInfo = await aptosClient.connect()

      if (accountInfo.isConnected) {
        setWalletAddress(accountInfo.address)

        // Get account balance
        try {
          const balance = await aptosClient.getBalance(accountInfo.address)
          setWalletBalance(balance)
        } catch (error) {
          console.error("Error fetching balance:", error)
          setWalletBalance("0")
        }

        setMintState("prepare")

        toast({
          title: "Wallet Connected",
          description: `Connected to Aptos account: ${accountInfo.address.substring(0, 6)}...${accountInfo.address.substring(accountInfo.address.length - 4)}`,
        })
      } else {
        throw new Error("Failed to connect to Martian wallet")
      }
    } catch (error) {
      console.error("Wallet connection error:", error)

      // Check if user rejected the connection
      if (error.message && error.message.includes("rejected")) {
        setErrorMessage("Connection rejected. Please approve the connection request in your Martian wallet.")
      } else {
        setErrorMessage("Could not connect to Martian wallet. Please try again.")
      }

      toast({
        title: "Connection Failed",
        description: error.message || "There was an error connecting to Martian wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Prepare NFT metadata
  const prepareNFT = () => {
    if (!ipfsHash || !diagnosis) {
      toast({
        title: "Missing data",
        description: "Required data for minting is missing.",
        variant: "destructive",
      })
      return
    }

    // Reset transaction rejected state
    setTransactionRejected(false)

    // Create NFT metadata
    const metadata = {
      name: `Medical Record: ${diagnosis}`,
      description: `Medical record PDF for diagnosis: ${diagnosis}`,
      image: "https://ipfs.io/ipfs/QmULKig5Fxrs2uC9VHe7xDQfgxudwcH5f2fQVu8q5fFH9p", // Placeholder image URL
      attributes: [
        {
          trait_type: "Record Type",
          value: "Medical Diagnosis",
        },
        {
          trait_type: "Format",
          value: "PDF",
        },
        {
          trait_type: "Timestamp",
          value: new Date().toISOString(),
        },
        {
          trait_type: "IPFS CID",
          value: ipfsHash,
        },
      ],
    }

    setNftMetadata(metadata)
    setMintState("minting")

    // Mint the NFT
    mintNFT(metadata)
  }

  // Mint NFT on Aptos blockchain
  const mintNFT = async (metadata: any) => {
    if (!walletAddress || !ipfsUrl) {
      toast({
        title: "Missing data",
        description: "Wallet information or IPFS URL is missing.",
        variant: "destructive",
      })
      setMintState("prepare")
      return
    }

    try {
      console.log("Minting NFT with IPFS URL:", ipfsUrl)

      // Use Martian wallet to mint NFT
      const result = await aptosClient.mintNFT(ipfsUrl, metadata.name, metadata.description)

      setTxHash(result.txHash)
      setMintState("success")

      // Update the record in the database with the transaction hash
      const recordId = sessionStorage.getItem("currentRecordId")
      if (recordId) {
        try {
          const response = await fetch(`/api/health-records/${recordId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              txHash: result.txHash,
            }),
          })

          if (!response.ok) {
            console.error("Failed to update record with transaction hash")
          }
        } catch (updateError) {
          console.error("Error updating record:", updateError)
        }
      }

      // Save to session storage for records page
      const existingRecords = JSON.parse(sessionStorage.getItem("medicalRecords") || "[]")
      const newRecord = {
        id: Math.random().toString(36).substring(2, 15),
        title: metadata.name,
        ipfsHash: ipfsHash,
        ipfsUrl: ipfsUrl,
        timestamp: new Date().toISOString(),
        txHash: result.txHash,
      }

      sessionStorage.setItem("medicalRecords", JSON.stringify([...existingRecords, newRecord]))

      toast({
        title: "NFT Minted Successfully",
        description: "Your medical record has been minted as an NFT on Aptos.",
      })
    } catch (error) {
      console.error("NFT minting error:", error)

      // Check if user rejected the transaction
      if (error.message && error.message.includes("rejected")) {
        setTransactionRejected(true)
        setErrorMessage("Transaction rejected. Please approve the transaction in your Martian wallet.")
      } else {
        setErrorMessage(`There was an error minting your NFT: ${error.message || "Unknown error"}`)
      }

      toast({
        title: "Minting Failed",
        description: error.message || "There was an error minting your NFT. Please try again.",
        variant: "destructive",
      })

      setMintState("prepare")
    }
  }

  // View records page
  const viewRecords = () => {
    router.push("/records")
  }

  // View transaction in explorer
  const viewTransaction = () => {
    if (txHash) {
      try {
        // Use the helper function to get the correct explorer URL
        const explorerUrl = aptosClient.getTransactionUrl(txHash)
        console.log("Opening explorer URL:", explorerUrl)
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
  }

  // View PDF on IPFS
  const viewPDF = () => {
    if (ipfsUrl) {
      try {
        window.open(ipfsUrl, "_blank")
      } catch (error) {
        console.error("Error opening PDF:", error)
        toast({
          title: "Error",
          description: "Could not open the PDF. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  // Add a new function for simulated minting after the viewPDF function
  const simulateMinting = () => {
    setMintState("minting")
    setSimulationMode(true)

    // Simulate a delay for the minting process
    setTimeout(() => {
      // Generate a fake transaction hash
      const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`
      setTxHash(mockTxHash)

      // Save to session storage for records page
      const existingRecords = JSON.parse(sessionStorage.getItem("medicalRecords") || "[]")
      const newRecord = {
        id: Math.random().toString(36).substring(2, 15),
        title: `Medical Record: ${diagnosis}`,
        ipfsHash: ipfsHash,
        ipfsUrl: ipfsUrl,
        timestamp: new Date().toISOString(),
        txHash: mockTxHash,
      }

      sessionStorage.setItem("medicalRecords", JSON.stringify([...existingRecords, newRecord]))

      // Update state to success
      setMintState("success")

      toast({
        title: "Simulation Successful",
        description: "Your medical record has been minted in simulation mode.",
      })
    }, 3000)
  }

  // Install Martian wallet
  const installMartian = () => {
    window.open("https://www.martianwallet.xyz/", "_blank")
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Mint Medical NFT</h1>
        <Card className="flex items-center justify-center h-64 border-2">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
            <p>Processing...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mint Medical NFT</h1>

      {!isMartianInstalled && (
        <div className="mb-4 p-4 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/20">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <div className="text-yellow-600 dark:text-yellow-400">
              <p className="font-semibold">Martian Wallet Required</p>
              <p className="text-sm">
                Martian wallet is not installed. Please install the Martian wallet extension to mint NFTs.
              </p>
              <Button variant="outline" className="mt-2" onClick={installMartian}>
                <Download className="mr-2 h-4 w-4" />
                Install Martian Wallet
              </Button>
            </div>
          </div>
        </div>
      )}

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

      <Card className="border-2 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl">Convert Your Medical Record to an NFT</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            <div className="relative">
              <div className="flex justify-between mb-8 relative z-10">
                {["connect-wallet", "prepare", "minting", "success"].map((state, index) => {
                  const isActive = ["connect-wallet", "prepare", "minting", "success"].indexOf(mintState) >= index
                  const isCompleted = ["connect-wallet", "prepare", "minting", "success"].indexOf(mintState) > index

                  return (
                    <div key={state} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                          isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? <Check className="w-5 h-5" /> : <span>{index + 1}</span>}
                      </div>
                      <span className={`text-xs font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {state === "connect-wallet"
                          ? "Connect Wallet"
                          : state === "prepare"
                            ? "Prepare NFT"
                            : state === "minting"
                              ? "Mint NFT"
                              : "Complete"}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted"></div>
              <div
                className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
                style={{
                  width:
                    mintState === "connect-wallet"
                      ? "0%"
                      : mintState === "prepare"
                        ? "33%"
                        : mintState === "minting"
                          ? "67%"
                          : "100%",
                }}
              ></div>
            </div>

            <AnimatePresence mode="wait">
              {mintState === "connect-wallet" && (
                <motion.div
                  key="connect-wallet"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex justify-center py-6">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                      <Wallet className="w-12 h-12 text-primary" />
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Connect to Martian Wallet</h3>
                    <p className="text-muted-foreground">
                      Connect your Martian wallet to mint your medical record as an NFT on Aptos.
                    </p>
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button onClick={connectWallet} className="px-8 py-6" disabled={!isMartianInstalled}>
                      <Wallet className="mr-2 h-5 w-5" />
                      Connect Martian Wallet
                    </Button>
                  </div>

                  <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/20">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                      <div className="text-yellow-600 dark:text-yellow-400">
                        <p className="font-semibold">Important Notice</p>
                        <p className="text-sm">
                          This will create a real transaction on the Aptos blockchain. Make sure you have enough APT
                          tokens in your account to cover the transaction fees.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {mintState === "prepare" && (
                <motion.div
                  key="prepare"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h3 className="font-semibold mb-2">Connected Account</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Address:</span>
                        <Badge variant="outline" className="font-mono">
                          {walletAddress?.substring(0, 10)}...{walletAddress?.substring(walletAddress.length - 6)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Balance:</span>
                        <div className="flex items-center">
                          <Coins className="h-4 w-4 mr-1 text-primary" />
                          <span>{walletBalance} APT</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h3 className="font-semibold mb-2">NFT Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Title:</span>
                        <span className="font-medium">Medical Record: {diagnosis}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IPFS Hash:</span>
                        <span className="font-mono text-xs truncate max-w-xs">{ipfsHash}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">PDF:</span>
                        <Button variant="outline" size="sm" onClick={viewPDF}>
                          <FileText className="h-4 w-4 mr-2" />
                          View PDF
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button onClick={prepareNFT} className="px-8 py-6">
                      Prepare and Mint NFT
                    </Button>
                  </div>

                  {transactionRejected && (
                    <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/20">
                      <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                        <div className="text-yellow-600 dark:text-yellow-400">
                          <p className="font-semibold">Transaction Rejected or Security Warning</p>
                          <p className="text-sm">
                            The transaction was rejected or flagged by your wallet's security service. This is likely
                            because the v0 preview environment is not recognized as a trusted domain.
                          </p>
                          <div className="flex gap-2 mt-3">
                            <Button variant="outline" onClick={prepareNFT} size="sm">
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Try Again
                            </Button>
                            <Button onClick={simulateMinting} size="sm">
                              Use Simulation Mode
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {mintState === "minting" && (
                <motion.div
                  key="minting"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex flex-col items-center py-12">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <h3 className="text-lg font-semibold">Minting Your NFT</h3>
                    <p className="text-muted-foreground text-center mt-2">
                      This process may take a few moments. Please don't close this window.
                    </p>
                    <p className="text-muted-foreground text-center mt-2">
                      Please approve the transaction in your Martian wallet when prompted.
                    </p>
                  </div>
                </motion.div>
              )}

              {mintState === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex flex-col items-center py-8">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                      <FileCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>

                    <h3 className="text-lg font-semibold">NFT Successfully Minted!</h3>
                    <p className="text-muted-foreground text-center mt-2 max-w-md">
                      Your medical record has been securely minted as an NFT on the Aptos blockchain. You can view all
                      your records in the Records section.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h3 className="font-semibold mb-2">Transaction Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                          Confirmed
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaction Hash:</span>
                        <div className="flex items-center">
                          <span className="font-mono text-xs truncate max-w-xs">
                            {txHash ? `${txHash.substring(0, 10)}...` : "N/A"}
                          </span>
                          {txHash && (
                            <Button variant="ghost" size="sm" onClick={viewTransaction} className="ml-2 h-6 w-6 p-0">
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Network:</span>
                        <span>{process.env.NEXT_PUBLIC_APTOS_NETWORK || "devnet"}</span>
                      </div>
                      {simulationMode && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-md text-blue-600 dark:text-blue-400 text-sm">
                          <p className="font-semibold">Simulation Mode</p>
                          <p className="text-xs">This is a simulated transaction for demonstration purposes.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>

        <CardFooter>
          {mintState === "success" && (
            <Button onClick={viewRecords} className="w-full">
              View My Records
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {transactionRejected && mintState === "prepare" && (
            <div className="flex gap-2 w-full">
              <Button onClick={prepareNFT} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={simulateMinting} variant="secondary" className="flex-1">
                Use Simulation Mode
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      <div className="text-sm text-muted-foreground text-center p-4 mt-8 bg-muted rounded-lg">
        <p className="font-medium">Blockchain Privacy & Security</p>
        <p>
          Your medical PDF is stored on IPFS via Pinata, with only a reference to this data stored on-chain. While IPFS
          is a distributed system, your data is only accessible to those who have the IPFS hash.
        </p>
      </div>
    </div>
  )
}
