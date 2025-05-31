import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getUserInitials, getTimeAgo } from "../../utils/formatters"
import { Package, Download, Link, FileText, Loader2 } from "lucide-react"
import { downloadProjectFile, fetchProjectFilesFromStorage } from "../../utils/storage"
import FormDisplay from "../Forms/FormDisplay"
import type { Message } from "../../types"

interface MessageDisplayProps {
  message: Message
  isOwn: boolean
  currentUserId: string
  allMessages?: Message[]
}

export default function MessageDisplay({ message, isOwn, currentUserId, allMessages = [] }: MessageDisplayProps) {
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [projectFiles, setProjectFiles] = useState<any[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  // Fetch message attachment URL
  useEffect(() => {
    const fetchAttachment = async () => {
      if (message.attachment_url) {
        const { data } = supabase.storage
          .from('message-attachments')
          .getPublicUrl(message.attachment_url)
        
        if (data?.publicUrl) {
          setAttachmentUrl(data.publicUrl)
        }
      }
    }

    fetchAttachment()
  }, [message.attachment_url, supabase.storage])

  const handleDownloadFile = async (file: any) => {
    setDownloading(file.file_path)
    
    try {
      const result = await downloadProjectFile(file)
      
      if (result.success) {
        toast({
          title: "Download Started",
          description: `Downloading ${file.file_name}`,
        })
      } else {
        toast({
          title: "Download Failed",
          description: "Unable to download file. Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error('Download error:', err)
      toast({
        title: "Download Failed",
        description: "An error occurred while downloading the file.",
        variant: "destructive",
      })
    } finally {
      setDownloading(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Check if this is a project delivery message
  const isProjectDelivery = message.content.includes("📦 Project delivered!")
  
  // If it's a project delivery message, find the associated commercial form
  let projectForm = null
  if (isProjectDelivery) {
    // Look for ANY commercial form that's accepted
    projectForm = allMessages.find(m => 
      m.message_type === 'form' && 
      m.form?.form_type === 'commercial' && 
      m.form?.status === 'accepted'
    )?.form
  }

  // Fetch project files if this is a project delivery message
  useEffect(() => {
    const fetchProjectFiles = async () => {
      if (!isProjectDelivery || !projectForm?.id || loadingFiles) return
      
      setLoadingFiles(true)
      
      try {
        // Type the projectForm properly
        interface ProjectForm {
          id: string
          sender_id?: string
          receiver_id?: string
          project_files?: Array<{
            file_name: string
            file_path: string
            file_size: number
            file_type: string
          }>
        }
        
        const typedProjectForm = projectForm as ProjectForm
        
        // First check if files are stored in the form's JSONB column
        if (typedProjectForm.project_files?.length) {
          console.log('Found files in form data:', typedProjectForm.project_files)
          setProjectFiles(typedProjectForm.project_files)
          return
        }
        
        // If no files in JSONB, check the project_files table
        const { data: dbFiles, error: dbError } = await supabase
          .from('project_files')
          .select('*')
          .eq('form_id', typedProjectForm.id)
        
        if (!dbError && dbFiles?.length) {
          console.log('Found files in project_files table:', dbFiles)
          setProjectFiles(dbFiles)
          return
        }
        
        // Last resort: check storage directly (but this should rarely be needed)
        const possibleFolders = [
          typedProjectForm.sender_id,
          message.sender_id
        ].filter(Boolean) as string[]
        
        // Only check the first valid folder to avoid duplicates
        for (const folderId of possibleFolders) {
          const foundFiles = await fetchProjectFilesFromStorage(typedProjectForm.id, [folderId])
          if (foundFiles.length > 0) {
            console.log('Found project files in storage:', foundFiles)
            setProjectFiles(foundFiles)
            break
          }
        }
      } catch (err) {
        console.error('Error fetching project files:', err)
        toast({
          title: "Error",
          description: "Unable to load project files",
          variant: "destructive",
        })
      } finally {
        setLoadingFiles(false)
      }
    }
    
    fetchProjectFiles()
  }, [isProjectDelivery, projectForm?.id])
  
  // If it's a form message
  if (message.message_type === 'form' && message.form) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className="max-w-lg">
          <FormDisplay 
            form={message.form} 
            currentUserId={currentUserId}
          />
          <p className="text-xs text-gray-500 mt-1 text-center">
            {getTimeAgo(new Date(message.created_at))}
          </p>
        </div>
      </div>
    )
  }

  // If it's a project delivery message, show enhanced display
  if (isProjectDelivery) {
    // Parse the message to extract file count
    const fileCountMatch = message.content.match(/\((\d+) file/);
    const fileCount = fileCountMatch ? parseInt(fileCountMatch[1]) : 1;
    
    // Get project data
    const files = projectFiles.length > 0 ? projectFiles : [];
    const projectUrl = projectForm?.project_submission_url;
    const projectNotes = projectForm?.project_notes || message.content.split('\n\n')[1];
    const submittedAt = projectForm?.project_submitted_at ? new Date(projectForm.project_submitted_at) : new Date(message.created_at);
    const daysSinceSubmission = Math.floor((Date.now() - submittedAt.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 3 - daysSinceSubmission);

    return (
      <div className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender?.avatar_url || undefined} />
          <AvatarFallback>
            {getUserInitials(message.sender?.full_name || 'Unknown')}
          </AvatarFallback>
        </Avatar>

        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-lg`}>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-green-600 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900">Project Delivered</h4>
                  
                  {/* Show delivery message */}
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{message.content}</p>
                  
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
                  {(files.length > 0 || fileCount > 0) && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Files:</p>
                      <div className="space-y-2">
                        {files.length > 0 ? (
                          files.map((file: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-700 truncate">{file.file_name}</span>
                                {file.file_size > 0 && (
                                  <span className="text-xs text-gray-500">
                                    ({formatFileSize(file.file_size)})
                                  </span>
                                )}
                              </div>
                              {file.isPlaceholder ? (
                                <span className="text-xs text-gray-500">Contact support</span>
                              ) : (
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
                              )}
                            </div>
                          ))
                        ) : loadingFiles ? (
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                            <span className="text-sm text-gray-600">Loading files...</span>
                          </div>
                        ) : (
                          // Fallback: Show a placeholder if we know there are files but can't access them
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800">
                              {fileCount} file{fileCount > 1 ? 's' : ''} delivered
                            </p>
                            <p className="text-xs text-amber-600 mt-1">
                              Unable to load file information. Please refresh the page.
                            </p>
                          </div>
                        )}
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
                  
                  {/* Project Notes */}
                  {projectNotes && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Notes:</p>
                      <p className="text-sm text-gray-600">{projectNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <span className="text-xs text-gray-500 mt-1">
            {getTimeAgo(new Date(message.created_at))}
          </span>
        </div>
      </div>
    )
  }

  // Regular message display
  return (
    <div className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={message.sender?.avatar_url || undefined} />
        <AvatarFallback>
          {getUserInitials(message.sender?.full_name || 'Unknown')}
        </AvatarFallback>
      </Avatar>

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwn 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          
          {attachmentUrl && message.attachment_type === 'image' && (
            <img 
              src={attachmentUrl} 
              alt="Attachment" 
              className="mt-2 rounded max-w-full max-h-64"
            />
          )}
          
          {attachmentUrl && message.attachment_type === 'file' && (
            <a 
              href={attachmentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-2 text-xs underline"
            >
              View attachment
            </a>
          )}
        </div>

        <span className="text-xs text-gray-500 mt-1">
          {getTimeAgo(new Date(message.created_at))}
        </span>
      </div>
    </div>
  )
}