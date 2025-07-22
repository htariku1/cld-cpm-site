"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

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
  issues: string[] | number // allow issues to be a number or string[]
  requirements?: string // optional field for sustainment tasks
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
  overallHealth: "Good" | "At Risk" | "Critical"
}

interface DataContextType {
  loes: LOE[]
  tasks: Task[]
  milestones: Milestone[]
  addLOE: (loe: LOE) => void
  addTask: (task: Task) => void
  addMilestone: (milestone: Milestone) => void
  calculateOverallHealth: (loeId: string) => "Good" | "At Risk" | "Critical"
  getTaskCountForLOE: (loeId: string) => number
  getDurationInDays: (startDate: string, endDate: string) => number
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Sample data with updated structure
const sampleLOEs: LOE[] = [
  {
    id: "loe-1",
    name: "LOE 1: Capture Capability Requirements and Current Solutions",
    purpose: "Identify mission needs, capability requirements, and current solutions",
    startDate: "2025-07-01",
    endDate: "2025-10-31",
    deliverable: "Capability Requirements Portfolio",
    leadOrg: "CPMR",
    supportingOrg: "IAPR, TMTR",
    cpmrContributions:
      "Identify CRs from JCCL (JWC 3.0, KOPS, CRCs, etc.), assess against reference architecture/design",
    iaprContributions:
      "Provide current & emerging acquisition solutions aligned to JCCL CRs (Supply Classes III, V, VIII)",
    tmtrContributions: "Offer tech modernization solutions; inventory R&D initiatives and modernizable PORs",
    overallHealth: "Good",
  },
  {
    id: "loe-2",
    name: "LOE 2: Gap and Current Solutions Health Analysis",
    purpose: "Assess gaps, solution health, and programmatic risk",
    startDate: "2025-09-01",
    endDate: "2026-01-31",
    deliverable: "Gap Analysis and Health Assessment Report",
    leadOrg: "CPMR",
    supportingOrg: "IAPR, TMTR",
    cpmrContributions: "Trace capability requirements to solutions and gaps",
    iaprContributions: "Assess health/risk of acquisition programs to inform investment/divestment",
    tmtrContributions: "Assess risk of R&D initiatives in terms of timely delivery of tech/functionality",
    overallHealth: "At Risk",
  },
  {
    id: "loe-3",
    name: "LOE 3: Solutions Options Development",
    purpose: "Identify solution options and alternatives to close gaps and mitigate risk",
    startDate: "2026-01-01",
    endDate: "2026-03-31",
    deliverable: "Solutions Options Portfolio",
    leadOrg: "IAPR, TMTR",
    supportingOrg: "CPMR",
    cpmrContributions: "Provide capability solution options traced to CRs and gaps",
    iaprContributions: "Identify alternative and commercial solutions; highlight duplicates or misaligned solutions",
    tmtrContributions: "Identify innovative alternatives to close high-risk gaps or render capabilities obsolete",
    overallHealth: "Good",
  },
  {
    id: "loe-4",
    name: "LOE 4: Synthesize All Risks for Decision Support",
    purpose: "Weigh risks and opportunities within the tradespace",
    startDate: "2026-02-15",
    endDate: "2026-04-30",
    deliverable: "Risk Synthesis and Decision Support Package",
    leadOrg: "CPMR, IAPR, TMTR",
    supportingOrg: "—",
    cpmrContributions: "Assess operational/residual risk per capability solution across time horizons",
    iaprContributions: "Recommend acquisition approaches; highlight risks, alternatives, and divestments",
    tmtrContributions: "Prioritize R&D/alternatives to meet CRs with categorized risk levels (high to low)",
    overallHealth: "Good",
  },
]

export const sampleTasks: Task[] = [
  {
    id: "task-1",
    name: "Requirements Analysis",
    owner: "John Smith",
    loeId: "loe-1",
    description: "Analyze current capability requirements",
    startDate: "2025-07-15",
    endDate: "2025-09-30",
    status: "In Progress",
    deliverable: "Requirements Document",
    type: "formal",
    category: "deployment",
    assignedTypes: ["CPMR", "IAPR"],
    internalCoord: ["JS J4", "OSD ER&O"],
    externalCoord: ["Army", "Navy"],
    issues: ["Resource allocation pending", "Timeline constraints"],
  },
  {
    id: "task-2",
    name: "Solution Assessment",
    owner: "Jane Doe",
    loeId: "loe-1",
    description: "Assess current acquisition solutions",
    startDate: "2025-08-15",
    endDate: "2025-10-15",
    status: "Not Started",
    deliverable: "Assessment Report",
    type: "formal",
    category: "sustainment",
    assignedTypes: ["IAPR"],
    internalCoord: ["OSD (MR)"],
    externalCoord: ["Air Force", "USTRANSCOM"],
    issues: [],
  },
  {
    id: "task-3",
    name: "Gap Analysis",
    owner: "John Smith",
    loeId: "loe-2",
    description: "Comprehensive gap analysis",
    startDate: "2025-09-01",
    endDate: "2025-12-15",
    status: "Planning",
    deliverable: "Gap Analysis Report",
    type: "formal",
    category: "deployment",
    assignedTypes: ["CPMR", "TMTR"],
    internalCoord: ["JS J4"],
    externalCoord: ["Army", "USCENTCOM"],
    issues: ["Data collection challenges"],
  },
  {
    id: "task-4",
    name: "Risk Assessment",
    owner: "Jane Doe",
    loeId: "loe-2",
    description: "Assess programmatic risks",
    startDate: "2025-11-01",
    endDate: "2026-01-31",
    status: "Not Started",
    deliverable: "Risk Assessment Report",
    type: "formal",
    category: "sustainment",
    assignedTypes: ["CPMR", "IAPR", "TMTR"],
    internalCoord: ["JS J4", "OSD (Log)"],
    externalCoord: ["Marines", "USINDOPACOM"],
    issues: [],
  },
  // Example sustainment task with requirements and type as 'cpmr'
  {
    id: "task-5",
    name: "Sustainment Requirements Analysis",
    owner: "John Smith",
    loeId: "loe-1",
    description: "Analyze sustainment capability requirements for long-term operations",
    startDate: "2024-01-20",
    endDate: "2024-03-10",
    status: "In Progress",
    deliverable: "Sustainment Requirements Document",
    type: "cpmr",
    issues: 2,
    requirements: "Long-term sustainment capability requirements",
    internalCoord: ["JS J4", "OSD (Log)"],
    externalCoord: ["Army", "Navy", "USTRANSCOM"],
  },
  // Additional sample tasks
  {
    id: "task-6",
    name: "Digital Tool Selection",
    owner: "Jane Doe",
    loeId: "loe-5",
    description: "Evaluate and select digital tools for transformation",
    startDate: "2026-05-10",
    endDate: "2026-06-15",
    status: "Planning",
    deliverable: "Tool Selection Report",
    type: "tmtr",
    category: "deployment",
    assignedTypes: ["TMTR"],
    internalCoord: ["OSD (Log)", "JS J4"],
    externalCoord: ["Army", "Navy"],
    issues: ["Vendor evaluation pending"],
  },
  {
    id: "task-7",
    name: "Process Mapping",
    owner: "John Smith",
    loeId: "loe-5",
    description: "Map current processes for digital upgrade",
    startDate: "2026-05-15",
    endDate: "2026-06-30",
    status: "In Progress",
    deliverable: "Process Maps",
    type: "cpmr",
    category: "deployment",
    assignedTypes: ["CPMR"],
    internalCoord: ["OSD ER&O"],
    externalCoord: ["USSPACECOM"],
    issues: [],
  },
  {
    id: "task-8",
    name: "Interagency Workshop",
    owner: "Jane Doe",
    loeId: "loe-6",
    description: "Conduct workshop with partner agencies",
    startDate: "2026-09-10",
    endDate: "2026-09-12",
    status: "Not Started",
    deliverable: "Workshop Summary",
    type: "iapr",
    category: "sustainment",
    assignedTypes: ["IAPR", "CPMR"],
    internalCoord: ["OSD (MR)"],
    externalCoord: ["USEUCOM", "USINDOPACOM"],
    issues: ["Scheduling conflicts"],
  },
  {
    id: "task-9",
    name: "Technical Interoperability Assessment",
    owner: "John Smith",
    loeId: "loe-6",
    description: "Assess technical interoperability with partners",
    startDate: "2026-10-01",
    endDate: "2026-11-15",
    status: "Planning",
    deliverable: "Interoperability Report",
    type: "tmtr",
    category: "sustainment",
    assignedTypes: ["TMTR"],
    internalCoord: ["OSD(R&E)-MDJO"],
    externalCoord: ["NATO", "Allied Command"],
    issues: [],
  },
  // More diverse sample tasks
  {
    id: "task-10",
    name: "Supply Chain Optimization",
    owner: "Jane Doe",
    loeId: "loe-2",
    description: "Optimize supply chain processes for efficiency",
    startDate: "2026-01-10",
    endDate: "2026-02-20",
    status: "In Progress",
    deliverable: "Optimization Report",
    type: "iapr",
    category: "sustainment",
    assignedTypes: ["IAPR"],
    internalCoord: ["OSD (Log)", "JS J4"],
    externalCoord: ["USEUCOM"],
    issues: ["Data integration issues"],
  },
  {
    id: "task-11",
    name: "Risk Communication Plan",
    owner: "John Smith",
    loeId: "loe-4",
    description: "Develop a communication plan for risk reporting",
    startDate: "2026-03-01",
    endDate: "2026-03-15",
    status: "Planning",
    deliverable: "Communication Plan",
    type: "cpmr",
    category: "deployment",
    assignedTypes: ["CPMR", "IAPR"],
    internalCoord: ["OSD ER&O"],
    externalCoord: ["USINDOPACOM"],
    issues: [],
  },
  {
    id: "task-12",
    name: "Technology Pilot Program",
    owner: "Jane Doe",
    loeId: "loe-3",
    description: "Pilot new technology solutions in a controlled environment",
    startDate: "2026-02-01",
    endDate: "2026-03-01",
    status: "Not Started",
    deliverable: "Pilot Results",
    type: "tmtr",
    category: "deployment",
    assignedTypes: ["TMTR"],
    internalCoord: ["OSD(R&E)-MDJO"],
    externalCoord: ["Army", "Navy"],
    issues: ["Awaiting equipment delivery"],
  },
  {
    id: "task-13",
    name: "Acquisition Strategy Review",
    owner: "John Smith",
    loeId: "loe-2",
    description: "Review and update acquisition strategies for new requirements",
    startDate: "2026-01-15",
    endDate: "2026-02-28",
    status: "In Progress",
    deliverable: "Strategy Document",
    type: "iapr",
    category: "sustainment",
    assignedTypes: ["IAPR"],
    internalCoord: ["OSD (MR)"],
    externalCoord: ["Marines"],
    issues: [],
  },
  {
    id: "task-14",
    name: "Gap Closure Analysis",
    owner: "Jane Doe",
    loeId: "loe-3",
    description: "Analyze and report on closure of identified capability gaps",
    startDate: "2026-03-10",
    endDate: "2026-04-10",
    status: "Planning",
    deliverable: "Gap Closure Report",
    type: "cpmr",
    category: "deployment",
    assignedTypes: ["CPMR"],
    internalCoord: ["JS J4"],
    externalCoord: ["USCENTCOM"],
    issues: ["Pending data from field units"],
  },
]

const sampleMilestones: Milestone[] = [
  {
    id: "milestone-1",
    name: "Requirements Review",
    description: "Review of all capability requirements",
    date: "2025-09-30",
    leadOrg: "CPMR",
    supportingOrg: "IAPR, TMTR",
    deliverable: "Approved Requirements",
    loeIds: ["loe-1"],
  },
  {
    id: "milestone-2",
    name: "Gap Analysis Complete",
    description: "Completion of gap analysis phase",
    date: "2025-12-15",
    leadOrg: "CPMR",
    supportingOrg: "IAPR, TMTR",
    deliverable: "Gap Analysis Report",
    loeIds: ["loe-2"],
  },
  {
    id: "milestone-3",
    name: "Solutions Review",
    description: "Review of proposed solutions",
    date: "2026-03-15",
    leadOrg: "IAPR, TMTR",
    supportingOrg: "CPMR",
    deliverable: "Solutions Recommendations",
    loeIds: ["loe-3"],
  },
  {
    id: "milestone-4",
    name: "Final Risk Assessment",
    description: "Final assessment of all risks",
    date: "2026-04-15",
    leadOrg: "CPMR, IAPR, TMTR",
    supportingOrg: "—",
    deliverable: "Final Risk Report",
    loeIds: ["loe-4"],
  },
  // Additional sample milestones
  {
    id: "milestone-5",
    name: "Digital Transformation Kickoff",
    description: "Kickoff meeting for digital transformation initiatives",
    date: "2026-05-01",
    leadOrg: "TMTR",
    supportingOrg: "CPMR, IAPR",
    deliverable: "Kickoff Agenda",
    loeIds: ["loe-5"],
  },
  {
    id: "milestone-6",
    name: "Interagency Collaboration Workshop",
    description: "Workshop with partner agencies and allies",
    date: "2026-09-10",
    leadOrg: "IAPR",
    supportingOrg: "CPMR, TMTR",
    deliverable: "Workshop Summary",
    loeIds: ["loe-6"],
  },
  // More diverse sample milestones
  {
    id: "milestone-7",
    name: "Supply Chain Optimization Complete",
    description: "Completion of supply chain optimization efforts",
    date: "2026-02-20",
    leadOrg: "IAPR",
    supportingOrg: "CPMR, TMTR",
    deliverable: "Optimization Report",
    loeIds: ["loe-2"],
  },
  {
    id: "milestone-8",
    name: "Risk Communication Plan Approved",
    description: "Approval of the risk communication plan by leadership",
    date: "2026-03-16",
    leadOrg: "CPMR",
    supportingOrg: "IAPR",
    deliverable: "Approved Communication Plan",
    loeIds: ["loe-4"],
  },
  {
    id: "milestone-9",
    name: "Technology Pilot Program Launch",
    description: "Launch of the technology pilot program",
    date: "2026-02-01",
    leadOrg: "TMTR",
    supportingOrg: "CPMR, IAPR",
    deliverable: "Pilot Launch Agenda",
    loeIds: ["loe-3"],
  },
  {
    id: "milestone-10",
    name: "Gap Closure Analysis Complete",
    description: "Completion of gap closure analysis and reporting",
    date: "2026-04-10",
    leadOrg: "CPMR",
    supportingOrg: "IAPR, TMTR",
    deliverable: "Gap Closure Report",
    loeIds: ["loe-3"],
  },
]

export function DataProvider({ children }: { children: ReactNode }) {
  const [loes, setLOEs] = useState<LOE[]>(sampleLOEs)
  const [tasks, setTasks] = useState<Task[]>(sampleTasks)
  const [milestones, setMilestones] = useState<Milestone[]>(sampleMilestones)

  const addLOE = (loe: LOE) => {
    setLOEs((prev) => [...prev, loe])
  }

  const addTask = (task: Task) => {
    setTasks((prev) => [...prev, task])
  }

  const addMilestone = (milestone: Milestone) => {
    setMilestones((prev) => [...prev, milestone])
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
