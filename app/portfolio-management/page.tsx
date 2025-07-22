"use client"

import { useState } from "react"
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

export default function PortfolioManagementPage() {
  const { loes, tasks, milestones } = useData()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createType, setCreateType] = useState<"loe" | "milestone" | "task" | null>(null)
  const [taskType, setTaskType] = useState<"formal" | "informal" | null>(null)
  const [expandedLOE, setExpandedLOE] = useState<string | null>(null)
  const [selectedLOE, setSelectedLOE] = useState<any>(null)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null)

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

  const resetDialog = () => {
    setCreateDialogOpen(false)
    setCreateType(null)
    setTaskType(null)
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
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
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
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold">Create New LOE</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="loe-name">LOE Name</Label>
                      <Input id="loe-name" placeholder="Enter LOE name" />
                    </div>
                    <div>
                      <Label htmlFor="loe-lead">Lead Org(s)</Label>
                      <Input id="loe-lead" placeholder="Enter lead organizations" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="loe-purpose">Purpose</Label>
                    <Textarea id="loe-purpose" placeholder="Describe the purpose of this LOE" />
                  </div>
                  <div>
                    <Label htmlFor="loe-supporting">Supporting Org(s)</Label>
                    <Input id="loe-supporting" placeholder="Enter supporting organizations" />
                  </div>
                  <div>
                    <Label htmlFor="cpmr-contrib">CPMR Contributions</Label>
                    <Textarea id="cpmr-contrib" placeholder="Describe CPMR contributions" />
                  </div>
                  <div>
                    <Label htmlFor="iapr-contrib">IAPR Contributions</Label>
                    <Textarea id="iapr-contrib" placeholder="Describe IAPR contributions" />
                  </div>
                  <div>
                    <Label htmlFor="tmtr-contrib">TMTR Contributions</Label>
                    <Textarea id="tmtr-contrib" placeholder="Describe TMTR contributions" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={resetDialog}>Create LOE</Button>
                    <Button variant="outline" onClick={() => setCreateType(null)}>
                      Back
                    </Button>
                  </div>
                </div>
              )}

              {createType === "milestone" && (
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold">Create New Milestone</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="milestone-name">Milestone Name</Label>
                      <Input id="milestone-name" placeholder="Enter milestone name" />
                    </div>
                    <div>
                      <Label htmlFor="milestone-date">Date</Label>
                      <Input id="milestone-date" type="date" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="milestone-desc">Description</Label>
                    <Textarea id="milestone-desc" placeholder="Describe the milestone" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="milestone-lead">Lead Org(s)</Label>
                      <Input id="milestone-lead" placeholder="Enter lead organizations" />
                    </div>
                    <div>
                      <Label htmlFor="milestone-supporting">Supporting Org(s)</Label>
                      <Input id="milestone-supporting" placeholder="Enter supporting organizations" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="milestone-deliverable">Deliverable</Label>
                    <Input id="milestone-deliverable" placeholder="Enter deliverable" />
                  </div>
                  <div>
                    <Label htmlFor="milestone-loe">LOE and/or Tasks Associated</Label>
                    <Textarea id="milestone-loe" placeholder="Enter associated LOEs and tasks" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={resetDialog}>Create Milestone</Button>
                    <Button variant="outline" onClick={() => setCreateType(null)}>
                      Back
                    </Button>
                  </div>
                </div>
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
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold">Create Formal Task</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="task-name">Task Name</Label>
                      <Input id="task-name" placeholder="Enter task name" />
                    </div>
                    <div>
                      <Label htmlFor="task-owner">Task Owner</Label>
                      <Input id="task-owner" placeholder="Enter task owner" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="task-loe">LOE (can link to multiple)</Label>
                    <Input id="task-loe" placeholder="Enter associated LOEs" />
                  </div>
                  <div>
                    <Label htmlFor="task-desc">Description</Label>
                    <Textarea id="task-desc" placeholder="Describe the task" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="task-product">Product</Label>
                      <Input id="task-product" placeholder="Enter product" />
                    </div>
                    <div>
                      <Label htmlFor="task-status">Status</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not-started">Not Started</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="on-hold">On Hold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="task-issues">Issues</Label>
                    <Textarea id="task-issues" placeholder="Enter any issues (can add multiple)" />
                  </div>

                  <div>
                    <Label className="text-base font-medium">Internal Coordination</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {internalCoordOptions.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox id={`internal-${option}`} />
                          <Label htmlFor={`internal-${option}`} className="text-sm">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">External Coordination</Label>
                    <div className="space-y-4 mt-2">
                      <div>
                        <Label className="text-sm font-medium">Military Departments</Label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                          {externalCoordOptions.mildeps.map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <Checkbox id={`mildep-${option}`} />
                              <Label htmlFor={`mildep-${option}`} className="text-sm">
                                {option}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Commands</Label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {externalCoordOptions.commands.map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <Checkbox id={`command-${option}`} />
                              <Label htmlFor={`command-${option}`} className="text-sm">
                                {option}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="other-orgs">Other Organizations</Label>
                        <Textarea id="other-orgs" placeholder="Enter other organizations (one per line)" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={resetDialog}>Create Formal Task</Button>
                    <Button variant="outline" onClick={() => setTaskType(null)}>
                      Back
                    </Button>
                  </div>
                </div>
              )}

              {createType === "task" && taskType === "informal" && (
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold">Create Informal Task</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="informal-name">Name</Label>
                      <Input id="informal-name" placeholder="Enter task name" />
                    </div>
                    <div>
                      <Label htmlFor="informal-owner">Task Owner</Label>
                      <Input id="informal-owner" placeholder="Enter task owner" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="informal-desc">Description</Label>
                    <Textarea id="informal-desc" placeholder="Describe the task" />
                  </div>
                  <div>
                    <Label htmlFor="informal-product">Product</Label>
                    <Input id="informal-product" placeholder="Enter product" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={resetDialog}>Create Informal Task</Button>
                    <Button variant="outline" onClick={() => setTaskType(null)}>
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="loes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="loes">Lines of Effort</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="loes" className="space-y-6">
            <div className="grid gap-4">
              {loes.map((loe) => (
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
                            <Badge className={getHealthColor(loe.overallHealth)}>
                              {getHealthLabel(loe.overallHealth)}
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
                                        <h5 className="font-medium">{task.name}</h5>
                                        <p className="text-xs text-gray-600">Owner: {task.owner}</p>
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
                                  <div key={milestone.id} className="border rounded-lg p-3">
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
              ))}
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
              {tasks.map((task) => {
                const associatedLOE = loes.find((loe) => loe.id === task.loeId)
                return (
                  <Card key={task.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={task.type === "formal" ? "default" : "secondary"}>
                            {task.type === "formal" ? "Formal" : "Informal"}
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
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
                            <span className="text-sm font-medium text-gray-500">Owner:</span>
                            <span className="text-sm">{task.owner}</span>
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
            </div>
          </TabsContent>
        </Tabs>

        {/* LOE Detail Dialog */}
        <LOECard loe={selectedLOE} isOpen={!!selectedLOE} onClose={() => setSelectedLOE(null)} />

        {/* Task Detail Dialog */}
        <TaskCard task={selectedTask} isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} />

        {/* Milestone Detail Dialog */}
        <MilestoneCard milestone={selectedMilestone} isOpen={!!selectedMilestone} onClose={() => setSelectedMilestone(null)} />
      </main>
    </div>
  )
}
