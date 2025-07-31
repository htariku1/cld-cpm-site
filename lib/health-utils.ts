// Health score calculation utilities

type HealthStatus = "Good" | "At Risk" | "Critical"
type HealthScore = "On Track" | "At Risk" | "Delayed"

// Convert health status to a numeric value for calculations
export function healthToScore(health: HealthStatus): number {
  switch (health) {
    case "Good":
      return 3
    case "At Risk":
      return 2
    case "Critical":
      return 1
    default:
      return 3 // Default to Good if unknown
  }
}

// Convert numeric score back to health status
export function scoreToHealth(score: number): HealthStatus {
  if (score >= 2.5) return "Good"
  if (score >= 1.5) return "At Risk"
  return "Critical"
}

// Calculate component health across all LOEs
export function calculateComponentHealth(
  componentData: Array<{ health: HealthStatus; taskCount: number }>,
): HealthStatus {
  if (componentData.length === 0) return "Good"

  // Calculate weighted average based on task count
  let totalScore = 0
  let totalTasks = 0

  componentData.forEach((item) => {
    const score = healthToScore(item.health)
    const weight = item.taskCount
    totalScore += score * weight
    totalTasks += weight
  })

  // If no tasks, return Good as default
  if (totalTasks === 0) return "Good"

  const averageScore = totalScore / totalTasks
  return scoreToHealth(averageScore)
}

// Calculate overall system health from component health statuses
export function calculateOverallHealth(
  cpmrHealth: HealthStatus,
  iaprHealth: HealthStatus,
  tmtrHealth: HealthStatus,
): HealthStatus {
  const avgScore = (healthToScore(cpmrHealth) + healthToScore(iaprHealth) + healthToScore(tmtrHealth)) / 3
  return scoreToHealth(avgScore)
}

// Convert health status to display label
export function healthToLabel(health: HealthStatus): HealthScore {
  switch (health) {
    case "Good":
      return "On Track"
    case "At Risk":
      return "At Risk"
    case "Critical":
      return "Delayed"
    default:
      return "On Track"
  }
}

// Infer health status for a task based on status and issues
export function inferTaskHealth(task: { status: string; issues: string[] | number }): HealthStatus {
  // If issues is a number, treat >0 as issues present
  const hasIssues = Array.isArray(task.issues)
    ? task.issues.length > 0
    : typeof task.issues === 'number' && task.issues > 0;

  if (task.status === 'Completed') return 'Good';
  if (task.status === 'On Hold') return 'At Risk';
  if (task.status === 'Planning' && hasIssues) return 'Critical';
  if (hasIssues) return 'At Risk';
  if ((task.status === 'In Progress' || task.status === 'Not Started') && !hasIssues) return 'Good';
  return 'Good'; // Default fallback
}

export function calculateTaskHealth(task: { progress?: number, status: string }): HealthStatus {
  // Use progress as primary input, ignore issues
  if (typeof task.progress === 'number') {
    if (task.progress >= 90) return 'Good';
    if (task.progress >= 50) return 'At Risk';
    return 'Critical';
  }
  // Fallback to status only
  if (task.status === 'Completed') return 'Good';
  if (task.status === 'On Hold') return 'At Risk';
  if (task.status === 'Planning') return 'At Risk';
  if (task.status === 'In Progress' || task.status === 'Not Started') return 'Good';
  return 'Good';
}

export function calculateLOEHealth(tasks: Array<{ progress?: number, status: string }>): HealthStatus {
  if (tasks.length === 0) return 'Good';
  const healths = tasks.map(calculateTaskHealth)
  const healthCounts = { Good: 0, 'At Risk': 0, Critical: 0 }
  healths.forEach(h => { healthCounts[h]++ })
  // Weighted: if any Critical, return Critical; else if any At Risk, return At Risk; else Good
  if (healthCounts.Critical > 0) return 'Critical';
  if (healthCounts['At Risk'] > 0) return 'At Risk';
  return 'Good';
}
