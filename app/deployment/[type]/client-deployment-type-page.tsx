"use client"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { TaskCard } from "@/components/task-card"
import { formatDate } from "@/lib/utils"
import { calculateLOEHealth } from "@/lib/health-utils"

export function ClientDeploymentTypePage({ type }: { type: string }) {
  const [expandedLOE, setExpandedLOE] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const { loes, tasks } = useData();

  const typeLabels = {
    cpmr: "CPMR",
    iapr: "IAPR",
    tmtr: "TMTR",
  };

  // Filter LOEs for deployment category (if needed)
  const deploymentLOEs = loes.filter(loe => {
    // Optionally filter by category if you add it to LOE, or just use all
    return true;
  });

  // For each LOE, filter tasks by loeId, category, and assignedTypes
  const getTasksForLOEAndType = (loeId: string) =>
    tasks.filter(
      task =>
        task.loeId === loeId &&
        (task.category === "deployment" || !task.category) &&
        (task.assignedTypes || []).includes(typeLabels[type as keyof typeof typeLabels] as 'CPMR' | 'IAPR' | 'TMTR')
    );

  // Only include tasks whose loeId matches a deployment LOE
  const deploymentLOEIds = deploymentLOEs.map(loe => loe.id);
  const allTypeTasks = tasks.filter(
    task => (task.category === "deployment" || !task.category) && deploymentLOEIds.includes(task.loeId) && (task.assignedTypes || []).includes(typeLabels[type as keyof typeof typeLabels] as 'CPMR' | 'IAPR' | 'TMTR')
  );
  const calculatedHealth = calculateLOEHealth(allTypeTasks)

  const getHealthColor = (health: string) => {
    switch (health) {
      case "Good":
        return "bg-green-100 text-green-800";
      case "At Risk":
        return "bg-yellow-100 text-yellow-800";
      case "Critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Deployment - {typeLabels[type as keyof typeof typeLabels]}
        </h1>
        <p className="text-gray-600 mb-8">
          Filtered view showing only {typeLabels[type as keyof typeof typeLabels]} related tasks
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Health Status Summary</CardTitle>
            <CardDescription>
              {typeLabels[type as keyof typeof typeLabels]} health status across all deployment LOEs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
              <div>
                <h3 className="text-lg font-medium mb-2">{typeLabels[type as keyof typeof typeLabels]}</h3>
                <div className="flex items-center gap-2">
                  <Badge className={getHealthColor(calculatedHealth)}>{calculatedHealth}</Badge>
                  <span className="text-sm text-gray-500">{allTypeTasks.length} tasks</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {deploymentLOEs.map((loe) => {
            const filteredTasks = getTasksForLOEAndType(loe.id);
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
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Associated Tasks</h4>
                        {filteredTasks.length > 0 ? (
                          <div className="space-y-2">
                            {filteredTasks.map((task) => (
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
                          <p className="text-gray-500 text-sm">No tasks for this LOE and type.</p>
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
} 