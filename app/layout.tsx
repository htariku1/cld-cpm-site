import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { DataProvider } from "@/lib/data-context"
import { FirebaseAuthProvider } from "@/lib/firebase-auth-context"
import { ErrorBoundary, FirebaseErrorFallback } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CL-D CPM - Contested Logistics Distribution Capability Portfolio Management",
  description: "Comprehensive assessment of joint logistics distribution capabilities",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary fallback={FirebaseErrorFallback}>
          <FirebaseAuthProvider>
            <DataProvider>
              {children}
              <Toaster />
            </DataProvider>
          </FirebaseAuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
