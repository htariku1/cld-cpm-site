import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { TaskCard } from "@/components/task-card"
import { formatDate } from "@/lib/utils"
import { ClientDeploymentTypePage } from "./client-deployment-type-page"

// Add this helper function after the imports
const getDurationInDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function generateStaticParams() {
  return [
    { type: 'cpmr' },
    { type: 'iapr' },
    { type: 'tmtr' },
  ];
}

type Params = { type: string };

export default function DeploymentTypePage({ params }: { params: any }) {
  return <ClientDeploymentTypePage type={params.type} />;
}
