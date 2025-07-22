"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { TaskCard } from "@/components/task-card"
import { getHealthLabel, getHealthColor, formatDate } from "@/lib/utils"
import { calculateComponentHealth, calculateOverallHealth, healthToLabel, inferTaskHealth } from "@/lib/health-utils"
import { useData } from "@/lib/data-context"

export default function SustainmentPage() {
  const [expandedLOE, setExpandedLOE] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const { loes, tasks } = useData();

  // Filter LOEs for sustainment category (if needed)
  const sustainmentLOEs = loes.filter(loe => {
    // Optionally filter by category if you add it to LOE, or just use all
    return true;
  });

  // For each LOE, filter tasks by loeId and category
  const getTasksForLOE = (loeId: string) => tasks.filter(task => task.loeId === loeId && (task.category === "sustainment" || !task.category));

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
    task => (task.category === "sustainment" || !task.category) && sustainmentLOEIds.includes(task.loeId)
  );
  // Use inferred health for each org
  const cpmrHealthData = allSustainmentTasks.filter(task => (task.assignedTypes || []).includes("CPMR"));
  const iaprHealthData = allSustainmentTasks.filter(task => (task.assignedTypes || []).includes("IAPR"));
  const tmtrHealthData = allSustainmentTasks.filter(task => (task.assignedTypes || []).includes("TMTR"));
  const cpmrHealth = calculateComponentHealth(cpmrHealthData.map(task => ({ health: inferTaskHealth(task), taskCount: 1 })));
  const iaprHealth = calculateComponentHealth(iaprHealthData.map(task => ({ health: inferTaskHealth(task), taskCount: 1 })));
  const tmtrHealth = calculateComponentHealth(tmtrHealthData.map(task => ({ health: inferTaskHealth(task), taskCount: 1 })));
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

              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-medium mb-2">CPMR</h3>
                <div className="flex items-center justify-between">
                  <Badge className={`py-1 px-3 ${getHealthColor(cpmrHealth)}`}>{healthToLabel(cpmrHealth)}</Badge>
                  <span className="text-sm text-gray-500">
                    {cpmrHealthData.length} tasks
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-medium mb-2">IAPR</h3>
                <div className="flex items-center justify-between">
                  <Badge className={`py-1 px-3 ${getHealthColor(iaprHealth)}`}>{healthToLabel(iaprHealth)}</Badge>
                  <span className="text-sm text-gray-500">
                    {iaprHealthData.length} tasks
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-medium mb-2">TMTR</h3>
                <div className="flex items-center justify-between">
                  <Badge className={`py-1 px-3 ${getHealthColor(tmtrHealth)}`}>{healthToLabel(tmtrHealth)}</Badge>
                  <span className="text-sm text-gray-500">
                    {tmtrHealthData.length} tasks
                  </span>
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
                      <div className="space-y-4">
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
