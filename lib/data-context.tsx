"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"

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
  dependsOn?: string[] // IDs of tasks/milestones this task depends on
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
  dependsOn?: string[] // IDs of tasks/milestones this milestone depends on
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
  taskIds: string[]
  milestoneIds: string[]
}

interface DataContextType {
  loes: LOE[]
  tasks: Task[]
  milestones: Milestone[]
  addLOE: (loe: LOE) => void
  addTask: (task: Task) => void
  addMilestone: (milestone: Milestone) => void
  updateTask: (id: string, updates: Partial<Task>) => void // NEW
  updateMilestone: (id: string, updates: Partial<Milestone>) => void
  deleteLOE: (id: string) => void
  deleteTask: (id: string) => void
  deleteMilestone: (id: string) => void
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

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedLOEs = localStorage.getItem("portfolio_loes")
      if (storedLOEs) setLOEs(JSON.parse(storedLOEs))
    } catch (e) {
      console.error('Failed to parse LOEs from localStorage', e)
      setLOEs([])
    }
    try {
      const storedTasks = localStorage.getItem("portfolio_tasks")
      if (storedTasks) setTasks(JSON.parse(storedTasks))
    } catch (e) {
      console.error('Failed to parse Tasks from localStorage', e)
      setTasks([])
    }
    try {
      const storedMilestones = localStorage.getItem("portfolio_milestones")
      if (storedMilestones) setMilestones(JSON.parse(storedMilestones))
    } catch (e) {
      console.error('Failed to parse Milestones from localStorage', e)
      setMilestones([])
    }
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("portfolio_loes", JSON.stringify(loes))
  }, [loes])
  useEffect(() => {
    localStorage.setItem("portfolio_tasks", JSON.stringify(tasks))
  }, [tasks])
  useEffect(() => {
    localStorage.setItem("portfolio_milestones", JSON.stringify(milestones))
  }, [milestones])

  const addLOE = (loe: LOE) => {
    setLOEs((prev) => [...prev, { ...loe, taskIds: loe.taskIds || [], milestoneIds: loe.milestoneIds || [] }])
  }

  const addTask = (task: Task) => {
    setTasks((prev) => [...prev, task])
    setLOEs((prev) => prev.map(loe => loe.id === task.loeId ? { ...loe, taskIds: [...(loe.taskIds || []), task.id] } : loe))
  }

  const addMilestone = (milestone: Milestone) => {
    setMilestones((prev) => [...prev, milestone])
    setLOEs((prev) => prev.map(loe => milestone.loeIds.includes(loe.id) ? { ...loe, milestoneIds: [...(loe.milestoneIds || []), milestone.id] } : loe))
  }

  // NEW: updateTask implementation
  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    )
    // If loeId changes, update LOE taskIds arrays
    setLOEs((prev) => {
      let oldLoeId: string | undefined;
      prev.forEach(loe => {
        if (loe.taskIds.includes(id)) oldLoeId = loe.id;
      });
      return prev.map(loe => {
        // Remove from old LOE
        if (oldLoeId && loe.id === oldLoeId && updates.loeId && updates.loeId !== oldLoeId) {
          return { ...loe, taskIds: loe.taskIds.filter(tid => tid !== id) };
        }
        // Add to new LOE
        if (updates.loeId && loe.id === updates.loeId && (!loe.taskIds.includes(id))) {
          return { ...loe, taskIds: [...loe.taskIds, id] };
        }
        return loe;
      });
    });
  }

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    setMilestones((prev) =>
      prev.map((milestone) => (milestone.id === id ? { ...milestone, ...updates } : milestone))
    )
    // If loeIds change, update LOE milestoneIds arrays
    if (updates.loeIds) {
      setLOEs((prev) => {
        return prev.map(loe => {
          // Remove milestone from LOEs no longer associated
          const wasLinked = prev.find(l => l.id === loe.id)?.milestoneIds.includes(id);
          const shouldBeLinked = updates.loeIds?.includes(loe.id);
          if (wasLinked && !shouldBeLinked) {
            return { ...loe, milestoneIds: loe.milestoneIds.filter(mid => mid !== id) };
          }
          // Add milestone to new LOEs
          if (!wasLinked && shouldBeLinked) {
            return { ...loe, milestoneIds: [...loe.milestoneIds, id] };
          }
          return loe;
        });
      });
    }
  }

  const deleteLOE = (id: string) => {
    setLOEs((prev) => prev.filter((loe) => loe.id !== id))
    // Remove all tasks associated with this LOE
    setTasks((prev) => prev.filter((task) => task.loeId !== id))
    // For milestones, remove this LOE from loeIds, and delete milestone if it becomes orphaned
    setMilestones((prev) => prev
      .map((milestone) => ({ ...milestone, loeIds: milestone.loeIds.filter(lid => lid !== id) }))
      .filter((milestone) => milestone.loeIds.length > 0)
    );
  }
  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
    setLOEs((prev) => prev.map(loe => ({ ...loe, taskIds: loe.taskIds.filter(tid => tid !== id) })))
    // Remove this task from any dependsOn arrays in other tasks and milestones
    setTasks((prev) => prev.map(task => ({ ...task, dependsOn: (task.dependsOn || []).filter(depId => depId !== id) })))
    setMilestones((prev) => prev.map(milestone => ({ ...milestone, dependsOn: (milestone.dependsOn || []).filter(depId => depId !== id) })))
  }
  const deleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((milestone) => milestone.id !== id))
    setLOEs((prev) => prev.map(loe => ({ ...loe, milestoneIds: loe.milestoneIds.filter(mid => mid !== id) })))
    // Remove this milestone from any dependsOn arrays in tasks and milestones
    setTasks((prev) => prev.map(task => ({ ...task, dependsOn: (task.dependsOn || []).filter(depId => depId !== id) })))
    setMilestones((prev) => prev.map(milestone => ({ ...milestone, dependsOn: (milestone.dependsOn || []).filter(depId => depId !== id) })))
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
        addLOE,
        addTask,
        addMilestone,
        updateTask, // NEW
        updateMilestone,
        deleteLOE,
        deleteTask,
        deleteMilestone,
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
