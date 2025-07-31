"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronDown, LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRef } from "react"
import { useFirebaseAuth } from "@/lib/firebase-auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useFirebaseAuth()
  const [deploymentOpen, setDeploymentOpen] = useState(false)
  const [sustainmentOpen, setSustainmentOpen] = useState(false)
  // Add refs for close timeouts
  const deploymentTimeout = useRef<NodeJS.Timeout | null>(null)
  const sustainmentTimeout = useRef<NodeJS.Timeout | null>(null)

  // Helper functions for delayed close
  const openDeployment = () => {
    if (deploymentTimeout.current) clearTimeout(deploymentTimeout.current)
    setDeploymentOpen(true)
  }
  const closeDeployment = () => {
    deploymentTimeout.current = setTimeout(() => setDeploymentOpen(false), 150)
  }
  const openSustainment = () => {
    if (sustainmentTimeout.current) clearTimeout(sustainmentTimeout.current)
    setSustainmentOpen(true)
  }
  const closeSustainment = () => {
    sustainmentTimeout.current = setTimeout(() => setSustainmentOpen(false), 150)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center pl-4 pr-4 w-full">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/" className="mr-8 flex items-center space-x-2 pl-0 whitespace-nowrap">
                <span className="font-bold text-black text-lg md:text-xl">CL-D CPM</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Contested Logistics (Distribution) Capability Portfolio Management</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <nav className="flex items-center space-x-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/" ? "text-black" : "text-muted-foreground",
            )}
          >
            Home
          </Link>

          {/* Deployment Dropdown */}
          <div className="relative">
            <Link
              href="/deployment"
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith("/deployment") ? "text-black" : "text-muted-foreground",
              )}
              onMouseEnter={openDeployment}
              onMouseLeave={closeDeployment}
            >
              Deployment
              <ChevronDown className="ml-1 h-4 w-4" />
            </Link>
            {deploymentOpen && (
              <div
                className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                onMouseEnter={openDeployment}
                onMouseLeave={closeDeployment}
              >
                <div className="py-1">
                  <Link href="/deployment/cpmr" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    CPMR
                  </Link>
                  <Link href="/deployment/iapr" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    IAPR
                  </Link>
                  <Link href="/deployment/tmtr" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    TMTR
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sustainment Dropdown */}
          <div className="relative">
            <Link
              href="/sustainment"
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith("/sustainment") ? "text-black" : "text-muted-foreground",
              )}
              onMouseEnter={openSustainment}
              onMouseLeave={closeSustainment}
            >
              Sustainment
              <ChevronDown className="ml-1 h-4 w-4" />
            </Link>
            {sustainmentOpen && (
              <div
                className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                onMouseEnter={openSustainment}
                onMouseLeave={closeSustainment}
              >
                <div className="py-1">
                  <Link href="/sustainment/cpmr" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    CPMR
                  </Link>
                  <Link href="/sustainment/iapr" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    IAPR
                  </Link>
                  <Link href="/sustainment/tmtr" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    TMTR
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/portfolio-management"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/portfolio-management" ? "text-black" : "text-muted-foreground",
            )}
          >
            Portfolio Management
          </Link>

          <Link
            href="/export-center"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/export-center" ? "text-black" : "text-muted-foreground",
            )}
          >
            Brief Generator
          </Link>
        </nav>

        {/* User Menu */}
        {user && (
          <div className="ml-auto flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={logout} className="flex items-center space-x-2">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  )
}
