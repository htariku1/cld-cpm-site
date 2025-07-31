"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Users, Target, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { useData } from "@/lib/data-context"
import { formatDate } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar as UiCalendar } from "@/components/ui/calendar"
import { format, parse } from "date-fns"

interface MilestoneCardProps {
  milestone: any | null
  isOpen: boolean
  onClose: () => void
}

export function MilestoneCard({ milestone, isOpen, onClose }: MilestoneCardProps) {
  const { loes, tasks, deleteMilestone, updateMilestone } = useData()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: milestone?.name || "",
    date: milestone?.date || "",
    description: milestone?.description || "",
    leadOrg: milestone?.leadOrg ? milestone.leadOrg.split(/, ?/) : [],
    supportingOrg: milestone?.supportingOrg ? milestone.supportingOrg.split(/, ?/) : [],
    deliverable: milestone?.deliverable || "",
    associatedLOEs: milestone?.loeIds || [],
    associatedTasks: tasks.filter((task) => milestone?.loeIds?.includes(task.loeId)).map((task) => task.id),
  })

  if (!milestone) return null

  // Find associated LOEs and Tasks
  const associatedLOEs = loes.filter((loe) => milestone.loeIds && milestone.loeIds.includes(loe.id))
  const associatedTasks = tasks.filter((task) => milestone.loeIds && milestone.loeIds.includes(task.loeId))

  function getDurationInDays(start: string, end: string): number | null {
    if (!start || !end) return null;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  const milestoneStart = milestone.date;
  const milestoneEnd = milestone.date;
  const duration = getDurationInDays(milestoneStart, milestoneEnd);

  // Add a helper to validate required fields
  function isValidMilestone(m: any) {
    return m.name && m.date && m.description && m.leadOrg.length > 0 && m.supportingOrg.length > 0 && m.deliverable;
  }

  const handleEdit = () => {
    setEditFormData({
      name: milestone.name,
      date: milestone.date,
      description: milestone.description,
      leadOrg: milestone.leadOrg ? milestone.leadOrg.split(/, ?/) : [],
      supportingOrg: milestone.supportingOrg ? milestone.supportingOrg.split(/, ?/) : [],
      deliverable: milestone.deliverable,
      associatedLOEs: milestone.loeIds || [],
      associatedTasks: tasks.filter((task) => milestone.loeIds && milestone.loeIds.includes(task.loeId)).map((task) => task.id),
    })
    setEditDialogOpen(true)
  }

  const handleDelete = () => {
    if (milestone) {
      deleteMilestone(milestone.id)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="space-y-4">
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">{milestone.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Start Date</span>
                  <span className="text-sm text-gray-900">{milestoneStart ? formatDate(milestoneStart) : "—"}</span>
                  <span className="mx-2 text-gray-400">—</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">End Date</span>
                  <span className="text-sm text-gray-900">{milestoneEnd ? formatDate(milestoneEnd) : "—"}</span>
                  <span className="mx-2 text-gray-400">—</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Duration</span>
                  <span className="text-sm text-gray-900">{duration} day{duration !== 1 ? "s" : ""}</span>
                </div>
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
                      Edit Milestone
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Milestone
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-8">
          {/* Milestone Information Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Milestone Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700">{milestone.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Lead Organization</h4>
                    <p className="text-gray-700">{milestone.leadOrg}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Supporting Organization</h4>
                    <p className="text-gray-700">{milestone.supportingOrg}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Deliverable</h4>
                  <p className="text-gray-700">{milestone.deliverable}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Associated LOEs/Tasks Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Associated LOEs/Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">LOEs</h4>
                  {associatedLOEs.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {associatedLOEs.map((loe) => (
                        <li key={loe.id} className="text-gray-700">{loe.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No associated LOEs</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tasks</h4>
                  {associatedTasks.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {associatedTasks.map((task) => (
                        <li key={task.id} className="text-gray-700">{task.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No associated tasks</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
        {/* Edit Milestone Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Milestone</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-milestone-name">Milestone Name <span style={{color: 'red'}}>*</span></Label>
                  <Input
                    id="edit-milestone-name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-milestone-date">Date <span style={{color: 'red'}}>*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Input
                        id="edit-milestone-date"
                        value={editFormData.date ? format(parse(editFormData.date, "yyyy-MM-dd", new Date()), "MMMM dd, yyyy") : ""}
                        placeholder="Select date"
                        readOnly
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <UiCalendar
                        mode="single"
                        selected={editFormData.date ? parse(editFormData.date, "yyyy-MM-dd", new Date()) : undefined}
                        onSelect={d => setEditFormData(f => ({ ...f, date: d ? format(d, "yyyy-MM-dd") : "" }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Lead Org(s) <span style={{color: 'red'}}>*</span></Label>
                  <div className="flex flex-row gap-2 mt-1">
                    {["CPMR", "IAPR", "TMTR"].map(option => (
                      <label key={option} className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={editFormData.leadOrg.includes(option)}
                          onChange={e => {
                            const arr = editFormData.leadOrg
                            if (e.target.checked) setEditFormData(f => ({ ...f, leadOrg: [...arr, option] }))
                            else setEditFormData(f => ({ ...f, leadOrg: arr.filter((o: string) => o !== option) }))
                          }}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                  {editFormData.leadOrg && (
                    <div className="text-xs text-gray-600 mt-1">
                      <span className="font-semibold">Selected:</span> {editFormData.leadOrg.join(", ")}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Supporting Org(s) <span style={{color: 'red'}}>*</span></Label>
                  <div className="flex flex-row gap-2 mt-1">
                    {["CPMR", "IAPR", "TMTR"].map(option => (
                      <label key={option} className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={editFormData.supportingOrg.includes(option)}
                          onChange={e => {
                            const arr = editFormData.supportingOrg
                            if (e.target.checked) setEditFormData(f => ({ ...f, supportingOrg: [...arr, option] }))
                            else setEditFormData(f => ({ ...f, supportingOrg: arr.filter((o: string) => o !== option) }))
                          }}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                  {editFormData.supportingOrg && (
                    <div className="text-xs text-gray-600 mt-1">
                      <span className="font-semibold">Selected:</span> {editFormData.supportingOrg.join(", ")}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="edit-milestone-description">Description <span style={{color: 'red'}}>*</span></Label>
                <Textarea
                  id="edit-milestone-description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-deliverable">Deliverable <span style={{color: 'red'}}>*</span></Label>
                <Input
                  id="edit-deliverable"
                  value={editFormData.deliverable}
                  onChange={(e) => setEditFormData({ ...editFormData, deliverable: e.target.value })}
                />
              </div>
              {/* Editable Associated LOEs (multi-select) */}
              <div>
                <Label>Associated LOEs</Label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-3 mt-2">
                  {loes.map((loe) => (
                    <div key={loe.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        id={`edit-loe-${loe.id}`}
                        checked={editFormData.associatedLOEs.includes(loe.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setEditFormData(form => ({
                              ...form,
                              associatedLOEs: [...form.associatedLOEs, loe.id],
                              // Add tasks for this LOE to associatedTasks
                              associatedTasks: [
                                ...form.associatedTasks,
                                ...tasks.filter(task => task.loeId === loe.id).map(task => task.id)
                              ].filter((v, i, a) => a.indexOf(v) === i), // unique
                            }))
                          } else {
                            setEditFormData(form => {
                              const newLOEs = form.associatedLOEs.filter((id: string) => id !== loe.id)
                              const newTasks = form.associatedTasks.filter(
                                (taskId: string) => tasks.find(task => task.id === taskId && newLOEs.includes(task.loeId))
                              )
                              return {
                                ...form,
                                associatedLOEs: newLOEs,
                                associatedTasks: newTasks,
                              }
                            })
                          }
                        }}
                      />
                      <Label htmlFor={`edit-loe-${loe.id}`}>{loe.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
              {/* Editable Associated Tasks (multi-select, filtered by selected LOEs) */}
              <div>
                <Label>Associated Tasks</Label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-3 mt-2">
                  {tasks.filter(task => editFormData.associatedLOEs.includes(task.loeId)).length > 0 ? (
                    tasks.filter(task => editFormData.associatedLOEs.includes(task.loeId)).map(task => (
                      <div key={task.id} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          id={`edit-task-${task.id}`}
                          checked={editFormData.associatedTasks.includes(task.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setEditFormData(form => ({
                                ...form,
                                associatedTasks: [...form.associatedTasks, task.id],
                              }))
                            } else {
                              setEditFormData(form => ({
                                ...form,
                                associatedTasks: form.associatedTasks.filter(id => id !== task.id),
                              }))
                            }
                          }}
                        />
                        <Label htmlFor={`edit-task-${task.id}`}>{task.name}</Label>
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
                    if (!isValidMilestone(editFormData)) {
                      alert('Please fill in all required fields.');
                      return;
                    }
                    // Save milestone changes
                    updateMilestone(milestone.id, {
                      name: editFormData.name,
                      date: editFormData.date,
                      description: editFormData.description,
                      leadOrg: editFormData.leadOrg.join(', '),
                      supportingOrg: editFormData.supportingOrg.join(', '),
                      deliverable: editFormData.deliverable,
                      loeIds: editFormData.associatedLOEs,
                    });
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
      </DialogContent>
    </Dialog>
  )
} 