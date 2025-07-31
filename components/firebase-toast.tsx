"use client"

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  message?: string
}

export function useFirebaseToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const showSuccess = (title: string, message?: string) => {
    const id = Date.now().toString()
    const toastMessage: ToastMessage = { id, type: 'success', title, message }
    setMessages(prev => [...prev, toastMessage])
    
    toast.success(title, {
      description: message,
      icon: <CheckCircle className="h-4 w-4" />,
      duration: 4000,
    })
  }

  const showError = (title: string, message?: string) => {
    const id = Date.now().toString()
    const toastMessage: ToastMessage = { id, type: 'error', title, message }
    setMessages(prev => [...prev, toastMessage])
    
    toast.error(title, {
      description: message,
      icon: <XCircle className="h-4 w-4" />,
      duration: 6000,
    })
  }

  const showInfo = (title: string, message?: string) => {
    const id = Date.now().toString()
    const toastMessage: ToastMessage = { id, type: 'info', title, message }
    setMessages(prev => [...prev, toastMessage])
    
    toast.info(title, {
      description: message,
      icon: <AlertCircle className="h-4 w-4" />,
      duration: 4000,
    })
  }

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }

  // Auto-remove messages after 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setMessages(prev => prev.filter(msg => 
        Date.now() - parseInt(msg.id) < 10000
      ))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return {
    showSuccess,
    showError,
    showInfo,
    removeMessage,
    messages
  }
}

// Predefined toast messages for common Firebase operations
export const firebaseToastMessages = {
  loe: {
    created: "LOE created successfully",
    updated: "LOE updated successfully",
    deleted: "LOE deleted successfully",
    error: "Failed to save LOE",
    deleteError: "Failed to delete LOE"
  },
  task: {
    created: "Task created successfully",
    updated: "Task updated successfully",
    deleted: "Task deleted successfully",
    error: "Failed to save task",
    deleteError: "Failed to delete task"
  },
  milestone: {
    created: "Milestone created successfully",
    updated: "Milestone updated successfully",
    deleted: "Milestone deleted successfully",
    error: "Failed to save milestone",
    deleteError: "Failed to delete milestone"
  },
  connection: {
    error: "Database connection failed",
    retry: "Retrying connection...",
    success: "Connected to database"
  }
} 