"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Users, Target, CheckCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { useData, type LOE } from "@/lib/data-context"
import { formatDate, getHealthLabel, getHealthColor } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"

interface LOECardProps {
  loe: LOE | null
  isOpen: boolean
  onClose: () => void
}

export function LOECard({ loe, isOpen, onClose }: LOECardProps) {
  const { getTaskCountForLOE, getDurationInDays, milestones } = useData()

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: loe?.name || "",
    purpose: loe?.purpose || "",
    deliverable: loe?.deliverable || "",
    startDate: loe?.startDate || "",
    endDate: loe?.endDate || "",
    leadOrg: loe?.leadOrg || "",
    supportingOrg: loe?.supportingOrg || "",
    cpmrContributions: loe?.cpmrContributions || "",
    iaprContributions: loe?.iaprContributions || "",
    tmtrContributions: loe?.tmtrContributions || "",
    overallHealth: loe?.overallHealth || "Good",
    associatedMilestones: [] as string[],
  })

  if (!loe) return null

  const taskCount = getTaskCountForLOE(loe.id)
  const duration = getDurationInDays(loe.startDate, loe.endDate)
  const loeMilestones = milestones.filter((milestone) => milestone.loeIds.includes(loe.id))

  const handleEdit = () => {
    setEditFormData({
      name: loe.name,
      purpose: loe.purpose,
      deliverable: loe.deliverable,
      startDate: loe.startDate,
      endDate: loe.endDate,
      leadOrg: loe.leadOrg,
      supportingOrg: loe.supportingOrg,
      cpmrContributions: loe.cpmrContributions,
      iaprContributions: loe.iaprContributions,
      tmtrContributions: loe.tmtrContributions,
      overallHealth: loe.overallHealth,
      associatedMilestones: loeMilestones.map((m) => m.id), // Pre-select current milestones
    })
    setEditDialogOpen(true)
  }

  const handleDelete = () => {
    console.log("Delete LOE:", loe.id)
    // TODO: Implement delete functionality
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
                <p className="text-sm text-gray-600">
                  {formatDate(loe.startDate)} – {formatDate(loe.endDate)} ({duration} days)
                </p>
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
                    <Badge className={getHealthColor(loe.overallHealth)}>{getHealthLabel(loe.overallHealth)}</Badge>
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
            <div className="space-y-6 mt-6">
              <div>
                <Label htmlFor="edit-loe-name">LOE Name</Label>
                <Input
                  id="edit-loe-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-loe-purpose">Purpose</Label>
                <Textarea
                  id="edit-loe-purpose"
                  value={editFormData.purpose}
                  onChange={(e) => setEditFormData({ ...editFormData, purpose: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-loe-deliverable">LOE Deliverable</Label>
                <Input
                  id="edit-loe-deliverable"
                  value={editFormData.deliverable}
                  onChange={(e) => setEditFormData({ ...editFormData, deliverable: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-loe-start-date">Start Date</Label>
                  <Input
                    id="edit-loe-start-date"
                    type="date"
                    value={editFormData.startDate}
                    onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-loe-end-date">End Date</Label>
                  <Input
                    id="edit-loe-end-date"
                    type="date"
                    value={editFormData.endDate}
                    onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-overall-health">Overall Health</Label>
                  <Select
                    value={editFormData.overallHealth}
                    onValueChange={(value) => setEditFormData({ ...editFormData, overallHealth: value as 'Good' | 'At Risk' | 'Critical' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="At Risk">At Risk</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-lead-org">Lead Organization(s)</Label>
                  <Input
                    id="edit-lead-org"
                    value={editFormData.leadOrg}
                    onChange={(e) => setEditFormData({ ...editFormData, leadOrg: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-supporting-org">Supporting Organization(s)</Label>
                  <Input
                    id="edit-supporting-org"
                    value={editFormData.supportingOrg}
                    onChange={(e) => setEditFormData({ ...editFormData, supportingOrg: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-cpmr-contrib">CPMR Contributions</Label>
                <Textarea
                  id="edit-cpmr-contrib"
                  value={editFormData.cpmrContributions}
                  onChange={(e) => setEditFormData({ ...editFormData, cpmrContributions: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-iapr-contrib">IAPR Contributions</Label>
                <Textarea
                  id="edit-iapr-contrib"
                  value={editFormData.iaprContributions}
                  onChange={(e) => setEditFormData({ ...editFormData, iaprContributions: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-tmtr-contrib">TMTR Contributions</Label>
                <Textarea
                  id="edit-tmtr-contrib"
                  value={editFormData.tmtrContributions}
                  onChange={(e) => setEditFormData({ ...editFormData, tmtrContributions: e.target.value })}
                />
              </div>

              <div>
                <Label>Associated Milestones</Label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-3 mt-2">
                  {milestones
                    .filter((milestone) => milestone.loeIds.includes(loe.id))
                    .map((milestone) => (
                      <div
                        key={milestone.id}
                        className="flex items-start space-x-2 py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <Checkbox
                          id={`loe-milestone-${milestone.id}`}
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
                        <div className="flex-1">
                          <Label htmlFor={`loe-milestone-${milestone.id}`} className="text-sm font-medium">
                            {milestone.name}
                          </Label>
                          <p className="text-xs text-gray-600 mt-1">{milestone.description}</p>
                          <p className="text-xs text-gray-500">Date: {formatDate(milestone.date)}</p>
                        </div>
                      </div>
                    ))}
                  {milestones.filter((milestone) => milestone.loeIds.includes(loe.id)).length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No milestones associated with this LOE yet.
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Select milestones that are directly associated with this LOE's deliverables and timeline.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    console.log("Save LOE:", editFormData)
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
