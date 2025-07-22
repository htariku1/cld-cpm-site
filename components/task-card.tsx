"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, AlertCircle, Calendar, Target, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { useData } from "@/lib/data-context"
import { formatDate } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"

interface TaskCardProps {
  task: any | null // Using any for now to handle legacy data
  isOpen: boolean
  onClose: () => void
}

export function TaskCard({ task, isOpen, onClose }: TaskCardProps) {
  const { getDurationInDays, loes, milestones } = useData()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    deliverable: "",
    owner: "",
    startDate: "",
    endDate: "",
    status: "",
    type: "",
    loeIds: [] as string[], // Changed from loeId to loeIds array
    assignedTypes: [] as string[],
    internalCoord: [] as string[],
    externalCoord: [] as string[],
    issues: [] as string[],
    associatedMilestones: [] as string[],
  })

  if (!task) return null

  // Handle legacy task data structure
  const normalizedTask = {
    id: task.id,
    name: task.name,
    owner: task.owner,
    loeId: task.loeId || "loe-1", // Default fallback
    description: task.description,
    startDate: task.startDate,
    endDate: task.endDate,
    status: task.status,
    deliverable: task.deliverable,
    type: task.type === "formal" || task.type === "informal" ? task.type : "formal",
    assignedTypes: task.assignedTypes || [task.type?.toUpperCase()] || ["CPMR"], // Convert legacy type
    internalCoord: task.internalCoord || [],
    externalCoord: task.externalCoord || [],
    issues: Array.isArray(task.issues)
      ? task.issues
      : typeof task.issues === "number"
        ? Array(task.issues).fill("Issue pending details")
        : [],
  }

  const duration = getDurationInDays(normalizedTask.startDate, normalizedTask.endDate)
  const associatedLOE = loes.find((loe) => loe.id === normalizedTask.loeId)
  const taskMilestones = milestones.filter((milestone) => milestone.loeIds.includes(normalizedTask.loeId))

  const getStatusColor = (status: string) => {
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

  const handleEdit = () => {
    setEditFormData({
      name: normalizedTask.name,
      description: normalizedTask.description,
      deliverable: normalizedTask.deliverable,
      owner: normalizedTask.owner,
      startDate: normalizedTask.startDate,
      endDate: normalizedTask.endDate,
      status: normalizedTask.status,
      type: normalizedTask.type,
      loeIds: [normalizedTask.loeId], // Convert single LOE to array
      assignedTypes: normalizedTask.assignedTypes,
      internalCoord: normalizedTask.internalCoord,
      externalCoord: normalizedTask.externalCoord,
      issues: normalizedTask.issues,
      associatedMilestones: [], // TODO: Get from task data when implemented
    })
    setEditDialogOpen(true)
  }

  const handleDelete = () => {
    console.log("Delete task:", normalizedTask.id)
    // TODO: Implement delete functionality
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="space-y-4">
            {/* Title Row */}
            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <DialogTitle className="text-2xl font-bold text-gray-900">{normalizedTask.name}</DialogTitle>
                <Badge variant={normalizedTask.type === "formal" ? "default" : "secondary"}>
                  {normalizedTask.type === "formal" ? "Formal" : "Informal"}
                </Badge>
              </div>
              <div className="absolute right-4 top-4 z-20">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-sm text-gray-600">
              {formatDate(normalizedTask.startDate)} – {formatDate(normalizedTask.endDate)} ({duration} days)
            </p>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                    <Badge className={getStatusColor(normalizedTask.status)}>{normalizedTask.status}</Badge>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Issues</p>
                    <p className="text-2xl font-bold text-gray-900">{normalizedTask.issues.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Assigned Types</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {normalizedTask.assignedTypes.map((type: string) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Information</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700">{normalizedTask.description}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Task Deliverable/Product</h4>
                    <p className="text-gray-700">{normalizedTask.deliverable}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Internal Coordination</h4>
                      <div className="space-y-1">
                        {normalizedTask.internalCoord.length > 0 ? (
                          normalizedTask.internalCoord.map((coord: string) => (
                            <Badge key={coord} variant="secondary" className="mr-2">
                              {coord}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">No internal coordination specified</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">External Coordination</h4>
                      <div className="space-y-1">
                        {normalizedTask.externalCoord.length > 0 ? (
                          normalizedTask.externalCoord.map((coord: string) => (
                            <Badge key={coord} variant="secondary" className="mr-2">
                              {coord}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">No external coordination specified</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Task Owner moved here as the last line */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Task Owner</h4>
                    <p className="text-gray-700">{normalizedTask.owner}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dependencies" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Linked LOEs</h3>
                  {associatedLOE ? (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-gray-900">{associatedLOE.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{associatedLOE.purpose}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No linked LOEs</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Associated Milestones</h3>
                  {taskMilestones.length > 0 ? (
                    <div className="space-y-3">
                      {taskMilestones.map((milestone) => (
                        <div key={milestone.id} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-orange-500" />
                            <h4 className="font-medium text-gray-900">{milestone.name}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{formatDate(milestone.date)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No associated milestones</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-6 mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues</h3>
                {normalizedTask.issues.length > 0 ? (
                  <div className="space-y-3">
                    {normalizedTask.issues.map((issue: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        <p className="text-gray-700">{issue}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No issues reported for this task.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Close Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
      {/* Edit Task Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-task-name">Task Name</Label>
                <Input
                  id="edit-task-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-task-owner">Task Owner</Label>
                <Input
                  id="edit-task-owner"
                  value={editFormData.owner}
                  onChange={(e) => setEditFormData({ ...editFormData, owner: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-task-description">Description</Label>
              <Textarea
                id="edit-task-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit-task-deliverable">Deliverable</Label>
              <Input
                id="edit-task-deliverable"
                value={editFormData.deliverable}
                onChange={(e) => setEditFormData({ ...editFormData, deliverable: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-start-date">Start Date</Label>
                <Input
                  id="edit-start-date"
                  type="date"
                  value={editFormData.startDate}
                  onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-end-date">End Date</Label>
                <Input
                  id="edit-end-date"
                  type="date"
                  value={editFormData.endDate}
                  onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-type">Task Type</Label>
                <Select
                  value={editFormData.type}
                  onValueChange={(value) => setEditFormData({ ...editFormData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="informal">Informal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assigned Types</Label>
                <div className="flex gap-2 mt-2">
                  {["CPMR", "IAPR", "TMTR"].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${type}`}
                        checked={editFormData.assignedTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditFormData({
                              ...editFormData,
                              assignedTypes: [...editFormData.assignedTypes, type],
                            })
                          } else {
                            setEditFormData({
                              ...editFormData,
                              assignedTypes: editFormData.assignedTypes.filter((t) => t !== type),
                            })
                          }
                        }}
                      />
                      <Label htmlFor={`edit-${type}`}>{type}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Linked LOEs</Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 mt-2">
                  {loes.map((loe) => (
                    <div key={loe.id} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`loe-${loe.id}`}
                        checked={editFormData.loeIds?.includes(loe.id) || false}
                        onCheckedChange={(checked) => {
                          const currentLoeIds = editFormData.loeIds || []
                          if (checked) {
                            setEditFormData({
                              ...editFormData,
                              loeIds: [...currentLoeIds, loe.id],
                            })
                          } else {
                            setEditFormData({
                              ...editFormData,
                              loeIds: currentLoeIds.filter((id) => id !== loe.id),
                            })
                          }
                        }}
                      />
                      <Label htmlFor={`loe-${loe.id}`} className="text-sm">
                        {loe.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Associated Milestones</Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 mt-2">
                  {milestones
                    .filter((milestone) => milestone.loeIds.some((id) => (editFormData.loeIds || []).includes(id)))
                    .map((milestone) => (
                      <div key={milestone.id} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`milestone-${milestone.id}`}
                          checked={editFormData.associatedMilestones?.includes(milestone.id) || false}
                          onCheckedChange={(checked) => {
                            const currentMilestones = editFormData.associatedMilestones || []
                            if (checked) {
                              setEditFormData({
                                ...editFormData,
                                associatedMilestones: [...currentMilestones, milestone.id],
                              })
                            } else {
                              setEditFormData({
                                ...editFormData,
                                associatedMilestones: currentMilestones.filter((id) => id !== milestone.id),
                              })
                            }
                          }}
                        />
                        <Label htmlFor={`milestone-${milestone.id}`} className="text-sm">
                          {milestone.name} ({formatDate(milestone.date)})
                        </Label>
                      </div>
                    ))}
                  {milestones.filter((milestone) => milestone.loeIds.some((id) => (editFormData.loeIds || []).includes(id))).length === 0 && (
                    <p className="text-gray-500 text-sm">No milestones available for selected LOEs</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-issues">Issues (one per line)</Label>
              <Textarea
                id="edit-issues"
                value={editFormData.issues.join("\n")}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    issues: e.target.value.split("\n").filter((issue) => issue.trim()),
                  })
                }
                placeholder="Enter issues, one per line"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  console.log("Save task:", editFormData)
                  setEditDialogOpen(false)
                }}
              >
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
