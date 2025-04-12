"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HeartPulse, Shield, FileText, Archive, Sparkles, Smartphone, FileDown, Zap } from "lucide-react"
import { WellnessOMeter } from "@/components/wellness-o-meter"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-24 overflow-hidden">
      <motion.div
        className="max-w-5xl w-full text-center space-y-8 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-4">
          <motion.h1
            className="text-4xl md:text-6xl font-bold tracking-tight gradient-text"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            MedGuard<span className="font-extrabold">AI</span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Your advanced AI health assistant - Analyze symptoms with multimodal input, securely store diagnoses, and
            maintain your health records on blockchain.
          </motion.p>
        </div>

        <motion.div
          className="flex justify-center py-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <WellnessOMeter score={85} size="lg" showLabel />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <Link href={feature.href} className="w-full">
                <Card
                  className={cn(
                    "h-full transition-all hover:shadow-lg hover:border-primary/50 hover:bg-white/50 dark:hover:bg-gray-900/50 card-3d",
                    "overflow-hidden relative border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm",
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-50"></div>
                  <CardHeader className="space-y-1 pb-2 relative">
                    <div className="flex justify-center mb-2">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-center text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-center text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="pt-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg gradient-button border-0">
            <Link href="/chat">
              Get Started
              <Zap className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>

        <motion.div
          className="pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <div className="p-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg max-w-2xl mx-auto border border-white/20 dark:border-gray-800/20">
            <p className="text-sm text-muted-foreground">
              <strong>Disclaimer:</strong> MedGuardAI provides AI-generated information for educational purposes only.
              It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of
              qualified health providers for any health concerns.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </main>
  )
}

const features = [
  {
    title: "AI Health Chat",
    description: "Describe symptoms via text, voice, or images and get AI-powered analysis",
    href: "/chat",
    icon: HeartPulse,
  },
  {
    title: "Secure Storage",
    description: "Encrypt your health data and store it securely on IPFS",
    href: "/summary",
    icon: Shield,
  },
  {
    title: "Blockchain NFTs",
    description: "Mint your health records as NFTs on the Aptos blockchain",
    href: "/mint",
    icon: FileText,
  },
  {
    title: "Health Records",
    description: "Access your stored health records and decrypt when needed",
    href: "/records",
    icon: Archive,
  },
  {
    title: "IoT Integration",
    description: "Connect your smartwatch data for comprehensive health tracking",
    href: "/iot",
    icon: Smartphone,
  },
  {
    title: "PDF Reports",
    description: "Generate and download detailed PDF health reports",
    href: "/summary",
    icon: FileDown,
  },
  {
    title: "Wellness Score",
    description: "Track your overall wellness score based on AI and IoT data",
    href: "/wellness",
    icon: Sparkles,
  },
  {
    title: "Real-time Updates",
    description: "Get real-time updates and notifications about your health",
    href: "/chat",
    icon: Zap,
  },
]
