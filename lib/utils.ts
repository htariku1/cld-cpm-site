import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "2-digit",
  }
  return date.toLocaleDateString("en-US", options)
}

export function getHealthLabel(health: string): string {
  switch (health) {
    case "Good":
      return "On Track"
    case "At Risk":
      return "At Risk"
    case "Critical":
      return "Delayed"
    default:
      return health
  }
}

export function getHealthColor(health: string): string {
  switch (health) {
    case "Good":
    case "On Track":
      return "bg-green-100 text-green-800"
    case "At Risk":
      return "bg-yellow-100 text-yellow-800"
    case "Critical":
    case "Delayed":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800"
    case "in progress":
      return "bg-blue-100 text-blue-800"
    case "planning":
      return "bg-yellow-100 text-yellow-800"
    case "not started":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}
