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
import { Upload, Send, Loader2, File, X } from "lucide-react"
import type { ProjectFile } from "../../types"
import { sendProjectSubmittedEmail } from "@/app/actions/emails"

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
    console.log("=== PROJECT SUBMISSION DEBUG START ===")
    console.log("1. Conversation ID:", conversationId)
    console.log("2. Form ID:", formId)
    console.log("3. Sender ID:", senderId)
    console.log("4. Receiver ID:", receiverId)
    
    setLoading(true)
    try {
      // Step 1: Check authentication status
      console.log("5. Checking authentication...")
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      console.log("6. Auth check result:", { userId: user?.id, authError })
      
      if (authError || !user) {
        throw new Error(authError?.message || "You must be logged in to submit a project")
      }
      
      if (user.id !== senderId) {
        console.error("User ID mismatch:", { userId: user.id, senderId })
        throw new Error("User authentication mismatch")
      }

      // Get user details for email
      console.log("7. Fetching user details for email...")
      const { data: senderUser, error: senderError } = await supabase
        .from('users')
        .select('email, freelancer_profiles(first_name, last_name, display_name)')
        .eq('id', senderId)
        .single()

      console.log("8. Sender data:", {
        hasData: !!senderUser,
        email: senderUser?.email,
        error: senderError
      })

      const { data: receiverUser, error: receiverError } = await supabase
        .from('users')
        .select('email, freelancer_profiles(first_name, last_name, display_name)')
        .eq('id', receiverId)
        .single()

      console.log("9. Receiver data:", {
        hasData: !!receiverUser,
        email: receiverUser?.email,
        error: receiverError
      })

      // Find the form to update
      console.log("10. Finding target form...")
      const { data: forms, error: formsError } = await supabase
        .from("forms")
        .select("*")
        .eq("conversation_id", conversationId)
        .eq("sender_id", user.id)
        .eq("status", "accepted")

      console.log("11. Forms query result:", { 
        formsCount: forms?.length, 
        formsError 
      })

      if (formsError) throw formsError
      if (!forms || forms.length === 0) {
        throw new Error("No accepted forms found in this conversation")
      }

      // Find commercial form first, fallback to any accepted form
      let targetForm = forms.find(form => form.form_type === 'commercial') || forms[0]
      console.log("12. Target form selected:", {
        formId: targetForm.id,
        formType: targetForm.form_type,
        title: targetForm.title
      })

      if (targetForm.project_submitted) {
        throw new Error("Project has already been submitted for this form")
      }

      // Update form
      console.log("13. Updating form with project submission...")
      const updateData: any = {
        project_submitted: true,
        project_submitted_at: new Date().toISOString(),
      }

      if (projectUrl.trim()) {
        updateData.project_submission_url = projectUrl.trim()
      }

      if (notes.trim()) {
        updateData.project_notes = notes.trim()
      }

      const { error: updateError, data: updateResult } = await supabase
        .from("forms")
        .update(updateData)
        .eq("id", targetForm.id)
        .eq("sender_id", user.id)
        .select()

      if (updateError) {
        console.error("14. Update error:", updateError)
        throw updateError
      }

      console.log("14. Form updated successfully")

      // Handle file uploads if any
      const projectFiles: ProjectFile[] = []
      
      if (files.length > 0) {
        console.log("15. Processing", files.length, "file uploads...")
        for (const file of files) {
          const fileName = `${user.id}/${targetForm.id}_${Date.now()}_${file.name}`
          
          const { error: uploadError } = await supabase.storage
            .from('project_submissions')
            .upload(fileName, file)

          if (uploadError) {
            console.error("File upload error:", uploadError)
            // If bucket doesn't exist, continue without files
            if (!uploadError.message.includes('Bucket not found')) {
              throw uploadError
            }
          } else {
            projectFiles.push({
              file_name: file.name,
              file_path: fileName,
              file_size: file.size,
              file_type: file.type
            })

            // Save to database
            const { error: dbError } = await supabase
              .from('project_files')
              .insert({
                form_id: targetForm.id,
                file_name: file.name,
                file_path: fileName,
                file_size: file.size,
                file_type: file.type
              })

            if (dbError) {
              console.error("File DB error:", dbError)
              // Continue without saving file reference
            }
          }
        }

        // Update form with files
        if (projectFiles.length > 0) {
          const { error: fileUpdateError } = await supabase
            .from("forms")
            .update({ project_files: projectFiles })
            .eq("id", targetForm.id)

          if (fileUpdateError) {
            console.error("File update error:", fileUpdateError)
            // Continue without updating files in form
          }
        }
        console.log("16. Files processed")
      }

      // Send notification message
      console.log("17. Creating notification message...")
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
      notificationMessage += "\n\n⏰ The conversation will automatically close in 3 days."

      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          receiver_id: receiverId,
          content: notificationMessage,
          message_type: "text",
          form_id: targetForm.id
        })

      if (messageError) {
        console.error("18. Message error:", messageError)
      }

      // Send email notification
      console.log("19. PREPARING TO SEND EMAIL")
      console.log("   - Has receiver email:", !!receiverUser?.email)
      console.log("   - Receiver email:", receiverUser?.email)
      
      if (receiverUser?.email && senderUser) {
        console.log("20. Sending project submitted email...")
        try {
          const receiverName = receiverUser.freelancer_profiles?.[0]?.display_name ||
                             receiverUser.freelancer_profiles?.[0]?.first_name ||
                             receiverUser.email.split('@')[0]

          const senderName = senderUser.freelancer_profiles?.[0]?.display_name ||
                           senderUser.freelancer_profiles?.[0]?.first_name ||
                           senderUser.email?.split('@')[0] || 'Freelancer'

          console.log("21. Email parameters:", {
            recipientEmail: receiverUser.email,
            recipientName: receiverName,
            projectTitle: targetForm.title,
            freelancerName: senderName,
            hasFiles: files.length > 0,
            fileCount: files.length,
            projectUrl: projectUrl.trim() || undefined,
            projectNotes: notes.trim() || undefined
          })

          const emailResult = await sendProjectSubmittedEmail({
            recipientEmail: receiverUser.email,
            recipientName: receiverName,
            projectTitle: targetForm.title,
            freelancerName: senderName,
            submittedDate: new Date(),
            hasFiles: files.length > 0,
            fileCount: files.length,
            projectUrl: projectUrl.trim() || undefined,
            projectNotes: notes.trim() || undefined
          })

          console.log("22. Email result:", emailResult)
        } catch (emailError) {
          console.error("EMAIL ERROR:", emailError)
          console.error("Stack trace:", emailError instanceof Error ? emailError.stack : emailError)
          // Don't fail the whole operation if email fails
        }
      } else {
        console.log("20. NO RECEIVER EMAIL - Skipping email")
      }

      console.log("23. Project submission complete!")
      console.log("=== PROJECT SUBMISSION DEBUG END ===")

      // Success!
      toast({
        title: "Project Submitted Successfully! 🎉",
        description: "Your project has been delivered to the client.",
      })

      setProjectUrl("")
      setNotes("")
      setFiles([])
      
      onOpenChange(false)
      onSubmitted()
      
    } catch (error: any) {
      console.error("PROJECT SUBMISSION ERROR:", error)
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
      <DialogContent className="max-w-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Submit Project
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4 max-h-[calc(80vh-8rem)] overflow-y-auto pr-2">
          {/* File Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Project Files (Optional)</Label>
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
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <File className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{file.name}</p>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
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
            <Label htmlFor="project-url">External Link (Optional)</Label>
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
            <Label htmlFor="delivery-notes">Delivery Notes (Optional)</Label>
            <Textarea
              id="delivery-notes"
              placeholder="Instructions, passwords, or notes about the delivery..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Warning message */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800 font-medium">⚠️ Important</p>
            <p className="text-xs text-amber-700 mt-1">
              You can only submit the project once. The conversation will automatically close 3 days after submission.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleSubmit} 
              disabled={loading || (!files.length && !projectUrl.trim() && !notes.trim())} 
              className="w-full bg-[#00D37F] hover:bg-[#00c070] text-white"
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
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}