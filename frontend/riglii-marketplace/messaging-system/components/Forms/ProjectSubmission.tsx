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
import { Upload, Send, Loader2, File, X, CheckCircle } from "lucide-react"
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

  // Replace the handleSubmit function with this authentication-aware version

const handleSubmit = async () => {
  setLoading(true)
  try {
    console.log('=== PROJECT SUBMISSION AUTH DEBUG START ===');

    // Step 1: Check authentication status
    console.log('Step 1: Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('Auth check result:', { user: user?.id, authError });
    
    if (authError) {
      console.error('Authentication error:', authError);
      throw new Error('Authentication failed');
    }
    
    if (!user) {
      console.error('No authenticated user');
      throw new Error('You must be logged in to submit a project');
    }

    console.log('✅ User authenticated:', user.id);
    console.log('Sender ID from props:', senderId);
    
    if (user.id !== senderId) {
      console.error('User ID mismatch:', { userId: user.id, senderId });
      throw new Error('User authentication mismatch');
    }

    // Step 2: Test database connection with auth context
    console.log('Step 2: Testing database connection...');
    const { data: testQuery, error: testError } = await supabase
      .rpc('auth.uid') // This should return the current user ID

    console.log('Database auth test:', { testQuery, testError });

    // Step 3: Find the form to update
    console.log('Step 3: Finding target form...');
    console.log('Query parameters:', {
      conversationId,
      senderId: user.id, // Use the authenticated user ID
      status: 'accepted'
    });

    const { data: forms, error: formsError } = await supabase
      .from("forms")
      .select("*")
      .eq("conversation_id", conversationId)
      .eq("sender_id", user.id) // Use authenticated user ID
      .eq("status", "accepted")

    console.log('Forms query result:', { forms, formsError });

    if (formsError) {
      console.error('Error finding forms:', formsError);
      throw formsError;
    }

    if (!forms || forms.length === 0) {
      console.log('No forms found, checking all forms in conversation...');
      
      // Debug: Check all forms in this conversation
      const { data: allForms, error: allFormsError } = await supabase
        .from("forms")
        .select("*")
        .eq("conversation_id", conversationId)

      console.log('All forms in conversation:', { allForms, allFormsError });
      
      throw new Error('No accepted forms found in this conversation');
    }

    // Find commercial form first, fallback to any accepted form
    let targetForm = forms.find(form => form.form_type === 'commercial') || forms[0];
    console.log('Target form selected:', targetForm);

    if (targetForm.project_submitted) {
      throw new Error('Project has already been submitted for this form');
    }

    // Step 4: Attempt the update with explicit auth context
    console.log('Step 4: Attempting form update...');
    
    const updateData = {
      project_submitted: true,
      project_submitted_at: new Date().toISOString(),
    };

    if (projectUrl.trim()) {
      updateData.project_submission_url = projectUrl.trim();
    }

    if (notes.trim()) {
      updateData.project_notes = notes.trim();
    }

    console.log('Update data:', updateData);
    console.log('Updating form ID:', targetForm.id);

    // Use the authenticated user's session
    const { error: updateError, data: updateResult } = await supabase
      .from("forms")
      .update(updateData)
      .eq("id", targetForm.id)
      .eq("sender_id", user.id) // Double-check sender ownership
      .select()

    console.log('Update result:', { updateError, updateResult });

    if (updateError) {
      console.error('Update error details:', {
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint
      });
      throw updateError;
    }

    if (!updateResult || updateResult.length === 0) {
      console.error('No rows updated - possible permission issue');
      throw new Error('Failed to update form. Check permissions.');
    }

    console.log('✅ Form updated successfully!');

    // Step 5: Verify the update
    const { data: verifyForm, error: verifyError } = await supabase
      .from("forms")
      .select("project_submitted, project_submitted_at")
      .eq("id", targetForm.id)
      .single()

    console.log('Verification:', { verifyForm, verifyError });

    // Handle file uploads if any
    const projectFiles: ProjectFile[] = []
    
    if (files.length > 0) {
      console.log('Processing file uploads...');
      for (const file of files) {
        const fileName = `${user.id}/${targetForm.id}_${Date.now()}_${file.name}`
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('project_submissions')
          .upload(fileName, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw uploadError
        }
        
        projectFiles.push({
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          file_type: file.type
        })

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
          console.error('File DB error:', dbError)
          throw dbError
        }
      }

      // Update form with files
      if (projectFiles.length > 0) {
        const { error: fileUpdateError } = await supabase
          .from("forms")
          .update({ project_files: projectFiles })
          .eq("id", targetForm.id)

        if (fileUpdateError) {
          console.error('File update error:', fileUpdateError)
          throw fileUpdateError
        }
      }
    }

    // Send notification
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
      console.error('Message error:', messageError)
    }

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
    
    console.log('=== PROJECT SUBMISSION SUCCESS ===');
    
  } catch (error: any) {
    console.error("=== PROJECT SUBMISSION ERROR ===", error)
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Submit Project
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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

          {/* Buttons */}
          <div className="space-y-2 pt-4">
            {/* Warning message */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 font-medium">⚠️ Important</p>
              <p className="text-xs text-amber-700 mt-1">
                You can only submit the project once. The conversation will automatically close 3 days after submission.
              </p>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={loading} 
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