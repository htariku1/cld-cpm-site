"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Flag, Diamond } from "lucide-react"
import { useData } from "@/lib/data-context"
import { formatDate } from "@/lib/utils"
import { useEffect, useState } from "react"

export function GanttTimeline() {
  const { loes, tasks, milestones } = useData()

  // Generate months for the timeline (July 2025 to April 2026)
  const generateMonths = () => {
    const months = []
    const startDate = new Date(2025, 6, 1) // July 2025 (month 6 = July)
    for (let i = 0; i < 10; i++) {
      // 10 months: July 2025 to April 2026
      const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1)
      months.push({
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        label: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        date: date,
      })
    }
    return months
  }

  const months = generateMonths()

  // Calculate position and width for timeline items
  const getTimelinePosition = (startDate: string, endDate?: string) => {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : start
    const timelineStart = new Date(2025, 6, 1) // July 2025
    const timelineEnd = new Date(2026, 3, 30) // April 2026

    const totalDays = (timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)
    const startDays = (start.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)
    const duration = endDate ? (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) : 1 // Single day for milestones

    const leftPercent = Math.max(0, (startDays / totalDays) * 100)
    const widthPercent = Math.min(100 - leftPercent, (duration / totalDays) * 100)

    return { left: `${leftPercent}%`, width: `${Math.max(widthPercent, 1)}%` }
  }

  // Calculate "today" line position
  const getTodayPosition = () => {
    const today = new Date()
    const timelineStart = new Date(2025, 6, 1) // July 2025
    const timelineEnd = new Date(2026, 3, 30) // April 2026

    const totalDays = (timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)
    const todayDays = (today.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)

    const leftPercent = (todayDays / totalDays) * 100

    // Only show today line if it's within the timeline range
    if (leftPercent >= 0 && leftPercent <= 100) {
      return leftPercent
    }
    return null
  }

  // --- Hydration fix: move todayPosition and todayLabel to client state ---
  const [todayPosition, setTodayPosition] = useState<number | null>(null)
  const [todayLabel, setTodayLabel] = useState<string>("")

  useEffect(() => {
    const now = new Date()
    setTodayLabel(now.toLocaleDateString())
    setTodayPosition(getTodayPosition())
  }, [])
  // --- End hydration fix ---

  const getTasksForLOE = (loeId: string) => {
    return tasks.filter((task) => task.loeId === loeId)
  }

  const getMilestonesForLOE = (loeId: string) => {
    return milestones.filter((milestone) => milestone.loeIds.includes(loeId))
  }

  const getDeliverablesForLOE = (loeId: string) => {
    const loeTasks = getTasksForLOE(loeId)
    return loeTasks.filter((task) => task.deliverable && task.deliverable.trim() !== "").length
  }

  const getDurationText = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays} days`
  }

  return (
    <TooltipProvider>
      <Card className="min-w-[2000px]">
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Timeline view of LOEs, tasks, milestones, and deliverables</CardDescription>

          {/* Legend moved to top */}
          <div className="flex items-center gap-6 pt-2 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-gray-600">Milestones</span>
            </div>
            <div className="flex items-center gap-2">
              <Diamond className="h-4 w-4 text-green-500 fill-current" />
              <span className="text-sm text-gray-600">Deliverables</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-0.5 h-4 bg-red-500"></div>
              <span className="text-sm text-gray-600">Today</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-w-[2000px]">
          <div className="space-y-6">
            {/* Timeline Header */}
            <div className="relative">
              <div className="flex border-b border-gray-200 pb-2">
                <div className="w-80 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-600">Line of Effort</span>
                </div>
                <div className="flex-1 relative">
                  <div className="flex">
                    {months.map((month) => (
                      <div key={month.key} className="flex-1 text-center">
                        <span className="text-xs font-medium text-gray-600">{month.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* LOE Rows */}
            <div className="space-y-8">
              {loes.map((loe, loeIndex) => {
                const loeTasks = getTasksForLOE(loe.id)
                const loeMilestones = getMilestonesForLOE(loe.id)
                const loeDeliverables = getDeliverablesForLOE(loe.id)

                return (
                  <div key={loe.id} className="relative">
                    <div className="flex">
                      {/* LOE Name */}
                      <div className="w-80 flex-shrink-0 pr-4">
                        <div className="sticky left-0">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">{loe.name}</h4>
                            <p className="text-xs text-gray-600">{loe.purpose}</p>
                            <div className="mt-2 flex gap-1 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {loeTasks.length} tasks
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {loeMilestones.length} milestones
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {loeDeliverables} deliverables
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Area */}
                      <div className="flex-1 relative min-h-[120px] bg-gray-50 rounded-lg p-2 pr-32 min-w-[2000px]">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex">
                          {months.map((month, index) => (
                            <div key={month.key} className="flex-1 border-r border-gray-200 last:border-r-0" />
                          ))}
                        </div>

                        {/* Today line */}
                        {todayPosition !== null && (
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                            style={{ left: `${todayPosition}%` }}
                            title={`Today: ${todayLabel}`}
                          >
                            <div className="absolute -top-2 -left-6 text-xs text-red-500 font-medium bg-white px-1 rounded">
                              Today
                            </div>
                          </div>
                        )}

                        {/* Tasks */}
                        {loeTasks.map((task, taskIndex) => {
                          const position = getTimelinePosition(task.startDate, task.endDate)
                          return (
                            <Tooltip key={task.id}>
                              <TooltipTrigger asChild>
                                <div
                                  className="absolute h-6 bg-blue-500 rounded text-white text-xs flex items-center px-2 shadow-sm hover:bg-blue-600 cursor-pointer"
                                  style={{
                                    left: position.left,
                                    width: position.width,
                                    top: `${20 + taskIndex * 28}px`,
                                  }}
                                >
                                  <span className="truncate">{task.name}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <div className="space-y-2">
                                  <div>
                                    <p className="font-semibold">{task.name}</p>
                                    <p className="text-sm text-gray-600">{task.description}</p>
                                  </div>
                                  <div className="text-sm">
                                    <p>
                                      <strong>Owner:</strong> {task.owner}
                                    </p>
                                    <p>
                                      <strong>Timeline:</strong> {formatDate(task.startDate)} -{" "}
                                      {formatDate(task.endDate)}
                                    </p>
                                    <p>
                                      <strong>Duration:</strong> {getDurationText(task.startDate, task.endDate)}
                                    </p>
                                    <p>
                                      <strong>Status:</strong> {task.status}
                                    </p>
                                    <p>
                                      <strong>Type:</strong> {task.type === "formal" ? "Formal" : "Informal"}
                                    </p>
                                    <p>
                                      <strong>Deliverable:</strong> {task.deliverable}
                                    </p>
                                    {task.assignedTypes && task.assignedTypes.length > 0 && (
                                      <p>
                                        <strong>Assigned to:</strong> {task.assignedTypes.join(", ")}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )
                        })}

                        {/* Milestones */}
                        {loeMilestones.map((milestone) => {
                          const position = getTimelinePosition(milestone.date)
                          return (
                            <Tooltip key={milestone.id}>
                              <TooltipTrigger asChild>
                                <div
                                  className="absolute flex items-center justify-center"
                                  style={{
                                    left: position.left,
                                    top: `${20 + loeTasks.length * 28 + 10}px`,
                                  }}
                                >
                                  <Flag className="h-5 w-5 text-orange-500 cursor-pointer hover:text-orange-600" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <div className="space-y-2">
                                  <div>
                                    <p className="font-semibold">{milestone.name}</p>
                                    <p className="text-sm text-gray-600">{milestone.description}</p>
                                  </div>
                                  <div className="text-sm">
                                    <p>
                                      <strong>Date:</strong> {formatDate(milestone.date)}
                                    </p>
                                    <p>
                                      <strong>Lead Org:</strong> {milestone.leadOrg}
                                    </p>
                                    <p>
                                      <strong>Supporting Org:</strong> {milestone.supportingOrg}
                                    </p>
                                    <p>
                                      <strong>Deliverable:</strong> {milestone.deliverable}
                                    </p>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )
                        })}

                        {/* Deliverables (shown as diamonds near task end dates) */}
                        {loeTasks.map((task, taskIndex) => {
                          if (task.deliverable && task.deliverable.trim() !== "") {
                            const position = getTimelinePosition(task.endDate)
                            return (
                              <Tooltip key={`deliverable-${task.id}`}>
                                <TooltipTrigger asChild>
                                  <div
                                    className="absolute flex items-center justify-center"
                                    style={{
                                      left: position.left,
                                      top: `${20 + taskIndex * 28 + 2}px`,
                                    }}
                                  >
                                    <Diamond className="h-4 w-4 text-green-500 cursor-pointer hover:text-green-600 fill-current" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm">
                                  <div className="space-y-2">
                                    <div>
                                      <p className="font-semibold">Task Deliverable</p>
                                      <p className="text-sm text-gray-600">{task.deliverable}</p>
                                    </div>
                                    <div className="text-sm">
                                      <p>
                                        <strong>From Task:</strong> {task.name}
                                      </p>
                                      <p>
                                        <strong>Owner:</strong> {task.owner}
                                      </p>
                                      <p>
                                        <strong>Due Date:</strong> {formatDate(task.endDate)}
                                      </p>
                                      <p>
                                        <strong>Status:</strong> {task.status}
                                      </p>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )
                          }
                          return null
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
