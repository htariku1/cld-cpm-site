"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"
import { GanttTimeline } from "@/components/gantt-timeline"
import { LOECard } from "@/components/loe-card"
import { useData } from "@/lib/data-context"
import { Input } from "@/components/ui/input"

export default function HomePage() {
  const { loes } = useData()
  const [selectedLOE, setSelectedLOE] = useState<(typeof loes)[0] | null>(null)
  const [scopingDocumentOpen, setScopingDocumentOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [scopingFile, setScopingFile] = useState<File | null>(null)
  const [doddDocumentOpen, setDoddDocumentOpen] = useState(false)
  const [doddUploadDialogOpen, setDoddUploadDialogOpen] = useState(false)
  const [doddPendingFile, setDoddPendingFile] = useState<File | null>(null)
  const [doddFile, setDoddFile] = useState<File | null>(null)

  const handleUpload = () => {
    if (pendingFile) {
      setScopingFile(pendingFile);
      setPendingFile(null);
      setUploadDialogOpen(false);
    }
  };

  const handleDownload = () => {
    if (!scopingFile) return;
    const url = URL.createObjectURL(scopingFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = scopingFile.name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  const handleDoddUpload = () => {
    if (doddPendingFile) {
      setDoddFile(doddPendingFile);
      setDoddPendingFile(null);
      setDoddUploadDialogOpen(false);
    }
  };

  const handleDoddDownload = () => {
    if (!doddFile) return;
    const url = URL.createObjectURL(doddFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = doddFile.name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <section className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 text-left">
            Contested Logistics (Distribution) Capability Portfolio Management
          </h1>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Mission Statement</h2>
            <p className="text-gray-700 leading-relaxed">
              To conduct a comprehensive assessment of joint logistics distribution capabilities supporting rapid
              deployment in contested environments, identifying operational risks, requirements, and solution pathways
              across the Services and Joint Staff.
            </p>
          </div>

          <Dialog open={scopingDocumentOpen} onOpenChange={setScopingDocumentOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <FileText className="h-4 w-4" />
                View Scoping Agreement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Scoping Agreement Document</DialogTitle>
                <DialogDescription>Current scoping agreement for the CL-D CPM project</DialogDescription>
              </DialogHeader>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                {scopingFile ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-base text-gray-800 font-medium">Current document:</span>
                    <div className="flex items-center gap-2">
                      <span className="break-all">{scopingFile.name}</span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const url = URL.createObjectURL(scopingFile);
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 mb-4">
                    Document placeholder - Replace with actual scoping agreement content
                  </p>
                )}
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={() => setUploadDialogOpen(true)}>
                    Update Document
                  </Button>
                  <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Upload Scoping Agreement</DialogTitle>
                        <DialogDescription>Select a file to upload as the new scoping agreement.</DialogDescription>
                      </DialogHeader>
                      <Input type="file" accept=".pdf,.doc,.docx" onChange={e => setPendingFile(e.target.files?.[0] || null)} />
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpload} disabled={!pendingFile}>Upload</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" variant="outline" onClick={handleDownload} disabled={!scopingFile}>
                    Download
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* DODD 7045.20 Button and Dialog */}
          <Dialog open={doddDocumentOpen} onOpenChange={setDoddDocumentOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent mt-2">
                <FileText className="h-4 w-4" />
                View DODD 7045.20 Capability Portfolio Management
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>DODD 7045.20 Capability Portfolio Management Document</DialogTitle>
                <DialogDescription>Current DODD 7045.20 Capability Portfolio Management document</DialogDescription>
              </DialogHeader>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                {doddFile ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-base text-gray-800 font-medium">Current document:</span>
                    <div className="flex items-center gap-2">
                      <span className="break-all">{doddFile.name}</span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const url = URL.createObjectURL(doddFile);
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 mb-4">
                    Document placeholder - Replace with actual DODD 7045.20 Capability Portfolio Management content
                  </p>
                )}
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={() => setDoddUploadDialogOpen(true)}>
                    Update Document
                  </Button>
                  <Dialog open={doddUploadDialogOpen} onOpenChange={setDoddUploadDialogOpen}>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Upload DODD 7045.20 Capability Portfolio Management</DialogTitle>
                        <DialogDescription>Select a file to upload as the new DODD 7045.20 Capability Portfolio Management document.</DialogDescription>
                      </DialogHeader>
                      <Input type="file" accept=".pdf,.doc,.docx" onChange={e => setDoddPendingFile(e.target.files?.[0] || null)} />
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setDoddUploadDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleDoddUpload} disabled={!doddPendingFile}>Upload</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" variant="outline" onClick={handleDoddDownload} disabled={!doddFile}>
                    Download
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </section>

        {/* Lines of Effort Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Lines of Effort</h2>
          <div className="grid gap-4">
            {loes.map((loe) => (
              <Card
                key={loe.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedLOE(loe)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{loe.name}</CardTitle>
                      <CardDescription className="mt-2">{loe.purpose}</CardDescription>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedLOE(loe);
                      }}
                    >
                      View details
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Timeline Section */}
        <section className="mb-12">
          <GanttTimeline />
        </section>

        {/* LOE Detail Card */}
        <LOECard loe={selectedLOE} isOpen={!!selectedLOE} onClose={() => setSelectedLOE(null)} />
      </main>
    </div>
  )
}
