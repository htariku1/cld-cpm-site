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

interface MilestoneCardProps {
  milestone: any | null
  isOpen: boolean
  onClose: () => void
}

export function MilestoneCard({ milestone, isOpen, onClose }: MilestoneCardProps) {
  const { loes, tasks } = useData()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: milestone?.name || "",
    date: milestone?.date || "",
    description: milestone?.description || "",
    leadOrg: milestone?.leadOrg || "",
    supportingOrg: milestone?.supportingOrg || "",
    deliverable: milestone?.deliverable || "",
    associatedLOEs: milestone?.loeIds || [],
    associatedTasks: tasks.filter((task) => milestone?.loeIds?.includes(task.loeId)).map((task) => task.id),
  })

  if (!milestone) return null

  // Find associated LOEs and Tasks
  const associatedLOEs = loes.filter((loe) => milestone.loeIds && milestone.loeIds.includes(loe.id))
  const associatedTasks = tasks.filter((task) => milestone.loeIds && milestone.loeIds.includes(task.loeId))

  const handleEdit = () => {
    setEditFormData({
      name: milestone.name,
      date: milestone.date,
      description: milestone.description,
      leadOrg: milestone.leadOrg,
      supportingOrg: milestone.supportingOrg,
      deliverable: milestone.deliverable,
      associatedLOEs: milestone.loeIds || [],
      associatedTasks: tasks.filter((task) => milestone.loeIds && milestone.loeIds.includes(task.loeId)).map((task) => task.id),
    })
    setEditDialogOpen(true)
  }

  const handleDelete = () => {
    console.log("Delete milestone:", milestone.id)
    // TODO: Implement delete functionality
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="space-y-4">
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">{milestone.name}</DialogTitle>
                <p className="text-sm text-gray-600">Due: {formatDate(milestone.date)}</p>
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
              <div>
                <Label htmlFor="edit-milestone-name">Milestone Name</Label>
                <Input
                  id="edit-milestone-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-milestone-date">Due Date</Label>
                <Input
                  id="edit-milestone-date"
                  type="date"
                  value={editFormData.date}
                  onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-milestone-description">Description</Label>
                <Textarea
                  id="edit-milestone-description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-lead-org">Lead Organization</Label>
                  <Input
                    id="edit-lead-org"
                    value={editFormData.leadOrg}
                    onChange={(e) => setEditFormData({ ...editFormData, leadOrg: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-supporting-org">Supporting Organization</Label>
                  <Input
                    id="edit-supporting-org"
                    value={editFormData.supportingOrg}
                    onChange={(e) => setEditFormData({ ...editFormData, supportingOrg: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-deliverable">Deliverable</Label>
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
                    console.log("Save milestone:", editFormData)
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