import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { DataProvider } from "@/lib/data-context"

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
        <DataProvider>
          <Navbar />
          {children}
        </DataProvider>
      </body>
    </html>
  )
}
