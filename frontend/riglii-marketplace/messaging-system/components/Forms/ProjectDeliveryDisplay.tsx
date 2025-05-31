import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Package, Link, FileText, Loader2 } from "lucide-react"
import { downloadProjectFile } from "../../utils/storage"
import { useToast } from "@/hooks/use-toast"
import type { Form } from "../../types"

interface ProjectDeliveryDisplayProps {
  form: Form
  currentUserId: string
}

export default function ProjectDeliveryDisplay({ form, currentUserId }: ProjectDeliveryDisplayProps) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const { toast } = useToast()
  
  if (!form.project_submitted) return null
  
  const projectFiles = form.project_files || []
  const projectUrl = form.project_submission_url
  const projectNotes = form.project_notes
  const submittedAt = form.project_submitted_at ? new Date(form.project_submitted_at) : null
  
  // Calculate days since submission
  const daysSinceSubmission = submittedAt 
    ? Math.floor((Date.now() - submittedAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0
  const daysRemaining = Math.max(0, 3 - daysSinceSubmission)
  
  const handleDownloadFile = async (file: any) => {
    setDownloading(file.file_path)
    
    const result = await downloadProjectFile(file.file_path, file.file_name)
    
    if (!result.success) {
      toast({
        title: "Download Failed",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      })
    }
    
    setDownloading(null)
  }
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }
  
  return (
    <Card className="w-full bg-green-50 border-green-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Package className="h-5 w-5 text-green-600 mt-1" />
          <div className="flex-1">
            <h4 className="font-semibold text-green-900">Project Delivered</h4>
            <p className="text-sm text-green-700 mt-1">
              Delivered {submittedAt?.toLocaleDateString()} at {submittedAt?.toLocaleTimeString()}
            </p>
            
            {daysRemaining > 0 && (
              <p className="text-xs text-amber-600 mt-2 font-medium">
                ⏰ Conversation will close in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
              </p>
            )}
            
            {daysRemaining === 0 && (
              <p className="text-xs text-red-600 mt-2 font-medium">
                🔒 Conversation is closed
              </p>
            )}
            
            {/* Project Files */}
            {projectFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Files:</p>
                <div className="space-y-2">
                  {projectFiles.map((file: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700 truncate">{file.file_name}</span>
                        <span className="text-xs text-gray-500">
                          ({formatFileSize(file.file_size)})
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownloadFile(file)}
                        disabled={downloading === file.file_path}
                      >
                        {downloading === file.file_path ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* External Link */}
            {projectUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">External Link:</p>
                <a 
                  href={projectUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Link className="h-4 w-4" />
                  {projectUrl}
                </a>
              </div>
            )}
            
            {/* Delivery Notes */}
            {projectNotes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Delivery Notes:</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{projectNotes}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
