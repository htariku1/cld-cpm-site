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
import { useFirebaseToast, firebaseToastMessages } from "@/components/firebase-toast"

export default function HomePage() {
  const { loes, documents, uploadDocument, downloadDocument, loading } = useData()
  const { showSuccess, showError } = useFirebaseToast()
  const [selectedLOE, setSelectedLOE] = useState<(typeof loes)[0] | null>(null)
  const [scopingDocumentOpen, setScopingDocumentOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [doddDocumentOpen, setDoddDocumentOpen] = useState(false)
  const [doddUploadDialogOpen, setDoddUploadDialogOpen] = useState(false)
  const [doddPendingFile, setDoddPendingFile] = useState<File | null>(null)

  // Get current documents
  const scopingDocument = documents.find(doc => doc.type === "scoping")
  const doddDocument = documents.find(doc => doc.type === "dodd")

  const handleUpload = async () => {
    if (pendingFile) {
      try {
        await uploadDocument(pendingFile, "scoping");
        showSuccess("Scoping document uploaded successfully");
        setPendingFile(null);
        setUploadDialogOpen(false);
      } catch (error) {
        showError("Failed to upload scoping document", error instanceof Error ? error.message : "Unknown error");
      }
    }
  };

  const handleDownload = async () => {
    if (!scopingDocument) return;
    try {
      const file = await downloadDocument(scopingDocument.id);
      if (file) {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 0);
      }
    } catch (error) {
      showError("Failed to download scoping document", error instanceof Error ? error.message : "Unknown error");
    }
  };

  const handleDoddUpload = async () => {
    if (doddPendingFile) {
      try {
        await uploadDocument(doddPendingFile, "dodd");
        showSuccess("DODD document uploaded successfully");
        setDoddPendingFile(null);
        setDoddUploadDialogOpen(false);
      } catch (error) {
        showError("Failed to upload DODD document", error instanceof Error ? error.message : "Unknown error");
      }
    }
  };

  const handleDoddDownload = async () => {
    if (!doddDocument) return;
    try {
      const file = await downloadDocument(doddDocument.id);
      if (file) {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 0);
      }
    } catch (error) {
      showError("Failed to download DODD document", error instanceof Error ? error.message : "Unknown error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading homepage data...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

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
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm text-gray-600">Loading documents...</span>
                  </div>
                ) : scopingDocument ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-base text-gray-800 font-medium">Current document:</span>
                    <div className="flex items-center gap-2">
                      <span className="break-all">{scopingDocument.fileName}</span>
                      <span className="text-sm text-gray-500">
                        ({Math.round(scopingDocument.fileSize / 1024)} KB)
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          try {
                            const file = await downloadDocument(scopingDocument.id);
                            if (file) {
                              const url = URL.createObjectURL(file);
                              window.open(url, '_blank', 'noopener,noreferrer');
                            }
                          } catch (error) {
                            showError("Failed to view document", error instanceof Error ? error.message : "Unknown error");
                          }
                        }}
                      >
                        View
                      </Button>
                    </div>
                    <span className="text-xs text-gray-500">
                      Uploaded: {new Date(scopingDocument.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 mb-4">
                    No scoping agreement document uploaded yet
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
                  <Button size="sm" variant="outline" onClick={handleDownload} disabled={!scopingDocument}>
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
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm text-gray-600">Loading documents...</span>
                  </div>
                ) : doddDocument ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-base text-gray-800 font-medium">Current document:</span>
                    <div className="flex items-center gap-2">
                      <span className="break-all">{doddDocument.fileName}</span>
                      <span className="text-sm text-gray-500">
                        ({Math.round(doddDocument.fileSize / 1024)} KB)
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          try {
                            const file = await downloadDocument(doddDocument.id);
                            if (file) {
                              const url = URL.createObjectURL(file);
                              window.open(url, '_blank', 'noopener,noreferrer');
                            }
                          } catch (error) {
                            showError("Failed to view document", error instanceof Error ? error.message : "Unknown error");
                          }
                        }}
                      >
                        View
                      </Button>
                    </div>
                    <span className="text-xs text-gray-500">
                      Uploaded: {new Date(doddDocument.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 mb-4">
                    No DODD 7045.20 document uploaded yet
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
                  <Button size="sm" variant="outline" onClick={handleDoddDownload} disabled={!doddDocument}>
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
