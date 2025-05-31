import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Upload, Send, Loader2, File, X, CheckCircle } from 'lucide-react'
import type { ProjectFile } from "../../types"

interface ProjectSubmissionProps {
  formId: string
  conversationId: string
  receiverId: string
  senderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmitted: () => void
}

export default function ProjectSubmission({
  formId,
  conversationId,
  receiverId,
  senderId,
  open,
  onOpenChange,
  onSubmitted
}: ProjectSubmissionProps) {
  const [loading, setLoading] = useState(false)
  const [projectUrl, setProjectUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [files, setFiles] = useState<File[]>([])

  const supabase = createClient()
  const { toast } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (loading) return; // Prevent double submission
  
    setLoading(true)
    console.log('Starting project submission...')
    
    try {
      const projectFiles: ProjectFile[] = []
      
      // Upload all files to storage
      if (files.length > 0) {
        console.log(`Uploading ${files.length} files...`)
        for (const file of files) {
          const fileName = `${senderId}/${formId}_${Date.now()}_${file.name}`
          
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('project-submissions')
            .upload(fileName, file)

          if (uploadError) {
            console.error('Upload error:', uploadError)
            throw uploadError
          }
          
          console.log('File uploaded successfully:', fileName)
          
          projectFiles.push({
            file_name: file.name,
            file_path: fileName,
            file_size: file.size,
            file_type: file.type
          })

          // Also insert into project_files table
          const { error: dbError } = await supabase
            .from('project_files')
            .insert({
              form_id: formId,
              file_name: file.name,
              file_path: fileName,
              file_size: file.size,
              file_type: file.type
            })

          if (dbError) {
            console.error('Database error:', dbError)
            throw dbError
          }
        }
      }

      // Update form with project submission
      const updateData: any = {
        project_submitted: true,
        project_submitted_at: new Date().toISOString(),
      }

      if (projectUrl.trim()) {
        updateData.project_submission_url = projectUrl.trim()
      }

      if (projectFiles.length > 0) {
        updateData.project_files = projectFiles
      }

      if (notes.trim()) {
        updateData.project_notes = notes.trim()
      }

      console.log('Updating form with data:', updateData)

      const { error: formError } = await supabase
        .from("forms")
        .update(updateData)
        .eq("id", formId)

      if (formError) {
        console.error('Form update error:', formError)
        throw formError
      }

      // Build notification message
      let notificationMessage = "📦 Project delivered!"
      if (files.length > 0) {
        notificationMessage += ` (${files.length} file${files.length > 1 ? 's' : ''})`
      }
      if (notes.trim()) {
        notificationMessage += `\n\nNotes: ${notes.trim()}`
      }
      if (projectUrl.trim()) {
        notificationMessage += `\n\nProject link: ${projectUrl.trim()}`
      }

      // Send notification message
      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          receiver_id: receiverId,
          content: notificationMessage,
          message_type: "text"
        })

      if (messageError) {
        console.error('Message error:', messageError)
        throw messageError
      }

      console.log('Project submitted successfully!')

      // Success! Show toast and close dialog
      toast({
        title: "Project Submitted Successfully! 🎉",
        description: "Your project has been delivered to the client.",
      })

      // Reset form
      setProjectUrl("")
      setNotes("")
      setFiles([])
      
      // Close dialog and trigger callback
      onOpenChange(false)
      onSubmitted()
      
    } catch (error: any) {
      console.error("Error submitting project:", error)
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const totalSize = files.reduce((acc, file) => acc + file.size, 0)
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-lg"
        style={{
          maxHeight: '90vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Submit Project
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 py-4">
          {/* File Upload Section */}
          <div className="space-y-2">
            <Label>Project Files</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
              <input
                type="file"
                onChange={handleFileSelect}
                disabled={loading}
                multiple
                accept=".zip,.rar,.7z,.pdf,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,image/*,video/*,application/pdf"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click to upload files (ZIP, images, videos, PDFs)
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Max 50MB total
                </span>
              </label>
            </div>
            
            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2 mt-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <File className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={loading}
                      className="flex-shrink-0 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <p className="text-sm text-gray-600 font-medium">
                  Total: {totalSizeMB} MB ({files.length} file{files.length !== 1 ? 's' : ''})
                </p>
              </div>
            )}
          </div>

          {/* External Link Section */}
          <div className="space-y-2">
            <Label htmlFor="project-url">External Link (optional)</Label>
            <Input
              id="project-url"
              type="url"
              placeholder="https://drive.google.com/... or other link"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Delivery Notes Section */}
          <div className="space-y-2">
            <Label htmlFor="delivery-notes">Delivery Notes</Label>
            <Textarea
              id="delivery-notes"
              placeholder="Instructions, passwords, or notes about the delivery..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>
        </div>

        {/* Fixed Footer with Buttons - Always Visible */}
        <div 
          className="border-t pt-4 mt-auto"
          style={{
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'white',
            padding: '16px 0',
            marginTop: '16px'
          }}
        >
          <div className="flex justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                setFiles([])
                setProjectUrl('')
                setNotes('')
              }}
              disabled={loading}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="min-w-[140px] bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Project
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}