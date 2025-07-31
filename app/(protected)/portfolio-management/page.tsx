"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, FileText, Target, CheckSquare, Calendar, ChevronDown, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useData } from "@/lib/data-context"
import { formatDate, getHealthColor, getHealthLabel, getStatusColor } from "@/lib/utils"
import { LOECard } from "@/components/loe-card"
import { TaskCard } from "@/components/task-card"
import { MilestoneCard } from "@/components/milestone-card"
import { calculateLOEHealth } from "@/lib/health-utils"
import { Calendar as UiCalendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { format, parse } from "date-fns"
import { TaskForm } from "@/components/task-form"
import { useRef } from "react"
import { v4 as uuidv4 } from 'uuid'
import { LOEForm } from "@/components/loe-form";
import { useFirebaseToast, firebaseToastMessages } from "@/components/firebase-toast";

export default function PortfolioManagementPage() {
  const { loes, tasks, milestones, loading, addTask, addLOE, addMilestone } = useData()
  const { showSuccess, showError } = useFirebaseToast()
  
  // All useState hooks must be called before any conditional returns
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createType, setCreateType] = useState<"loe" | "milestone" | "task" | null>(null)
  const [taskType, setTaskType] = useState<"formal" | "informal" | null>(null)
  const [expandedLOE, setExpandedLOE] = useState<string | null>(null)
  const [selectedLOE, setSelectedLOE] = useState<any>(null)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null)
  const [selectedLOEs, setSelectedLOEs] = useState<string[]>([])
  const [showIssueInput, setShowIssueInput] = useState(false)
  const [issueInput, setIssueInput] = useState("")
  const [issues, setIssues] = useState<string[]>([])
  const [selectedOtherOrgs, setSelectedOtherOrgs] = useState<string[]>([])
  const [otherOrgSelect, setOtherOrgSelect] = useState("")
  const [showOtherOrgInput, setShowOtherOrgInput] = useState(false)
  const [otherOrgInput, setOtherOrgInput] = useState("")
  const [showSubtaskInput, setShowSubtaskInput] = useState(false)
  const [subtaskInput, setSubtaskInput] = useState("")
  const [subtasks, setSubtasks] = useState<string[]>([])
  const [taskCategory, setTaskCategory] = useState<"deployment" | "sustainment" | "">("")
  const [activeTab, setActiveTab] = useState<string>("loes")
  const [assignedTypes, setAssignedTypes] = useState<string[]>([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loeIds, setLoeIds] = useState<string[]>([])
  const [associatedMilestones, setAssociatedMilestones] = useState<string[]>([])
  const [internalCoord, setInternalCoord] = useState<string[]>([])
  const [externalCoord, setExternalCoord] = useState<string[]>([])

  // You can customize this list as needed
  const otherOrgOptions = ["DARPA", "DTRA", "NGA", "NSA", "DOE", "DHS"]

  const internalCoordOptions = ["JS J4", "OSD ER&O", "OSD (Log)", "OSD (MR)", "OSD(R&E)-MDJO"]

  const externalCoordOptions = {
    mildeps: ["Army", "Navy", "Space Force", "Air Force", "Marines"],
    commands: [
      "USAFRICOM",
      "USCENTCOM",
      "USEUCOM",
      "USINDOPACOM",
      "USNORTHCOM",
      "USSOUTHCOM",
      "USCYBERCOM",
      "USSPACECOM",
      "USSOCOM",
      "USSTRATCOM",
      "USTRANSCOM",
    ],
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading portfolio data...</p>
          </div>
        </div>
      </div>
    )
  }

  const resetDialog = () => {
    setCreateDialogOpen(false)
    setCreateType(null)
    setTaskType(null)
    setTaskCategory("")
  }

  const getTasksForLOE = (loeId: string) => {
    return tasks.filter((task) => task.loeId === loeId)
  }

  const getMilestonesForLOE = (loeId: string) => {
    return milestones.filter((milestone) => milestone.loeIds.includes(loeId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Portfolio Management</h1>
          <Dialog
            open={createDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                resetDialog();
              } else {
                setCreateDialogOpen(true);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Item</DialogTitle>
                <DialogDescription>Choose what type of item you want to create</DialogDescription>
              </DialogHeader>

              {!createType && (
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setCreateType("loe")}
                  >
                    <CardHeader className="text-center">
                      <FileText className="h-12 w-12 mx-auto text-blue-500 mb-2" />
                      <CardTitle>LOE</CardTitle>
                      <CardDescription>Line of Effort</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setCreateType("milestone")}
                  >
                    <CardHeader className="text-center">
                      <Target className="h-12 w-12 mx-auto text-green-500 mb-2" />
                      <CardTitle>Milestone</CardTitle>
                      <CardDescription>Project Milestone</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setCreateType("task")}
                  >
                    <CardHeader className="text-center">
                      <CheckSquare className="h-12 w-12 mx-auto text-orange-500 mb-2" />
                      <CardTitle>Task</CardTitle>
                      <CardDescription>Formal or Informal Task</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              )}

              {createType === "loe" && (
                <LOECreateForm onCreate={async (loe) => { 
          try {
            await addLOE(loe); 
            showSuccess(firebaseToastMessages.loe.created);
            resetDialog(); 
          } catch (error) {
            console.error("Error adding LOE:", error);
            showError(firebaseToastMessages.loe.error, error instanceof Error ? error.message : "Unknown error");
          }
        }} onCancel={() => setCreateType(null)} />
              )}

              {createType === "milestone" && (
                <MilestoneCreateForm loes={loes} onCreate={async (milestone) => { 
                  try {
                    await addMilestone(milestone); 
                    showSuccess(firebaseToastMessages.milestone.created);
                    resetDialog(); 
                  } catch (error) {
                    console.error("Error adding milestone:", error);
                    showError(firebaseToastMessages.milestone.error, error instanceof Error ? error.message : "Unknown error");
                  }
                }} onCancel={() => setCreateType(null)} />
              )}

              {createType === "task" && !taskType && (
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold">Select Task Type</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setTaskType("formal")}
                    >
                      <CardHeader className="text-center">
                        <CardTitle>Formal Task</CardTitle>
                        <CardDescription>Comprehensive task with full coordination</CardDescription>
                      </CardHeader>
                    </Card>
                    <Card
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setTaskType("informal")}
                    >
                      <CardHeader className="text-center">
                        <CardTitle>Informal Task</CardTitle>
                        <CardDescription>Simple task with basic information</CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                  <Button variant="outline" onClick={() => setCreateType(null)}>
                    Back
                  </Button>
                </div>
              )}

              {createType === "task" && taskType === "formal" && (
                <TaskForm
                  mode="add"
                  loes={loes}
                  milestones={milestones}
                                      onSubmit={async (newTask) => {
                      try {
                        await addTask(newTask);
                        showSuccess(firebaseToastMessages.task.created);
                      } catch (error) {
                        console.error("Error adding task:", error);
                        showError(firebaseToastMessages.task.error, error instanceof Error ? error.message : "Unknown error");
                      }
                      setActiveTab("tasks");
                      resetDialog();
                    }}
                  onCancel={() => setTaskType(null)}
                />
              )}

              {createType === "task" && taskType === "informal" && (
                <InformalTaskForm onCreate={async (task) => { 
                  try {
                    await addTask(task); 
                    showSuccess(firebaseToastMessages.task.created);
                    setActiveTab("tasks"); 
                    resetDialog(); 
                  } catch (error) {
                    console.error("Error adding task:", error);
                    showError(firebaseToastMessages.task.error, error instanceof Error ? error.message : "Unknown error");
                  }
                }} onCancel={() => setTaskType(null)} />
              )}
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="loes">Lines of Effort</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="loes" className="space-y-6">
            <div className="grid gap-4">
              {loes.map((loe) => {
                const loeTasks = tasks.filter(task => task.loeId === loe.id)
                const calculatedHealth = calculateLOEHealth(loeTasks)
                return (
                  <Card key={loe.id}>
                    <Collapsible
                      open={expandedLOE === loe.id}
                      onOpenChange={() => setExpandedLOE(expandedLOE === loe.id ? null : loe.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg flex items-center gap-2">
                                {expandedLOE === loe.id ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                {loe.name}
                              </CardTitle>
                              <CardDescription className="mt-2">{loe.purpose}</CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getHealthColor(calculatedHealth)}>
                                {getHealthLabel(calculatedHealth)}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedLOE(loe)
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Associated Tasks</h4>
                              {getTasksForLOE(loe.id).length > 0 ? (
                                <div className="space-y-2">
                                  {getTasksForLOE(loe.id).map((task) => (
                                    <div
                                      key={task.id}
                                      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                                      onClick={() => setSelectedTask(task)}
                                    >
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <h5 className="font-medium">{task.name}</h5>
                                            {task.category && (
                                              <Badge variant="secondary" className="text-xs capitalize">
                                                {task.category}
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-xs text-gray-600 mt-1">Assignee: {Array.isArray(task.assignedTypes) && task.assignedTypes.length > 0 ? task.assignedTypes.join(', ') : task.owner}</p>
                                        </div>
                                        <Badge variant="outline">{task.status}</Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500 text-center py-4">No tasks associated with this LOE yet.</p>
                              )}
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Milestones</h4>
                              {getMilestonesForLOE(loe.id).length > 0 ? (
                                <div className="space-y-2">
                                  {getMilestonesForLOE(loe.id).map((milestone) => (
                                    <div 
                                      key={milestone.id} 
                                      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                                      onClick={() => setSelectedMilestone(milestone)}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-orange-500" />
                                        <h5 className="font-medium">{milestone.name}</h5>
                                      </div>
                                      <p className="text-xs text-gray-600 mt-1">{formatDate(milestone.date)}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500 text-center py-4">No milestones for this LOE yet.</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {milestones.map((milestone) => {
                const associatedLOEs = loes.filter((loe) => milestone.loeIds.includes(loe.id))
                return (
                  <Card key={milestone.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedMilestone(milestone)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="mb-2">
                          {formatDate(milestone.date)}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{milestone.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{milestone.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium text-gray-500">Deliverable:</span>
                          <span className="text-sm">{milestone.deliverable}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium text-gray-500">LOE(s):</span>
                          <span className="text-sm">{associatedLOEs.length > 0 ? associatedLOEs.map(loe => loe.name).join(', ') : "None"}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium text-gray-500">Lead:</span>
                          <span className="text-sm">{milestone.leadOrg}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <div className="grid gap-4">
              {/* Group tasks by category */}
              {(() => {
                const deploymentTasks = tasks.filter(task => task.category === 'deployment');
                const sustainmentTasks = tasks.filter(task => task.category === 'sustainment');
                const uncategorizedTasks = tasks.filter(task => !task.category || task.type === 'informal');
                return (
                  <>
                    {deploymentTasks.length > 0 && (
                      <>
                        <h3 className="text-lg font-bold text-black mb-2 mt-4">Deployment</h3>
                        {deploymentTasks.map((task, idx) => {
                          const associatedLOE = loes.find((loe) => loe.id === task.loeId)
                          return (
                            <Card key={task.id || idx} className="overflow-hidden">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {task.category && (
                                      <Badge variant="secondary" className="capitalize">{task.category}</Badge>
                                    )}
                                    <Badge variant={task.type === "formal" ? "default" : "secondary"}>
                                      {task.type === "formal" ? "Formal" : "Informal"}
                                    </Badge>
                                    <Badge className={getStatusColor(task.status)}>{task.status || "Not Started"}</Badge>
                                  </div>
                                  <Button variant="outline" size="sm" onClick={() => setSelectedTask(task)}>
                                    View Details
                                  </Button>
                                </div>
                                <CardTitle className="text-lg mt-2">{task.name}</CardTitle>
                                <CardDescription className="line-clamp-2">{task.description}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                      <span className="text-sm font-medium text-gray-500">Assignee:</span>
                                      <span className="text-sm">{Array.isArray(task.assignedTypes) && task.assignedTypes.length > 0 ? task.assignedTypes.join(', ') : task.owner}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <span className="text-sm font-medium text-gray-500">Timeline:</span>
                                      <span className="text-sm">
                                        {formatDate(task.startDate)} - {formatDate(task.endDate)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                      <span className="text-sm font-medium text-gray-500">LOE:</span>
                                      <span className="text-sm">{associatedLOE?.name || "None"}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <span className="text-sm font-medium text-gray-500">Deliverable:</span>
                                      <span className="text-sm">{task.deliverable}</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </>
                    )}
                    {sustainmentTasks.length > 0 && (
                      <>
                        <h3 className="text-lg font-bold text-black mb-2 mt-4">Sustainment</h3>
                        {sustainmentTasks.map((task, idx) => {
                          const associatedLOE = loes.find((loe) => loe.id === task.loeId)
                          return (
                            <Card key={task.id || idx} className="overflow-hidden">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {task.category && (
                                      <Badge variant="secondary" className="capitalize">{task.category}</Badge>
                                    )}
                                    <Badge variant={task.type === "formal" ? "default" : "secondary"}>
                                      {task.type === "formal" ? "Formal" : "Informal"}
                                    </Badge>
                                    <Badge className={getStatusColor(task.status)}>{task.status || "Not Started"}</Badge>
                                  </div>
                                  <Button variant="outline" size="sm" onClick={() => setSelectedTask(task)}>
                                    View Details
                                  </Button>
                                </div>
                                <CardTitle className="text-lg mt-2">{task.name}</CardTitle>
                                <CardDescription className="line-clamp-2">{task.description}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                      <span className="text-sm font-medium text-gray-500">Assignee:</span>
                                      <span className="text-sm">{Array.isArray(task.assignedTypes) && task.assignedTypes.length > 0 ? task.assignedTypes.join(', ') : task.owner}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <span className="text-sm font-medium text-gray-500">Timeline:</span>
                                      <span className="text-sm">
                                        {formatDate(task.startDate)} - {formatDate(task.endDate)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                      <span className="text-sm font-medium text-gray-500">LOE:</span>
                                      <span className="text-sm">{associatedLOE?.name || "None"}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <span className="text-sm font-medium text-gray-500">Deliverable:</span>
                                      <span className="text-sm">{task.deliverable}</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </>
                    )}
                    {uncategorizedTasks.length > 0 && (
                      <>
                        <h3 className="text-lg font-bold text-black mb-2 mt-4">Uncategorized</h3>
                        {uncategorizedTasks.map((task, idx) => {
                          const associatedLOE = loes.find((loe) => loe.id === task.loeId)
                          return (
                            <Card key={task.id || idx} className="overflow-hidden">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {task.category && (
                                      <Badge variant="secondary" className="capitalize">{task.category}</Badge>
                                    )}
                                    <Badge variant={task.type === "formal" ? "default" : "secondary"}>
                                      {task.type === "formal" ? "Formal" : "Informal"}
                                    </Badge>
                                    <Badge className={getStatusColor(task.status)}>{task.status || "Not Started"}</Badge>
                                  </div>
                                  <Button variant="outline" size="sm" onClick={() => setSelectedTask(task)}>
                                    View Details
                                  </Button>
                                </div>
                                <CardTitle className="text-lg mt-2">{task.name}</CardTitle>
                                <CardDescription className="line-clamp-2">{task.description}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                      <span className="text-sm font-medium text-gray-500">Assignee:</span>
                                      <span className="text-sm">{Array.isArray(task.assignedTypes) && task.assignedTypes.length > 0 ? task.assignedTypes.join(', ') : task.owner}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <span className="text-sm font-medium text-gray-500">Timeline:</span>
                                      <span className="text-sm">
                                        {formatDate(task.startDate)} - {formatDate(task.endDate)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                      <span className="text-sm font-medium text-gray-500">LOE:</span>
                                      <span className="text-sm">{associatedLOE?.name || "None"}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <span className="text-sm font-medium text-gray-500">Deliverable:</span>
                                      <span className="text-sm">{task.deliverable}</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          </TabsContent>
        </Tabs>

        {/* LOE Detail Dialog */}
        <LOECard loe={selectedLOE} isOpen={!!selectedLOE} onClose={() => setSelectedLOE(null)} />

        {/* Task Detail Dialog */}
        <TaskCard task={tasks.find(t => t.id === selectedTask?.id) || null} isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} />

        {/* Milestone Detail Dialog */}
        <MilestoneCard 
          milestone={selectedMilestone ? milestones.find(m => m.id === selectedMilestone.id) : null} 
          isOpen={!!selectedMilestone} 
          onClose={() => setSelectedMilestone(null)} 
        />
      </main>
    </div>
  )
}

// --- LOE Create Form ---
function generateLoeId() {
  return "loe-" + Math.random().toString(36).slice(2, 10)
}
function LOECreateForm({ onCreate, onCancel }: { onCreate: (loe: any) => void, onCancel: () => void }) {
  const { milestones } = useData();
  return (
    <LOEForm
      initialValues={{}}
      milestones={milestones}
      onSubmit={(loe: any) => onCreate(loe)}
      onCancel={onCancel}
      submitLabel="Create LOE"
    />
  )
}

// --- Milestone Create Form ---
function generateMilestoneId() {
  return uuidv4();
}
function MilestoneCreateForm({ loes, onCreate, onCancel }: { loes: any[], onCreate: (milestone: any) => void, onCancel: () => void }) {
  const nameRef = useRef<HTMLInputElement>(null)
  const [date, setDate] = useState("")
  const descRef = useRef<HTMLTextAreaElement>(null)
  const orgOptions = ["CPMR", "IAPR", "TMTR"]
  const [leadOrgs, setLeadOrgs] = useState<string[]>([])
  const [supportingOrgs, setSupportingOrgs] = useState<string[]>([])
  const deliverableRef = useRef<HTMLInputElement>(null)
  const [selectedLOEs, setSelectedLOEs] = useState<string[]>([])
  const { tasks } = useData();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-lg font-semibold">Create New Milestone</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="milestone-name">Milestone Name</Label>
          <Input id="milestone-name" placeholder="Enter milestone name" ref={nameRef} />
        </div>
        <div>
          <Label htmlFor="milestone-date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Input
                id="milestone-date"
                value={date ? format(parse(date, "yyyy-MM-dd", new Date()), "MMMM dd, yyyy") : ""}
                placeholder="Select date"
                readOnly
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <UiCalendar
                mode="single"
                selected={date ? parse(date, "yyyy-MM-dd", new Date()) : undefined}
                onSelect={d => setDate(d ? format(d, "yyyy-MM-dd") : "")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Lead Org(s)</Label>
          <div className="flex flex-row gap-2 mt-1">
            {orgOptions.map(option => (
              <label key={option} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={leadOrgs.includes(option)}
                  onChange={e => {
                    if (e.target.checked) setLeadOrgs([...leadOrgs, option])
                    else setLeadOrgs(leadOrgs.filter(o => o !== option))
                  }}
                />
                {option}
              </label>
            ))}
          </div>
          {leadOrgs.length > 0 && (
            <div className="text-xs text-gray-600 mt-1">
              <span className="font-semibold">Selected:</span> {leadOrgs.join(", ")}
            </div>
          )}
        </div>
        <div>
          <Label>Supporting Org(s)</Label>
          <div className="flex flex-row gap-2 mt-1">
            {orgOptions.map(option => (
              <label key={option} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={supportingOrgs.includes(option)}
                  onChange={e => {
                    if (e.target.checked) setSupportingOrgs([...supportingOrgs, option])
                    else setSupportingOrgs(supportingOrgs.filter(o => o !== option))
                  }}
                />
                {option}
              </label>
            ))}
          </div>
          {supportingOrgs.length > 0 && (
            <div className="text-xs text-gray-600 mt-1">
              <span className="font-semibold">Selected:</span> {supportingOrgs.join(", ")}
            </div>
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="milestone-desc">Description</Label>
        <Textarea id="milestone-desc" placeholder="Describe the milestone" ref={descRef} />
      </div>
      <div>
        <Label htmlFor="milestone-deliverable">Deliverable</Label>
        <Input id="milestone-deliverable" placeholder="Enter deliverable" ref={deliverableRef} />
      </div>
      <div>
        <Label>Associated LOEs</Label>
        <div className="max-h-40 overflow-y-auto border rounded-md p-3 mt-2">
          {loes.map((loe) => (
            <div key={loe.id} className="flex items-center space-x-2 py-1">
              <input
                type="checkbox"
                id={`create-loe-${loe.id}`}
                checked={selectedLOEs.includes(loe.id)}
                onChange={e => {
                  if (e.target.checked) {
                    setSelectedLOEs(prev => [...prev, loe.id])
                    // Add tasks for this LOE to selectedTasks
                    setSelectedTasks(prev => Array.from(new Set([...prev, ...tasks.filter(task => task.loeId === loe.id).map(task => task.id)])))
                  } else {
                    const newLOEs = selectedLOEs.filter(id => id !== loe.id)
                    // Remove tasks for this LOE from selectedTasks
                    const loeTaskIds = tasks.filter(task => task.loeId === loe.id).map(task => task.id)
                    setSelectedLOEs(newLOEs)
                    setSelectedTasks(prev => prev.filter(id => !loeTaskIds.includes(id)))
                  }
                }}
              />
              <Label htmlFor={`create-loe-${loe.id}`}>{loe.name}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label>Associated Tasks</Label>
        <div className="max-h-40 overflow-y-auto border rounded-md p-3 mt-2">
          {tasks.filter(task => selectedLOEs.includes(task.loeId)).length > 0 ? (
            tasks.filter(task => selectedLOEs.includes(task.loeId)).map(task => (
              <div key={task.id} className="flex items-center space-x-2 py-1">
                <input
                  type="checkbox"
                  id={`create-task-${task.id}`}
                  checked={selectedTasks.includes(task.id)}
                  onChange={e => {
                    if (e.target.checked) setSelectedTasks(prev => [...prev, task.id])
                    else setSelectedTasks(prev => prev.filter(id => id !== task.id))
                  }}
                />
                <Label htmlFor={`create-task-${task.id}`}>{task.name}</Label>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No tasks available for selected LOEs</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => {
            const milestone = {
              id: uuidv4(),
              name: nameRef.current?.value || "",
              description: descRef.current?.value || "",
              date: date || new Date().toISOString().slice(0, 10),
              leadOrg: leadOrgs.join(", "),
              supportingOrg: supportingOrgs.join(", "),
              deliverable: deliverableRef.current?.value || "",
              loeIds: selectedLOEs,
              taskIds: selectedTasks,
            }
            onCreate(milestone)
          }}
        >
          Create Milestone
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Back
        </Button>
      </div>
    </div>
  )
}

function InformalTaskForm({ onCreate, onCancel }: { onCreate: (task: any) => void, onCancel: () => void }) {
  const nameRef = useRef<HTMLInputElement>(null)
  const descRef = useRef<HTMLTextAreaElement>(null)
  const productRef = useRef<HTMLInputElement>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [assignedTypes, setAssignedTypes] = useState<string[]>([])
  const orgOptions = ["CPMR", "IAPR", "TMTR"]
  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-lg font-semibold">Create Informal Task</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="informal-name">Name</Label>
          <Input id="informal-name" placeholder="Enter task name" ref={nameRef} />
        </div>
        <div>
          <Label>Assignee</Label>
          <div className="flex gap-2 mt-2">
            {orgOptions.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`informal-assignee-${type}`}
                  checked={assignedTypes.includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setAssignedTypes([...assignedTypes, type])
                    } else {
                      setAssignedTypes(assignedTypes.filter((t) => t !== type))
                    }
                  }}
                />
                <Label htmlFor={`informal-assignee-${type}`}>{type}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="informal-start-date">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Input
                id="informal-start-date"
                value={startDate ? format(parse(startDate, "yyyy-MM-dd", new Date()), "MMMM dd, yyyy") : ""}
                placeholder="Select start date"
                readOnly
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <UiCalendar
                mode="single"
                selected={startDate ? parse(startDate, "yyyy-MM-dd", new Date()) : undefined}
                onSelect={date => setStartDate(date ? format(date, "yyyy-MM-dd") : "")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="informal-end-date">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Input
                id="informal-end-date"
                value={endDate ? format(parse(endDate, "yyyy-MM-dd", new Date()), "MMMM dd, yyyy") : ""}
                placeholder="Select end date"
                readOnly
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <UiCalendar
                mode="single"
                selected={endDate ? parse(endDate, "yyyy-MM-dd", new Date()) : undefined}
                onSelect={date => setEndDate(date ? format(date, "yyyy-MM-dd") : "")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div>
        <Label htmlFor="informal-desc">Description</Label>
        <Textarea id="informal-desc" placeholder="Describe the task" ref={descRef} />
      </div>
      <div>
        <Label htmlFor="informal-product">Product</Label>
        <Input id="informal-product" placeholder="Enter product" ref={productRef} />
      </div>
      <div className="flex gap-2">
        <Button onClick={() => {
          const task = {
            id: uuidv4(),
            name: nameRef.current?.value || "",
            owner: assignedTypes.join(", "),
            assignedTypes,
            description: descRef.current?.value || "",
            deliverable: productRef.current?.value || "",
            status: "Not Started",
            type: "informal",
            startDate: startDate || new Date().toISOString().slice(0, 10),
            endDate: endDate || new Date().toISOString().slice(0, 10),
            loeId: "",
            issues: [], // Should be array of objects, but empty is fine for new
          }
          onCreate(task)
        }}>Create Informal Task</Button>
        <Button variant="outline" onClick={onCancel}>
          Back
        </Button>
      </div>
    </div>
  )
}

function InformalTaskFormEdit({ initialValues, onSubmit, onCancel }: { initialValues: any, onSubmit: (task: any) => void, onCancel: () => void }) {
  const nameRef = useRef<HTMLInputElement>(null)
  const descRef = useRef<HTMLTextAreaElement>(null)
  const productRef = useRef<HTMLInputElement>(null)
  const [startDate, setStartDate] = useState(initialValues.startDate || "")
  const [endDate, setEndDate] = useState(initialValues.endDate || "")
  const [assignedTypes, setAssignedTypes] = useState<string[]>(initialValues.assignedTypes || (initialValues.owner ? initialValues.owner.split(/, ?/) : []))
  const orgOptions = ["CPMR", "IAPR", "TMTR"]
  // Set initial values on mount
  useEffect(() => {
    if (nameRef.current) nameRef.current.value = initialValues.name || ""
    if (descRef.current) descRef.current.value = initialValues.description || ""
    if (productRef.current) productRef.current.value = initialValues.deliverable || ""
    setStartDate(initialValues.startDate || "")
    setEndDate(initialValues.endDate || "")
    setAssignedTypes(initialValues.assignedTypes || (initialValues.owner ? initialValues.owner.split(/, ?/) : []))
  }, [initialValues])
  return (
    <div className="space-y-4 mt-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="informal-edit-name">Name</Label>
          <Input id="informal-edit-name" placeholder="Enter task name" ref={nameRef} defaultValue={initialValues.name || ""} />
        </div>
        <div>
          <Label>Assignee</Label>
          <div className="flex gap-2 mt-2">
            {orgOptions.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`informal-edit-assignee-${type}`}
                  checked={assignedTypes.includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setAssignedTypes([...assignedTypes, type])
                    } else {
                      setAssignedTypes(assignedTypes.filter((t) => t !== type))
                    }
                  }}
                />
                <Label htmlFor={`informal-edit-assignee-${type}`}>{type}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="informal-edit-start-date">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Input
                id="informal-edit-start-date"
                value={startDate ? format(parse(startDate, "yyyy-MM-dd", new Date()), "MMMM dd, yyyy") : ""}
                placeholder="Select start date"
                readOnly
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <UiCalendar
                mode="single"
                selected={startDate ? parse(startDate, "yyyy-MM-dd", new Date()) : undefined}
                onSelect={date => setStartDate(date ? format(date, "yyyy-MM-dd") : "")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="informal-edit-end-date">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Input
                id="informal-edit-end-date"
                value={endDate ? format(parse(endDate, "yyyy-MM-dd", new Date()), "MMMM dd, yyyy") : ""}
                placeholder="Select end date"
                readOnly
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <UiCalendar
                mode="single"
                selected={endDate ? parse(endDate, "yyyy-MM-dd", new Date()) : undefined}
                onSelect={date => setEndDate(date ? format(date, "yyyy-MM-dd") : "")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div>
        <Label htmlFor="informal-edit-desc">Description</Label>
        <Textarea id="informal-edit-desc" placeholder="Describe the task" ref={descRef} defaultValue={initialValues.description || ""} />
      </div>
      <div>
        <Label htmlFor="informal-edit-product">Product</Label>
        <Input id="informal-edit-product" placeholder="Enter product" ref={productRef} defaultValue={initialValues.deliverable || ""} />
      </div>
      <div className="flex gap-2">
        <Button onClick={() => {
          const task = {
            ...initialValues,
            name: nameRef.current?.value || "",
            owner: assignedTypes.join(", "),
            assignedTypes,
            description: descRef.current?.value || "",
            deliverable: productRef.current?.value || "",
            type: "informal",
            startDate: startDate || new Date().toISOString().slice(0, 10),
            endDate: endDate || new Date().toISOString().slice(0, 10),
          }
          onSubmit(task)
        }}>Save Changes</Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

