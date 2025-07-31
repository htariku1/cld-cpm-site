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
import { useState, useEffect, useRef } from "react"
import { TaskForm } from "@/components/task-form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as UiCalendar } from "@/components/ui/calendar"
import { format, parse } from "date-fns"

interface TaskCardProps {
  task: any | null // Using any for now to handle legacy data
  isOpen: boolean
  onClose: () => void
}

export function TaskCard({ task, isOpen, onClose }: TaskCardProps) {
  const { getDurationInDays, loes, milestones, deleteTask, updateTask } = useData()
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
    category: "", // <-- Add this line
  })

  if (!task) return null

  // Handle legacy task data structure
  const normalizedTask = {
    id: task.id,
    name: task.name,
    owner: task.owner,
    loeId: task.loeId || "loe-1", // Default fallback
    loeIds: task.loeIds || (task.loeId ? [task.loeId] : []),
    associatedMilestones: task.associatedMilestones || [],
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
    category: task.category || "", // <-- Add this line
  }

  const duration = getDurationInDays(normalizedTask.startDate, normalizedTask.endDate)
  const associatedLOE = loes.find((loe) => loe.id === normalizedTask.loeId)
  const taskMilestones = milestones.filter((milestone) => milestone.loeIds.includes(normalizedTask.loeId))

  // For dependencies tab, get all linked LOEs and associated milestones
  const linkedLOEs = loes.filter((loe: any) => normalizedTask.loeIds.includes(loe.id));
  const linkedMilestones = milestones.filter((milestone: any) => normalizedTask.associatedMilestones.includes(milestone.id));

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
      category: normalizedTask.category, // <-- Add this line
    })
    setEditDialogOpen(true)
  }

  const handleDelete = () => {
    deleteTask(normalizedTask.id)
    onClose()
  }

  // Replace isValidTask with a version that returns missing fields
  function validateTaskFields(task: any) {
    const missingFields = [];
    if (!task.name) missingFields.push("Task Name");
    if (!task.owner) missingFields.push("Assignee");
    if (!task.startDate) missingFields.push("Start Date");
    if (!task.endDate) missingFields.push("End Date");
    if (!task.status) missingFields.push("Status");
    if (!task.deliverable) missingFields.push("Product");
    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }

  if (normalizedTask.type === "informal") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <InformalTaskCardContent task={normalizedTask} onEdit={handleEdit} onDelete={handleDelete} onClose={onClose} />
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
              </DialogHeader>
              <InformalTaskFormEdit
                initialValues={editFormData}
                onSubmit={updatedTask => {
                  const { id, ...fieldsToUpdate } = updatedTask;
                  const validation = validateTaskFields(updatedTask);
                  if (!validation.isValid) {
                    alert('Please fill in the following required fields:\n' + validation.missingFields.join(', '));
                    return;
                  }
                  updateTask(task.id, fieldsToUpdate);
                  setEditDialogOpen(false);
                }}
                onCancel={() => setEditDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </DialogContent>
      </Dialog>
    )
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
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Start Date</span>
              <span className="text-sm text-gray-900">{normalizedTask.startDate ? formatDate(normalizedTask.startDate) : "—"}</span>
              <span className="mx-2 text-gray-400">—</span>
              <span className="text-xs text-gray-500 uppercase tracking-wide">End Date</span>
              <span className="text-sm text-gray-900">{normalizedTask.endDate ? formatDate(normalizedTask.endDate) : "—"}</span>
              <span className="mx-2 text-gray-400">—</span>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Duration</span>
              <span className="text-sm text-gray-900">{duration} day{duration !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </DialogHeader>
        {/* Subtitle */}
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

                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dependencies" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Linked LOEs</h3>
                  {linkedLOEs.length > 0 ? (
                    <div className="space-y-3">
                      {linkedLOEs.map((loe: any) => (
                        <div key={loe.id} className="p-4 border rounded-lg">
                          <h4 className="font-medium text-gray-900">{loe.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{loe.purpose}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No linked LOEs</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Associated Milestones</h3>
                  {linkedMilestones.length > 0 ? (
                    <div className="space-y-3">
                      {linkedMilestones.map((milestone: any) => (
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
                {Array.isArray(normalizedTask.issues) && normalizedTask.issues.length > 0 ? (
                  <div className="space-y-3">
                    {normalizedTask.issues.map((issue: any, index: number) => (
                      <div key={index} className="flex flex-col gap-1 p-3 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                          <p className="text-gray-700 text-sm font-normal">{typeof issue === 'string' ? issue : issue.text}</p>
                        </div>
                        {issue.remedy && (
                          <div className="ml-8 mt-1 text-green-700 text-xs bg-green-50 rounded px-2 py-1 w-fit">Remedy: {issue.remedy}</div>
                        )}
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
          {normalizedTask.type === "informal" ? (
            <InformalTaskFormEdit
              initialValues={editFormData}
              onSubmit={updatedTask => {
                const { id, ...fieldsToUpdate } = updatedTask;
                const validation = validateTaskFields(updatedTask);
                if (!validation.isValid) {
                  alert('Please fill in the following required fields:\n' + validation.missingFields.join(', '));
                  return;
                }
                updateTask(task.id, fieldsToUpdate);
                setEditDialogOpen(false);
              }}
              onCancel={() => setEditDialogOpen(false)}
            />
          ) : (
            <TaskForm
              mode="edit"
              initialValues={editFormData}
              loes={loes}
              milestones={milestones}
              onSubmit={(updatedTask) => {
                // Only update changed fields, never overwrite id
                const { id, ...fieldsToUpdate } = updatedTask;
                const validation = validateTaskFields(updatedTask);
                if (!validation.isValid) {
                  alert('Please fill in the following required fields:\n' + validation.missingFields.join(', '));
                  return;
                }
                updateTask(task.id, fieldsToUpdate);
                setEditDialogOpen(false);
              }}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

function InformalTaskCardContent({ task, onEdit, onDelete, onClose }: { task: any, onEdit: () => void, onDelete: () => void, onClose: () => void }) {
  function getDurationInDays(start: string, end: string): number | null {
    if (!start || !end) return null;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  const duration = getDurationInDays(task.startDate, task.endDate);
  return (
    <>
      <DialogHeader className="pb-6">
        <div className="space-y-2">
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900">{task.name}</DialogTitle>
              <Badge variant="secondary">Informal</Badge>
            </div>
            <div className="absolute right-4 top-4 z-20">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Start Date</span>
            <span className="text-sm text-gray-900">{task.startDate ? formatDate(task.startDate) : "—"}</span>
            <span className="mx-2 text-gray-400">—</span>
            <span className="text-xs text-gray-500 uppercase tracking-wide">End Date</span>
            <span className="text-sm text-gray-900">{task.endDate ? formatDate(task.endDate) : "—"}</span>
            {duration !== null && (
              <>
                <span className="mx-2 text-gray-400">—</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Duration</span>
                <span className="text-sm text-gray-900">{duration} day{duration !== 1 ? "s" : ""}</span>
              </>
            )}
          </div>
        </div>
      </DialogHeader>
      <Card className="p-6 mt-6">
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informal Task Information</h3>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-700">{task.description}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Product</h4>
            <p className="text-gray-700">{task.deliverable}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Assignee</h4>
            <p className="text-gray-700">{task.owner}</p>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </>
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
          <Label htmlFor="informal-edit-name">Name <span style={{color: 'red'}}>*</span></Label>
          <Input id="informal-edit-name" placeholder="Enter task name" ref={nameRef} defaultValue={initialValues.name || ""} />
        </div>
        <div>
          <Label>Assignee <span style={{color: 'red'}}>*</span></Label>
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
          <Label htmlFor="informal-edit-start-date">Start Date <span style={{color: 'red'}}>*</span></Label>
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
                onSelect={(date: Date | undefined) => setStartDate(date ? format(date, "yyyy-MM-dd") : "")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="informal-edit-end-date">End Date <span style={{color: 'red'}}>*</span></Label>
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
                onSelect={(date: Date | undefined) => setEndDate(date ? format(date, "yyyy-MM-dd") : "")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div>
        <Label htmlFor="informal-edit-desc">Description <span style={{color: 'red'}}>*</span></Label>
        <Textarea id="informal-edit-desc" placeholder="Describe the task" ref={descRef} defaultValue={initialValues.description || ""} />
      </div>
      <div>
        <Label htmlFor="informal-edit-product">Product <span style={{color: 'red'}}>*</span></Label>
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
