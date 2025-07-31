import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <Navbar />
      {children}
    </ProtectedRoute>
  )
} 