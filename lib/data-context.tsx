"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"
import { loeService, taskService, milestoneService, initializeDatabase } from "./firebase-service"
import { documentsService, DocumentMetadata } from "./documents-service"

export interface Task {
  id: string
  name: string
  owner: string
  loeId: string
  description: string
  startDate: string
  endDate: string
  status: string
  deliverable: string
  type: string // allow any string for type (e.g., 'cpmr', 'iapr', 'tmtr', 'formal', 'informal')
  category?: "sustainment" | "deployment"
  assignedTypes?: ("CPMR" | "IAPR" | "TMTR")[]
  internalCoord?: string[]
  externalCoord?: string[]
  issues: { text: string, remedy?: string }[]
  requirements?: string // optional field for sustainment tasks
  remedy?: string // optional field for remedy/solution
}

export interface Milestone {
  id: string
  name: string
  description: string
  date: string
  leadOrg: string
  supportingOrg: string
  deliverable: string
  loeIds: string[]
}

export interface LOE {
  id: string
  name: string
  purpose: string
  startDate: string
  endDate: string
  deliverable: string
  leadOrg: string
  supportingOrg: string
  cpmrContributions: string
  iaprContributions: string
  tmtrContributions: string
  // Removed overallHealth
}

interface DataContextType {
  loes: LOE[]
  tasks: Task[]
  milestones: Milestone[]
  documents: DocumentMetadata[]
  loading: boolean
  addLOE: (loe: Omit<LOE, 'id'>) => Promise<void>
  addTask: (task: Omit<Task, 'id'>) => Promise<void>
  addMilestone: (milestone: Omit<Milestone, 'id'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  updateMilestone: (id: string, updates: Partial<Milestone>) => Promise<void>
  deleteLOE: (id: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  deleteMilestone: (id: string) => Promise<void>
  uploadDocument: (file: File, type: "scoping" | "dodd") => Promise<void>
  downloadDocument: (id: string) => Promise<File | null>
  deleteDocument: (id: string) => Promise<void>
  calculateOverallHealth: (loeId: string) => "Good" | "At Risk" | "Critical"
  getTaskCountForLOE: (loeId: string) => number
  getDurationInDays: (startDate: string, endDate: string) => number
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Remove all sample data arrays

export function DataProvider({ children }: { children: ReactNode }) {
  const [loes, setLOEs] = useState<LOE[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [documents, setDocuments] = useState<DocumentMetadata[]>([])
  const [loading, setLoading] = useState(true)

  // Initialize Firebase and load data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Initialize database with sample data if empty
        await initializeDatabase()
        
        // Set up real-time listeners
        const unsubscribeLOEs = loeService.subscribe((data) => {
          setLOEs(data)
        })
        
        const unsubscribeTasks = taskService.subscribe((data) => {
          setTasks(data)
        })
        
        const unsubscribeMilestones = milestoneService.subscribe((data) => {
          setMilestones(data)
        })
        
        const unsubscribeDocuments = documentsService.subscribe((data) => {
          setDocuments(data)
        })
        
        setLoading(false)
        
        // Cleanup listeners on unmount
        return () => {
          unsubscribeLOEs()
          unsubscribeTasks()
          unsubscribeMilestones()
          unsubscribeDocuments()
        }
      } catch (error) {
        console.error("Error initializing data:", error)
        setLoading(false)
      }
    }

    initializeData()
  }, [])

  const addLOE = async (loe: Omit<LOE, 'id'>) => {
    try {
      await loeService.add(loe)
    } catch (error) {
      console.error("Error adding LOE:", error)
      throw error
    }
  }

  const addTask = async (task: Omit<Task, 'id'>) => {
    try {
      await taskService.add(task)
    } catch (error) {
      console.error("Error adding task:", error)
      throw error
    }
  }

  const addMilestone = async (milestone: Omit<Milestone, 'id'>) => {
    try {
      await milestoneService.add(milestone)
    } catch (error) {
      console.error("Error adding milestone:", error)
      throw error
    }
  }

  // NEW: updateTask implementation
  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      await taskService.update(id, updates)
    } catch (error) {
      console.error("Error updating task:", error)
      throw error
    }
  }

  const updateMilestone = async (id: string, updates: Partial<Milestone>) => {
    try {
      await milestoneService.update(id, updates)
    } catch (error) {
      console.error("Error updating milestone:", error)
      throw error
    }
  }

  const deleteLOE = async (id: string) => {
    try {
      await loeService.delete(id)
      // Also delete associated tasks and milestones
      const associatedTasks = tasks.filter(task => task.loeId === id)
      const associatedMilestones = milestones.filter(milestone => milestone.loeIds.includes(id))
      
      for (const task of associatedTasks) {
        await taskService.delete(task.id)
      }
      for (const milestone of associatedMilestones) {
        await milestoneService.delete(milestone.id)
      }
    } catch (error) {
      console.error("Error deleting LOE:", error)
      throw error
    }
  }
  
  const deleteTask = async (id: string) => {
    try {
      await taskService.delete(id)
    } catch (error) {
      console.error("Error deleting task:", error)
      throw error
    }
  }
  
  const deleteMilestone = async (id: string) => {
    try {
      await milestoneService.delete(id)
    } catch (error) {
      console.error("Error deleting milestone:", error)
      throw error
    }
  }

  // Document operations
  const uploadDocument = async (file: File, type: "scoping" | "dodd") => {
    try {
      await documentsService.uploadDocument(file, type)
    } catch (error) {
      console.error("Error uploading document:", error)
      throw error
    }
  }

  const downloadDocument = async (id: string) => {
    try {
      return await documentsService.downloadDocument(id)
    } catch (error) {
      console.error("Error downloading document:", error)
      throw error
    }
  }

  const deleteDocument = async (id: string) => {
    try {
      await documentsService.deleteDocument(id)
    } catch (error) {
      console.error("Error deleting document:", error)
      throw error
    }
  }

  const calculateOverallHealth = (loeId: string): "Good" | "At Risk" | "Critical" => {
    const loeTasks = tasks.filter((task) => task.loeId === loeId)
    if (loeTasks.length === 0) return "Good"

    const healthScores = { Good: 3, "At Risk": 2, Critical: 1 }
    const taskHealthScores = loeTasks.map(() => 3) // Simplified for now
    const avgScore = taskHealthScores.reduce((a, b) => a + b, 0) / taskHealthScores.length

    if (avgScore >= 2.5) return "Good"
    if (avgScore >= 1.5) return "At Risk"
    return "Critical"
  }

  const getTaskCountForLOE = (loeId: string): number => {
    return tasks.filter((task) => task.loeId === loeId).length
  }

  const getDurationInDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <DataContext.Provider
      value={{
        loes,
        tasks,
        milestones,
        documents,
        loading,
        addLOE,
        addTask,
        addMilestone,
        updateTask,
        updateMilestone,
        deleteLOE,
        deleteTask,
        deleteMilestone,
        uploadDocument,
        downloadDocument,
        deleteDocument,
        calculateOverallHealth,
        getTaskCountForLOE,
        getDurationInDays,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
