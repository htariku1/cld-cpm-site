"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2, MoreHorizontal } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { TaskCard } from "@/components/task-card"
import { getHealthLabel, getHealthColor, formatDate } from "@/lib/utils"
import { calculateComponentHealth, calculateOverallHealth, healthToLabel, inferTaskHealth, calculateLOEHealth } from "@/lib/health-utils"
import { Dialog, DialogContentLarge, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useData } from "@/lib/data-context"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"

export default function SustainmentPage() {
  const router = useRouter();
  const [expandedLOE, setExpandedLOE] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [remediesOpen, setRemediesOpen] = useState<string | null>(null) // loeId for modal
  const [editingRemedy, setEditingRemedy] = useState<{ [issueKey: string]: string }>({})
  const [openRemedyInput, setOpenRemedyInput] = useState<string | null>(null)
  const { loes, tasks, updateTask } = useData();

  // Filter LOEs for sustainment category (if needed)
  const sustainmentLOEs = loes.filter(loe => {
    // Optionally filter by category if you add it to LOE, or just use all
    return true;
  });

  // For each LOE, filter tasks by loeId and category
  const getTasksForLOE = (loeId: string) => tasks.filter(task => task.loeId === loeId && task.category === "sustainment");

  // Calculate health and task counts for CPMR, IAPR, TMTR
  const getOrgStats = (loeTasks: any[], org: string) => {
    const orgTasks = loeTasks.filter(task => (task.assignedTypes || []).includes(org));
    // Use inferred health for each task
    const health = calculateComponentHealth(
      orgTasks.map(task => ({ health: inferTaskHealth(task), taskCount: 1 }))
    );
    return {
      taskCount: orgTasks.length,
      health,
    };
  };

  // Helper function to calculate duration in days
  const getDurationInDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Only include tasks whose loeId matches a sustainment LOE
  const sustainmentLOEIds = sustainmentLOEs.map(loe => loe.id);
  const allSustainmentTasks = tasks.filter(
    task => task.category === "sustainment" && sustainmentLOEIds.includes(task.loeId)
  );
  // Use inferred health for each org
  const cpmrHealthData = allSustainmentTasks.filter(task => (task.assignedTypes || []).includes("CPMR"));
  const iaprHealthData = allSustainmentTasks.filter(task => (task.assignedTypes || []).includes("IAPR"));
  const tmtrHealthData = allSustainmentTasks.filter(task => (task.assignedTypes || []).includes("TMTR"));
  const cpmrHealth = calculateComponentHealth(cpmrHealthData.map(task => ({ health: inferTaskHealth({ ...task, issues: task.issues.map(issue => issue.text) }), taskCount: 1 })));
  const iaprHealth = calculateComponentHealth(iaprHealthData.map(task => ({ health: inferTaskHealth({ ...task, issues: task.issues.map(issue => issue.text) }), taskCount: 1 })));
  const tmtrHealth = calculateComponentHealth(tmtrHealthData.map(task => ({ health: inferTaskHealth({ ...task, issues: task.issues.map(issue => issue.text) }), taskCount: 1 })));
  const overallHealth = calculateOverallHealth(cpmrHealth, iaprHealth, tmtrHealth);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Sustainment</h1>

        {/* Health Status Summary - you can implement this using context data if needed */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Health Status Summary</CardTitle>
            <CardDescription>Overall health status of sustainment capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-medium mb-2">Overall Health</h3>
                <div className="flex items-center justify-between">
                  <Badge className={`py-1 px-3 ${getHealthColor(overallHealth)}`}>{healthToLabel(overallHealth)}</Badge>
                  <span className="text-sm text-gray-500">System-wide</span>
                </div>
              </div>
              <div
                className="bg-gray-50 p-4 rounded-lg border cursor-pointer hover:bg-gray-100"
                onClick={() => router.push("/sustainment/cpmr")}
                role="button"
                tabIndex={0}
                onKeyPress={e => { if (e.key === "Enter" || e.key === " ") router.push("/sustainment/cpmr") }}
                aria-label="Go to CPMR sustainment page"
              >
                <h3 className="text-lg font-medium mb-2">CPMR</h3>
                <div className="flex items-center justify-between">
                  <Badge className={`py-1 px-3 ${getHealthColor(cpmrHealth)}`}>{healthToLabel(cpmrHealth)}</Badge>
                  <span className="text-sm text-gray-500">{cpmrHealthData.length} tasks</span>
                </div>
              </div>
              <div
                className="bg-gray-50 p-4 rounded-lg border cursor-pointer hover:bg-gray-100"
                onClick={() => router.push("/sustainment/iapr")}
                role="button"
                tabIndex={0}
                onKeyPress={e => { if (e.key === "Enter" || e.key === " ") router.push("/sustainment/iapr") }}
                aria-label="Go to IAPR sustainment page"
              >
                <h3 className="text-lg font-medium mb-2">IAPR</h3>
                <div className="flex items-center justify-between">
                  <Badge className={`py-1 px-3 ${getHealthColor(iaprHealth)}`}>{healthToLabel(iaprHealth)}</Badge>
                  <span className="text-sm text-gray-500">{iaprHealthData.length} tasks</span>
                </div>
              </div>
              <div
                className="bg-gray-50 p-4 rounded-lg border cursor-pointer hover:bg-gray-100"
                onClick={() => router.push("/sustainment/tmtr")}
                role="button"
                tabIndex={0}
                onKeyPress={e => { if (e.key === "Enter" || e.key === " ") router.push("/sustainment/tmtr") }}
                aria-label="Go to TMTR sustainment page"
              >
                <h3 className="text-lg font-medium mb-2">TMTR</h3>
                <div className="flex items-center justify-between">
                  <Badge className={`py-1 px-3 ${getHealthColor(tmtrHealth)}`}>{healthToLabel(tmtrHealth)}</Badge>
                  <span className="text-sm text-gray-500">{tmtrHealthData.length} tasks</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {sustainmentLOEs.map((loe) => {
            const loeTasks = getTasksForLOE(loe.id);
            const cpmr = getOrgStats(loeTasks, "CPMR");
            const iapr = getOrgStats(loeTasks, "IAPR");
            const tmtr = getOrgStats(loeTasks, "TMTR");
            const calculatedHealth = calculateLOEHealth(loeTasks);
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
                        <div className="flex gap-4">
                          <div className="text-center">
                            <div className="text-sm font-medium">CPMR</div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{cpmr.taskCount} tasks</Badge>
                              <Badge className={getHealthColor(cpmr.health)}>
                                {getHealthLabel(cpmr.health)}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium">IAPR</div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{iapr.taskCount} tasks</Badge>
                              <Badge className={getHealthColor(iapr.health)}>
                                {getHealthLabel(iapr.health)}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium">TMTR</div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{tmtr.taskCount} tasks</Badge>
                              <Badge className={getHealthColor(tmtr.health)}>
                                {getHealthLabel(tmtr.health)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      {/* Task Status Metrics Cards */}
                      <TaskStatusMetrics
                        loeTasks={loeTasks}
                        onLateTasksClick={() => setRemediesOpen(loe.id)}
                      />
                      <div className="space-y-4 mt-6">
                        <h4 className="font-semibold text-gray-900">Associated Tasks</h4>
                        {loeTasks.length > 0 ? (
                          <div className="space-y-2">
                            {loeTasks.map((task) => (
                              <div
                                key={task.id}
                                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                                onClick={() => setSelectedTask(task)}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="font-medium">{task.name}</h5>
                                    <p className="text-sm text-gray-600">
                                      {formatDate(task.startDate)} - {formatDate(task.endDate)}
                                    </p>
                                    <p className="text-sm text-gray-700 mt-1">{task.description}</p>
                                  </div>
                                  <div className="text-right">
                                    <Badge variant="outline">{task.status}</Badge>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {Array.isArray(task.issues) ? task.issues.length : task.issues} issues
                                    </p>
                                    <p className="text-sm text-gray-600">Owner: {task.owner}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">No tasks associated with this LOE yet.</p>
                        )}
                      </div>
                      {/* Remedies & Issue Tracking Modal */}
                      <Dialog open={remediesOpen === loe.id} onOpenChange={() => setRemediesOpen(null)}>
                        <DialogContentLarge>
                          <DialogHeader>
                            <DialogTitle>Issues & Remedies Tracking</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <h4 className="font-semibold text-gray-900">Late Tasks</h4>
                            {/* Late Tasks Table Header */}
                            <div className="hidden md:flex font-semibold text-gray-700 mb-2 border-b pb-2">
                              <div className="md:w-1/3 pr-4">Task</div>
                              <div className="md:w-1/3 px-4">Issues</div>
                              <div className="md:w-1/3 pl-4">Remedy</div>
                            </div>
                            {loeTasks.filter(isLateTask).length === 0 ? (
                              <p className="text-gray-500">No late tasks for this LOE.</p>
                            ) : (
                              <div className="space-y-4">
                                {loeTasks.filter(isLateTask).map((task) => (
                                  <div key={task.id} className="border rounded-lg p-4 flex flex-col md:flex-row gap-4 md:gap-0 items-stretch">
                                    {/* Task Name Column */}
                                    <div className="md:w-1/3 flex flex-col justify-center pr-4 md:border-r">
                                      <h5 className="font-medium text-lg">{task.name}</h5>
                                      <p className="text-xs text-gray-600">Owner: {task.owner}</p>
                                      <Badge variant="outline" className="w-fit mt-1">{task.status}</Badge>
                                    </div>
                                    {/* Issues & Remedies Columns */}
                                    <div className="md:w-2/3 flex flex-row">
                                      {/* Issues Column */}
                                      <div className="w-1/2 flex flex-col justify-center px-0 md:px-4 md:border-r bg-red-50 rounded-md py-2">
                                        {task.issues.length > 0 ? (
                                          <ul className="list-disc ml-6 text-sm text-gray-700">
                                            {task.issues.map((issue, idx) => (
                                              <li key={idx} className="mb-2 flex items-center min-h-[2.5rem]">{/* min-h for alignment */}
                                                <span>{issue.text}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        ) : (
                                          <ul className="list-disc ml-6 text-sm text-gray-700">
                                            <li className="text-gray-400 italic">No issues reported</li>
                                          </ul>
                                        )}
                                      </div>
                                      {/* Remedy Column */}
                                      <div className="w-1/2 flex flex-col justify-center pl-0 md:pl-4 bg-green-50 rounded-md py-2">
                                        {task.issues.length > 0 ? (
                                          <ul className="list-none ml-0 text-sm text-gray-700">
                                            {task.issues.map((issue, idx) => (
                                              <li key={idx} className="mb-2 flex items-center min-h-[2.5rem]">{/* min-h for alignment */}
                                                {openRemedyInput === `${task.id}-${idx}` ? (
                                                  <>
                                                    <input
                                                      className="border rounded px-2 py-1 flex-1"
                                                      type="text"
                                                      value={editingRemedy[`${task.id}-${idx}`] ?? issue.remedy ?? ""}
                                                      placeholder="Enter or edit remedy"
                                                      onChange={e => setEditingRemedy(r => ({ ...r, [`${task.id}-${idx}`]: e.target.value }))}
                                                    />
                                                    <Button
                                                      size="sm"
                                                      onClick={() => {
                                                        // Update the remedy for this issue
                                                        const updatedIssues = task.issues.map((iss, i) =>
                                                          i === idx ? { ...iss, remedy: editingRemedy[`${task.id}-${idx}`] ?? "" } : iss
                                                        );
                                                        updateTask(task.id, { issues: updatedIssues });
                                                        setOpenRemedyInput(null);
                                                      }}
                                                    >
                                                      Save
                                                    </Button>
                                                  </>
                                                ) : issue.remedy ? (
                                                  <>
                                                    <span className="text-green-700 text-sm flex-1 font-normal">{issue.remedy}</span>
                                                    <DropdownMenu>
                                                      <DropdownMenuTrigger asChild>
                                                        <button
                                                          className="p-1 rounded hover:bg-gray-200"
                                                          aria-label="Remedy Options"
                                                          type="button"
                                                        >
                                                          <MoreHorizontal className="w-4 h-4" />
                                                        </button>
                                                      </DropdownMenuTrigger>
                                                      <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                          onClick={() => setOpenRemedyInput(`${task.id}-${idx}`)}
                                                        >
                                                          <Pencil className="w-4 h-4 mr-2" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                          onClick={() => {
                                                            const updatedIssues = task.issues.map((iss, i) =>
                                                              i === idx ? { ...iss, remedy: undefined } : iss
                                                            );
                                                            updateTask(task.id, { issues: updatedIssues });
                                                          }}
                                                          className="text-red-600"
                                                        >
                                                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                        </DropdownMenuItem>
                                                      </DropdownMenuContent>
                                                    </DropdownMenu>
                                                  </>
                                                ) : (
                                                  <button
                                                    className="p-1 rounded hover:bg-gray-200"
                                                    aria-label="Add Remedy"
                                                    onClick={() => setOpenRemedyInput(`${task.id}-${idx}`)}
                                                    type="button"
                                                  >
                                                    <Plus className="w-4 h-4" />
                                                  </button>
                                                )}
                                              </li>
                                            ))}
                                          </ul>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <DialogFooter className="mt-6">
                            <DialogClose asChild>
                              <Button variant="outline">Close</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContentLarge>
                      </Dialog>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
        <TaskCard task={selectedTask} isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} />
      </main>
    </div>
  );
}

// Helper: isLateTask
function isLateTask(task: any) {
  const today = new Date();
  const expectedEnd = new Date(task.endDate);
  return task.status !== "completed" && today > expectedEnd;
}
// Metrics Cards Component
function TaskStatusMetrics({ loeTasks, onLateTasksClick }: { loeTasks: any[]; onLateTasksClick: () => void }) {
  const formalCount = loeTasks.filter(t => t.type === "formal").length;
  const informalCount = loeTasks.filter(t => t.type === "informal").length;
  const totalCount = loeTasks.length;
  const completedCount = loeTasks.filter(t => t.status === "completed").length;
  const onTimeCount = loeTasks.filter(t => t.status === "completed" && new Date(t.endDate) >= new Date(t.startDate)).length;
  const lateCount = loeTasks.filter(isLateTask).length;
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <Card className="p-3">
        <div className="font-semibold text-gray-700 mb-0.5 text-sm">Total Tasks</div>
        <div className="flex items-center gap-3 mb-0.5">
          <div className="text-sm font-bold">Formal:<span className="font-normal"> {formalCount}</span></div>
          <div className="h-4 border-l border-gray-300 mx-2" />
          <div className="text-sm font-bold">Informal:<span className="font-normal"> {informalCount}</span></div>
        </div>
        <div className="text-xs"><span className="font-bold">Total:</span> {totalCount}</div>
      </Card>
      <Card className="p-3">
        <div className="font-semibold text-gray-700 mb-0.5 text-sm">Completed Tasks</div>
        <div className="text-xl font-bold">{completedCount}</div>
      </Card>
      <Card className="p-3">
        <div className="font-semibold text-gray-700 mb-0.5 text-sm">On-Track Tasks</div>
        <div className="text-xl font-bold">{onTimeCount}</div>
      </Card>
      <Card className="p-3 cursor-pointer hover:bg-gray-50"
        onClick={onLateTasksClick}
        role="button"
        tabIndex={0}
        aria-label="Show late tasks and remedies"
      >
        <div className="font-semibold text-gray-700 mb-0.5 text-sm">Late Tasks</div>
        <div className="text-xl font-bold">{lateCount}</div>
        <div className="text-xs text-red-500 mt-0.5">Click for remedies</div>
      </Card>
    </div>
  );
}
