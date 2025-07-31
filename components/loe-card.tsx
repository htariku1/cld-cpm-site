"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Users, Target, CheckCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { useData, type LOE } from "@/lib/data-context"
import { formatDate, getHealthLabel, getHealthColor } from "@/lib/utils"
import { calculateLOEHealth } from "@/lib/health-utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useRef } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { LOEForm } from "@/components/loe-form";

interface LOECardProps {
  loe: LOE | null
  isOpen: boolean
  onClose: () => void
}

export function LOECard({ loe, isOpen, onClose }: LOECardProps) {
  const { getTaskCountForLOE, milestones, tasks, deleteLOE, addLOE, updateTask } = useData()

  // Local duration calculation (inclusive of both start and end date)
  function getDurationInDays(startDate?: string, endDate?: string) {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = end.getTime() - start.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  // For checkboxes, split comma-separated orgs into arrays
  const orgOptions = ["CPMR", "IAPR", "TMTR"]
  const [editName, setEditName] = useState(loe?.name || "")
  const [editDescription, setEditDescription] = useState(loe?.purpose || "")
  const [editDeliverable, setEditDeliverable] = useState(loe?.deliverable || "")
  const [editLeadOrgs, setEditLeadOrgs] = useState<string[]>(loe?.leadOrg ? loe.leadOrg.split(/, ?/) : [])
  const [editSupportingOrgs, setEditSupportingOrgs] = useState<string[]>(loe?.supportingOrg ? loe.supportingOrg.split(/, ?/) : [])
  const [editCPMR, setEditCPMR] = useState(loe?.cpmrContributions || "")
  const [editIAPR, setEditIAPR] = useState(loe?.iaprContributions || "")
  const [editTMTR, setEditTMTR] = useState(loe?.tmtrContributions || "")
  const [editMilestones, setEditMilestones] = useState<string[]>(milestones.filter(m => m.loeIds.includes(loe?.id || "")).map(m => m.id))

  if (!loe) return null

  const taskCount = getTaskCountForLOE(loe.id)
  const duration = getDurationInDays(loe.startDate, loe.endDate)
  const loeMilestones = milestones.filter((milestone) => milestone.loeIds.includes(loe.id))
  const loeTasks = tasks.filter(task => task.loeId === loe.id)
  const calculatedHealth = calculateLOEHealth(loeTasks)

  const handleEdit = () => {
    setEditName(loe.name)
    setEditDescription(loe.purpose)
    setEditDeliverable(loe.deliverable)
    setEditLeadOrgs(loe.leadOrg ? loe.leadOrg.split(/, ?/) : [])
    setEditSupportingOrgs(loe.supportingOrg ? loe.supportingOrg.split(/, ?/) : [])
    setEditCPMR(loe.cpmrContributions)
    setEditIAPR(loe.iaprContributions)
    setEditTMTR(loe.tmtrContributions)
    setEditMilestones(milestones.filter(m => m.loeIds.includes(loe.id)).map(m => m.id))
    setEditDialogOpen(true)
  }

  const handleDelete = () => {
    if (loe) {
      deleteLOE(loe.id)
      onClose()
    }
  }

  // Add a helper to validate required fields
  function isValidLOE(loe: any) {
    return loe.name && loe.purpose && loe.startDate && loe.endDate && loe.deliverable && loe.leadOrg && loe.supportingOrg;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="space-y-4">
            {/* Title and Subtitle */}
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">{loe.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Start Date</span>
                  <span className="text-sm text-gray-900">{loe.startDate ? formatDate(loe.startDate) : "—"}</span>
                  <span className="mx-2 text-gray-400">—</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">End Date</span>
                  <span className="text-sm text-gray-900">{loe.endDate ? formatDate(loe.endDate) : "—"}</span>
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
                      Edit LOE
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete LOE
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{taskCount}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Overall Health</p>
                    <Badge className={getHealthColor(calculatedHealth)}>{getHealthLabel(calculatedHealth)}</Badge>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Organizations</p>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900">{loe.leadOrg}</p>
                      <p className="text-gray-600">{loe.supportingOrg}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </DialogHeader>

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column: Overview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">LOE Deliverable</h4>
                  <p className="text-gray-700">{loe.deliverable}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Cross-Functional Contributions</h4>

                  <div className="space-y-3">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-medium text-blue-900 mb-1">CPMR Contributions</h5>
                      <p className="text-sm text-gray-700">{loe.cpmrContributions}</p>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <h5 className="font-medium text-green-900 mb-1">IAPR Contributions</h5>
                      <p className="text-sm text-gray-700">{loe.iaprContributions}</p>
                    </div>

                    <div className="border-l-4 border-orange-500 pl-4">
                      <h5 className="font-medium text-orange-900 mb-1">TMTR Contributions</h5>
                      <p className="text-sm text-gray-700">{loe.tmtrContributions}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Milestones */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                {loeMilestones.length > 0 ? (
                  <div className="space-y-4">
                    {loeMilestones.map((milestone) => (
                      <Card key={milestone.id} className="p-4 bg-gray-50">
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{milestone.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-500">Date: {formatDate(milestone.date)}</span>
                              <span className="text-xs text-gray-500">Deliverable: {milestone.deliverable}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No milestones associated with this LOE yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
        {/* Edit LOE Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit LOE</DialogTitle>
            </DialogHeader>
            <LOEForm
              initialValues={{
                ...loe,
                milestoneIds: milestones.filter(m => m.loeIds.includes(loe.id)).map(m => m.id),
                startDate: loe.startDate,
                endDate: loe.endDate
              }}
              milestones={milestones}
              onSubmit={(updatedLoe: any) => {
                if (!isValidLOE(updatedLoe)) {
                  alert('Please fill in all required fields.');
                  return;
                }
                if (typeof updateTask === 'function') {
                  updateTask(loe.id, updatedLoe);
                } else {
                  addLOE(updatedLoe);
                }
                setEditDialogOpen(false)
              }}
              onCancel={() => setEditDialogOpen(false)}
              submitLabel="Save Changes"
            />
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}