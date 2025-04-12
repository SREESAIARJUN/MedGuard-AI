import type React from "react"
import type { Metadata } from "next"
import { Inter, Montserrat } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Navbar from "@/components/navbar"
import { Analytics } from "@/components/analytics"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["600", "700"],
})

export const metadata: Metadata = {
  title: "MedGuard AI - Advanced Health & Wellness Platform",
  description: "AI-powered health analysis with blockchain security and IoT integration",
  icons: {
    icon: "/favicon.ico",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn("min-h-screen font-sans antialiased", inter.variable, montserrat.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
              {/* Enhanced background gradients */}
              <div className="fixed inset-0 bg-gradient-radial from-indigo-100 via-purple-50 to-pink-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-pink-950/40 z-[-2]"></div>

              {/* Animated gradient blobs */}
              <div className="fixed inset-0 z-[-1] overflow-hidden">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-r from-indigo-400/20 to-purple-400/20 dark:from-indigo-600/20 dark:to-purple-600/20 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/20 to-pink-400/20 dark:from-purple-600/20 dark:to-pink-600/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-gradient-to-r from-blue-400/20 to-cyan-400/20 dark:from-blue-600/20 dark:to-cyan-600/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
              </div>

              <Navbar />
              <div className="flex-1">{children}</div>
            </div>
            <Toaster />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'