"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Download, FileText, Presentation } from "lucide-react"
import { useData } from "@/lib/data-context";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const exportOptions = {
  loes: [
    "LOE 1: Capture Capability Requirements and Current Solutions",
    "LOE 2: Gap and Current Solutions Health Analysis",
    "LOE 3: Solutions Options Development",
    "LOE 4: Synthesize All Risks for Decision Support",
  ],
  tasks: [
    "All Tasks",
    "Formal Tasks Only",
    "Informal Tasks Only",
    "By Status (In Progress)",
    "By Status (Completed)",
    "By Owner",
  ],
  milestones: ["All Milestones", "Upcoming Milestones", "Past Due Milestones"],
  coordination: ["Internal Coordination Details", "External Coordination Details", "All Coordination Information"],
}

const taskTypes = ["All", "CPMR", "IAPR", "TMTR", "formal", "informal"];

export default function ExportCenterPage() {
  const { loes, tasks, milestones } = useData();
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState<string>("")
  const [selectedLOEs, setSelectedLOEs] = useState<string[]>([])
  const [selectedTaskType, setSelectedTaskType] = useState<string>("All")
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

  // Helper functions to map names to IDs for LOEs, tasks, and milestones
  const loeNameToId: Record<string, string> = {
    "LOE 1: Capture Capability Requirements and Current Solutions": "loe-1",
    "LOE 2: Gap and Current Solutions Health Analysis": "loe-2",
    "LOE 3: Solutions Options Development": "loe-3",
    "LOE 4: Synthesize All Risks for Decision Support": "loe-4",
  };
  const loeOrder = [
    "LOE 1: Capture Capability Requirements and Current Solutions",
    "LOE 2: Gap and Current Solutions Health Analysis",
    "LOE 3: Solutions Options Development",
    "LOE 4: Synthesize All Risks for Decision Support",
  ];
  const taskNameToId: Record<string, string> = {
    "All Tasks": "all-tasks", // You may want to expand this for real tasks
  };
  const milestoneNameToId: Record<string, string> = {
    "All Milestones": "all-milestones", // You may want to expand this for real milestones
  };

  // Filter tasks by selected LOE and assignedTypes only
  const filteredTasks = tasks.filter(task => {
    const loeMatch = selectedLOEs.length === 0 || selectedLOEs.map(l => loeNameToId[l]).includes(task.loeId);
    const typeMatch =
      selectedTaskType === "All" ||
      (task.assignedTypes && task.assignedTypes.includes(selectedTaskType as any));
    return loeMatch && typeMatch;
  });

  // Get all unique types from assignedTypes
  const allTypes = Array.from(new Set(tasks.flatMap(task => task.assignedTypes || [])));

  // Group tasks by type, filtered by selected LOEs if any
  const tasksByType: Record<string, typeof tasks> = {};
  allTypes.forEach(type => {
    tasksByType[type] = tasks.filter(task =>
      (task.assignedTypes || []).includes(type) &&
      (selectedLOEs.length === 0 || selectedLOEs.map(l => loeNameToId[l]).includes(task.loeId))
    );
  });

  // Select all tasks in a type group
  const handleSelectAllType = (type: string) => {
    const ids = tasksByType[type].map(task => task.id);
    setSelectedTaskIds(prev => {
      const alreadyAll = ids.every(id => prev.includes(id));
      if (alreadyAll) {
        // Unselect all
        return prev.filter(id => !ids.includes(id));
      } else {
        // Add missing
        return Array.from(new Set([...prev, ...ids]));
      }
    });
  };

  const getSelectedObjects = () => {
    const loeIds = selectedItems.filter((item: string) => loeNameToId[item]).map((item: string) => loeNameToId[item]);
    const taskIds = selectedTaskIds;
    const milestoneIds = selectedItems.filter((item: string) => milestoneNameToId[item]).map((item: string) => milestoneNameToId[item]);
    const selectedLOEs = loes.filter(loe => loeIds.includes(loe.id));
    const selectedTasks = tasks.filter(task => taskIds.includes(task.id));
    const selectedMilestones = milestones.filter(milestone => milestoneIds.includes(milestone.id));
    return { selectedLOEs, selectedTasks, selectedMilestones };
  };

  // Update handleItemToggle for LOEs to always sort
  const handleItemToggle = (item: string) => {
    setSelectedItems((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
    if (loeNameToId[item]) {
      setSelectedLOEs((prev) => {
        const updated = prev.includes(item) ? prev.filter((loe) => loe !== item) : [...prev, item];
        // Sort by loeOrder
        return updated.slice().sort((a, b) => loeOrder.indexOf(a) - loeOrder.indexOf(b));
      });
    }
  }

  const handleTaskToggle = (taskId: string) => {
    setSelectedTaskIds((prev) => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
  }

  const handleExport = async () => {
    if (selectedItems.length === 0 || !exportFormat) {
      alert("Please select items to export and choose a format")
      return
    }

    const { selectedLOEs, selectedTasks, selectedMilestones } = getSelectedObjects();

    if (exportFormat === "powerpoint") {
      try {
        const response = await fetch("/api/generate-pptx", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ loes: selectedLOEs, tasks: selectedTasks, milestones: selectedMilestones }),
        });
        if (!response.ok) throw new Error("Failed to generate PowerPoint");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "brief-output.pptx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        alert("Error generating PowerPoint: " + (err as Error).message);
      }
    } else if (exportFormat === "pdf") {
      // Simulate export process for PDF
      alert(`Exporting ${selectedItems.length} items as PDF...`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Brief Generator</h1>
            <p className="text-gray-600 mt-2">Select and export portfolio data in various formats</p>
          </div>
          <Button
            onClick={handleExport}
            className="flex items-center gap-2"
            disabled={selectedItems.length === 0 || !exportFormat}
          >
            <Download className="h-4 w-4" />
            Export Selected
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Selection Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* LOE Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Lines of Effort (LOEs)</CardTitle>
                <CardDescription>Select LOEs to include in export</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {exportOptions.loes.map((loe) => (
                  <div key={loe} className="flex items-center space-x-2">
                    <Checkbox
                      id={`loe-${loe}`}
                      checked={selectedItems.includes(loe)}
                      onCheckedChange={() => handleItemToggle(loe)}
                    />
                    <Label htmlFor={`loe-${loe}`} className="text-sm leading-relaxed">
                      {loe}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Task Selection - Grouped by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>Select specific tasks to include, grouped by type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Accordion type="multiple" className="w-full">
                  {allTypes.map(type => (
                    <AccordionItem key={type} value={type}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{type}</span>
                          <span
                            className="ml-2 px-2 py-0 h-6 text-xs inline-flex items-center justify-center rounded border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer select-none"
                            onClick={e => { e.stopPropagation(); handleSelectAllType(type); }}
                            tabIndex={0}
                            role="button"
                            aria-pressed="false"
                          >
                            {tasksByType[type].every(task => selectedTaskIds.includes(task.id)) ? "Unselect All" : "Select All"}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {tasksByType[type].length === 0 && <div className="text-sm text-gray-500">No tasks for this type.</div>}
                        {tasksByType[type].map(task => (
                          <div key={task.id} className="flex items-center space-x-2 py-1">
                            <Checkbox
                              id={`task-${task.id}`}
                              checked={selectedTaskIds.includes(task.id)}
                              onCheckedChange={() => handleTaskToggle(task.id)}
                            />
                            <Label htmlFor={`task-${task.id}`} className="text-sm">
                              {task.name}
                            </Label>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Milestone Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Milestones</CardTitle>
                <CardDescription>Select milestone categories to include</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {exportOptions.milestones.map((milestone) => (
                  <div key={milestone} className="flex items-center space-x-2">
                    <Checkbox
                      id={`milestone-${milestone}`}
                      checked={selectedItems.includes(milestone)}
                      onCheckedChange={() => handleItemToggle(milestone)}
                    />
                    <Label htmlFor={`milestone-${milestone}`} className="text-sm">
                      {milestone}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Export Options Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Format</CardTitle>
                <CardDescription>Choose your preferred export format</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="powerpoint">
                      <div className="flex items-center gap-2">
                        <Presentation className="h-4 w-4" />
                        PowerPoint (Template-based)
                      </div>
                    </SelectItem>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        PDF Document
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Summary</CardTitle>
                <CardDescription>Review your selections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Selected Items:</span>
                    <span className="font-medium">{selectedItems.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Export Format:</span>
                    <span className="font-medium">
                      {exportFormat ? exportFormat.charAt(0).toUpperCase() + exportFormat.slice(1) : "Not selected"}
                    </span>
                  </div>
                </div>

                {selectedItems.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h4 className="text-sm font-medium mb-2">Selected Items:</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {selectedItems
                          .slice()
                          .sort((a, b) => loeOrder.indexOf(a) - loeOrder.indexOf(b))
                          .map((item) => (
                            <div key={item} className="text-xs text-gray-600 truncate">
                              • {item}
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setSelectedItems([])}
                >
                  Clear All Selections
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() =>
                    setSelectedItems([
                      ...exportOptions.loes,
                      ...exportOptions.tasks,
                      ...exportOptions.milestones,
                      ...exportOptions.coordination,
                    ])
                  }
                >
                  Select All Items
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
