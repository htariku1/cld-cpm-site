import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar as UiCalendar } from "@/components/ui/calendar"
import { format, parse } from "date-fns"
import { v4 as uuidv4 } from 'uuid'

// Types for props
interface TaskFormProps {
  mode: "add" | "edit"
  initialValues?: Partial<any>
  onSubmit: (task: any) => void
  onCancel: () => void
  loes: any[]
  milestones: any[]
}

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

export function TaskForm({ mode, initialValues = {}, onSubmit, onCancel, loes, milestones }: TaskFormProps) {
  // State
  const [taskCategory, setTaskCategory] = useState(initialValues.category || "")
  const [name, setName] = useState(initialValues.name || "")
  const [owner, setOwner] = useState(initialValues.owner || "")
  const [assignedTypes, setAssignedTypes] = useState<string[]>(initialValues.assignedTypes || [])
  const [startDate, setStartDate] = useState(initialValues.startDate || "")
  const [endDate, setEndDate] = useState(initialValues.endDate || "")
  const [description, setDescription] = useState(initialValues.description || "")
  const [deliverable, setDeliverable] = useState(initialValues.deliverable || "")
  const [status, setStatus] = useState(initialValues.status || "Not Started")
  const [loeIds, setLoeIds] = useState<string[]>(initialValues.loeIds || (initialValues.loeId ? [initialValues.loeId] : []))
  const [associatedMilestones, setAssociatedMilestones] = useState<string[]>(initialValues.associatedMilestones || [])
  const [subtasks, setSubtasks] = useState<string[]>(initialValues.subtasks || [])
  const [showSubtaskInput, setShowSubtaskInput] = useState(false)
  const [subtaskInput, setSubtaskInput] = useState("")
  // Change issues state to use objects with a text property
  const [issues, setIssues] = useState<{ text: string }[]>(
    Array.isArray(initialValues.issues)
      ? initialValues.issues.map((issue: any) => typeof issue === "string" ? { text: issue } : issue)
      : []
  )
  const [showIssueInput, setShowIssueInput] = useState(false)
  const [issueInput, setIssueInput] = useState("")
  const [internalCoord, setInternalCoord] = useState<string[]>(initialValues.internalCoord || [])
  const [externalCoord, setExternalCoord] = useState<string[]>(initialValues.externalCoord || [])
  const [selectedOtherOrgs, setSelectedOtherOrgs] = useState<string[]>(initialValues.otherOrgs || [])
  const [otherOrgInput, setOtherOrgInput] = useState("")
  const [type, setType] = useState(initialValues.type || "formal")

  // Keep associatedMilestones in sync with loeIds
  useEffect(() => {
    // Remove milestones that are no longer associated with selected LOEs
    setAssociatedMilestones((prev) =>
      prev.filter((mid) => {
        const milestone = milestones.find((m) => m.id === mid)
        return milestone && milestone.loeIds.some((id: string) => loeIds.includes(id))
      })
    )
  }, [loeIds, milestones])

  // Validation state
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setErrors({})
    
    // Validate required fields
    const newErrors: { [key: string]: string } = {}
    
    if (!name.trim()) {
      newErrors.name = "Task name is required"
    }
    
    if (assignedTypes.length === 0) {
      newErrors.assignedTypes = "At least one assignee is required"
    }
    
    if (!startDate) {
      newErrors.startDate = "Start date is required"
    }
    
    if (!endDate) {
      newErrors.endDate = "End date is required"
    }
    
    if (!description.trim()) {
      newErrors.description = "Description is required"
    }
    
    if (!deliverable.trim()) {
      newErrors.deliverable = "Product is required"
    }
    
    // Validate linked LOEs for formal tasks
    if (type === "formal" && loeIds.length === 0) {
      newErrors.loeIds = "Linked LOEs are required for formal tasks"
    }
    
    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    const task = {
      ...initialValues,
      id: mode === "add" ? uuidv4() : initialValues.id,
      name,
      owner: assignedTypes.length > 0 ? assignedTypes.join(", ") : "",
      loeId: loeIds[0] || "",
      loeIds,
      description,
      startDate,
      endDate,
      status,
      deliverable,
      type,
      category: taskCategory === "deployment" || taskCategory === "sustainment" ? taskCategory : undefined,
      assignedTypes,
      associatedMilestones,
      internalCoord,
      externalCoord,
      issues, // <-- now always array of objects
      subtasks,
      otherOrgs: selectedOtherOrgs,
    }
    onSubmit(task)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div>
        <Label htmlFor="task-category">Task Category</Label>
        <Select value={taskCategory} onValueChange={value => setTaskCategory(value as "deployment" | "sustainment" | "") }>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deployment">Deployment</SelectItem>
            <SelectItem value="sustainment">Sustainment</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="task-name">Task Name <span style={{color: 'red'}}>*</span></Label>
          <Input 
            id="task-name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Enter task name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>
        <div>
          <Label>Assignee <span style={{color: 'red'}}>*</span></Label>
          <div className={`flex gap-2 mt-2 ${errors.assignedTypes ? 'border-red-500' : ''}`}>
            {["CPMR", "IAPR", "TMTR"].map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`add-${type}`}
                  checked={assignedTypes.includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setAssignedTypes([...assignedTypes, type])
                    } else {
                      setAssignedTypes(assignedTypes.filter((t) => t !== type))
                    }
                  }}
                />
                <Label htmlFor={`add-${type}`}>{type}</Label>
              </div>
            ))}
          </div>
          {errors.assignedTypes && (
            <p className="text-red-500 text-sm mt-1">{errors.assignedTypes}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="add-start-date">Start Date <span style={{color: 'red'}}>*</span></Label>
          <Popover>
            <PopoverTrigger asChild>
              <Input
                id="add-start-date"
                value={startDate ? format(parse(startDate, "yyyy-MM-dd", new Date()), "MMMM dd, yyyy") : ""}
                placeholder="Select start date"
                readOnly
                className={errors.startDate ? 'border-red-500' : ''}
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <UiCalendar
                mode="single"
                selected={startDate ? parse(startDate, "yyyy-MM-dd", new Date()) : undefined}
                onSelect={date => {
                  setStartDate(date ? format(date, "yyyy-MM-dd") : "")
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.startDate && (
            <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
          )}
        </div>
        <div>
          <Label htmlFor="add-end-date">End Date <span style={{color: 'red'}}>*</span></Label>
          <Popover>
            <PopoverTrigger asChild>
              <Input
                id="add-end-date"
                value={endDate ? format(parse(endDate, "yyyy-MM-dd", new Date()), "MMMM dd, yyyy") : ""}
                placeholder="Select end date"
                readOnly
                className={errors.endDate ? 'border-red-500' : ''}
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <UiCalendar
                mode="single"
                selected={endDate ? parse(endDate, "yyyy-MM-dd", new Date()) : undefined}
                onSelect={date => {
                  setEndDate(date ? format(date, "yyyy-MM-dd") : "")
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.endDate && (
            <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="task-desc">Description <span style={{color: 'red'}}>*</span></Label>
        <Textarea 
          id="task-desc" 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          placeholder="Describe the task"
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="task-product">Product <span style={{color: 'red'}}>*</span></Label>
          <Input 
            id="task-product" 
            value={deliverable} 
            onChange={e => setDeliverable(e.target.value)} 
            placeholder="Enter product"
            className={errors.deliverable ? 'border-red-500' : ''}
          />
          {errors.deliverable && (
            <p className="text-red-500 text-sm mt-1">{errors.deliverable}</p>
          )}
        </div>
        <div>
          <Label htmlFor="task-status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="Planning">Planning</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>
            Linked LOEs
            {type === "formal" && <span style={{color: 'red'}}>*</span>}
          </Label>
          <div className={`max-h-32 overflow-y-auto border rounded-md p-2 mt-2 ${errors.loeIds ? 'border-red-500' : ''}`}>
            {loes.map((loe) => (
              <div key={loe.id} className="flex items-center space-x-2 py-1">
                <Checkbox
                  id={`add-loe-${loe.id}`}
                  checked={loeIds.includes(loe.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setLoeIds([...loeIds, loe.id])
                    } else {
                      setLoeIds(loeIds.filter((id) => id !== loe.id))
                    }
                  }}
                />
                <Label htmlFor={`add-loe-${loe.id}`} className="text-sm">
                  {loe.name}
                </Label>
              </div>
            ))}
          </div>
          {errors.loeIds && (
            <p className="text-red-500 text-sm mt-1">{errors.loeIds}</p>
          )}
        </div>
        <div>
          <Label>Associated Milestones</Label>
          <div className="max-h-32 overflow-y-auto border rounded-md p-2 mt-2">
            {milestones
              .filter((milestone) => milestone.loeIds.some((id: string) => loeIds.includes(id)))
              .map((milestone) => (
                <div key={milestone.id} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={`add-milestone-${milestone.id}`}
                    checked={associatedMilestones.includes(milestone.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setAssociatedMilestones([...associatedMilestones, milestone.id])
                      } else {
                        setAssociatedMilestones(associatedMilestones.filter((id) => id !== milestone.id))
                      }
                    }}
                  />
                  <Label htmlFor={`add-milestone-${milestone.id}`} className="text-sm">
                    {milestone.name} ({format(milestone.date, "MMMM dd, yyyy")})
                  </Label>
                </div>
              ))}
            {milestones.filter((milestone) => milestone.loeIds.some((id: string) => loeIds.includes(id))).length === 0 && (
              <p className="text-gray-500 text-sm">No milestones available for selected LOEs</p>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/* Subtasks */}
        <div>
          <Label htmlFor="task-subtasks">Subtasks</Label>
          <div className="space-y-2">
            <Button type="button" size="sm" onClick={() => setShowSubtaskInput(true)}>
              Add Subtask
            </Button>
            {showSubtaskInput && (
              <div className="flex gap-2 mt-2">
                <Input
                  id="task-subtask-input"
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  placeholder="Enter subtask description"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (subtaskInput.trim()) {
                      setSubtasks([...subtasks, subtaskInput.trim()])
                      setSubtaskInput("")
                      setShowSubtaskInput(false)
                    }
                  }}
                >
                  Add
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowSubtaskInput(false)}>
                  Cancel
                </Button>
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {subtasks.map((subtask, idx) => (
                <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm flex items-center gap-1">
                  {subtask}
                  <button type="button" className="ml-1 text-blue-500 hover:text-blue-700 text-base" onClick={() => setSubtasks(subtasks.filter((_, i) => i !== idx))}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* Issues */}
        <div>
          <Label htmlFor="task-issues">Issues</Label>
          <div className="space-y-2">
            <Button type="button" size="sm" onClick={() => setShowIssueInput(true)}>
              Add Issue
            </Button>
            {showIssueInput && (
              <div className="flex gap-2 mt-2">
                <Input
                  id="task-issue-input"
                  value={issueInput}
                  onChange={(e) => setIssueInput(e.target.value)}
                  placeholder="Enter issue description"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (issueInput.trim()) {
                      setIssues([...issues, { text: issueInput.trim() }])
                      setIssueInput("")
                      setShowIssueInput(false)
                    }
                  }}
                >
                  Add
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowIssueInput(false)}>
                  Cancel
                </Button>
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {issues.map((issue, idx) => (
                <span key={idx} className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm flex items-center gap-1">
                  {issue.text}
                  <button type="button" className="ml-1 text-red-500 hover:text-red-700 text-base" onClick={() => setIssues(issues.filter((_, i) => i !== idx))}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* External and Internal Coordination side by side (External first) */}
      <div className="grid grid-cols-2 gap-4">
        {/* External Coordination */}
        <div>
          <Label className="text-base font-medium">External Coordination</Label>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-sm font-medium">Military Departments</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {externalCoordOptions.mildeps.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`mildep-${option}`}
                      checked={externalCoord.includes(option)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setExternalCoord([...externalCoord, option])
                        } else {
                          setExternalCoord(externalCoord.filter((c) => c !== option))
                        }
                      }}
                    />
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
                    <Checkbox
                      id={`command-${option}`}
                      checked={externalCoord.includes(option)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setExternalCoord([...externalCoord, option])
                        } else {
                          setExternalCoord(externalCoord.filter((c) => c !== option))
                        }
                      }}
                    />
                    <Label htmlFor={`command-${option}`} className="text-sm">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="other-orgs">Other Organizations</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedOtherOrgs.map((org, idx) => (
                  <span key={org} className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm flex items-center gap-1">
                    {org}
                    <button type="button" className="ml-1 text-blue-500 hover:text-blue-700 text-base" onClick={() => setSelectedOtherOrgs(selectedOtherOrgs.filter((_, i) => i !== idx))}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  id="other-org-input"
                  value={otherOrgInput}
                  onChange={(e) => setOtherOrgInput(e.target.value)}
                  placeholder="Enter organization name"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (otherOrgInput.trim() && !selectedOtherOrgs.includes(otherOrgInput.trim())) {
                      setSelectedOtherOrgs([...selectedOtherOrgs, otherOrgInput.trim()])
                      setOtherOrgInput("")
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Internal Coordination */}
        <div>
          <Label className="text-base font-medium">Internal Coordination</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {internalCoordOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`internal-${option}`}
                  checked={internalCoord.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setInternalCoord([...internalCoord, option])
                    } else {
                      setInternalCoord(internalCoord.filter((c) => c !== option))
                    }
                  }}
                />
                <Label htmlFor={`internal-${option}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button type="submit">
          {mode === "add" ? "Create Task" : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Back
        </Button>
      </div>
    </form>
  )
} 