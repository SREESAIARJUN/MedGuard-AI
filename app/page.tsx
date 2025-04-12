import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HeartPulse, Shield, FileText, Archive, Sparkles, Smartphone, FileDown, Zap } from "lucide-react"
import { WellnessOMeter } from "@/components/wellness-o-meter"
import { cn } from "@/lib/utils"

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-24 overflow-hidden">
      {/* Animated background blobs */}
      <div className="blob" style={{ top: "10%", left: "10%" }}></div>
      <div className="blob" style={{ bottom: "10%", right: "10%", animationDelay: "-15s" }}></div>

      <div className="max-w-5xl w-full text-center space-y-8 z-10">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 text-transparent bg-clip-text">
            MedGuard<span className="font-extrabold">AI</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Your advanced AI health assistant - Analyze symptoms with multimodal input, securely store diagnoses, and
            maintain your health records on blockchain.
          </p>
        </div>

        <div className="flex justify-center py-6">
          <WellnessOMeter score={85} size="lg" showLabel />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <Link key={index} href={feature.href} className="w-full">
              <Card
                className={cn(
                  "h-full transition-all hover:shadow-lg hover:border-primary/50 hover:bg-muted/50 card-3d",
                  "overflow-hidden relative",
                )}
              >
                <CardHeader className="space-y-1 pb-2">
                  <div className="flex justify-center mb-2">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-center text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="pt-8">
          <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg">
            <Link href="/chat">
              Get Started
              <Zap className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        <div className="pt-6">
          <div className="p-4 bg-muted rounded-lg max-w-2xl mx-auto border border-border glass">
            <p className="text-sm text-muted-foreground">
              <strong>Disclaimer:</strong> MedGuardAI provides AI-generated information for educational purposes only.
              It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of
              qualified health providers for any health concerns.
            </p>
          </div>
        </div>
      </div>
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
