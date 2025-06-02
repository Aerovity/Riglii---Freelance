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

interface ProjectFile {
  file_name: string
  file_path: string
  file_size: number
  file_type: string
  isPlaceholder?: boolean
}

interface ProjectForm {
  id: string
  sender_id?: string
  receiver_id?: string
  project_files?: ProjectFile[]
  project_submission_url?: string
  project_notes?: string
  project_submitted_at?: string
  form_type?: string
  status?: string
}

interface MessageDisplayProps {
  message: Message
  isOwn: boolean
  currentUserId: string
  allMessages?: Message[]
}

export default function MessageDisplay({ message, isOwn, currentUserId, allMessages = [] }: MessageDisplayProps) {
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  // Fetch message attachment URL
  useEffect(() => {
    const fetchAttachment = async () => {
      if (!message.attachment_url) return

      const { data } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(message.attachment_url)
      
      if (data?.publicUrl) {
        setAttachmentUrl(data.publicUrl)
      }
    }

    fetchAttachment()
  }, [message.attachment_url, supabase.storage])

  const handleDownloadFile = async (file: ProjectFile) => {
    if (file.isPlaceholder) return
    
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
    if (bytes === 0) return '0 B'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Check if this is a project delivery message
  const isProjectDelivery = message.content.includes("📦 Project delivered!")
  
  // If it's a project delivery message, find the associated commercial form
  const projectForm = isProjectDelivery 
    ? allMessages.find(m => 
        m.message_type === 'form' && 
        m.form?.form_type === 'commercial' && 
        m.form?.status === 'accepted'
      )?.form as ProjectForm | undefined
    : null

  // Fetch project files if this is a project delivery message
  useEffect(() => {
    const fetchProjectFiles = async () => {
      if (!isProjectDelivery || !projectForm?.id || loadingFiles) return
      
      setLoadingFiles(true)
      
      try {
        // First check if files are stored in the form's JSONB column
        if (projectForm.project_files?.length) {
          console.log('Found files in form data:', projectForm.project_files)
          setProjectFiles(projectForm.project_files)
          setLoadingFiles(false)
          return
        }
        
        // If no files in JSONB, check the project_files table
        const { data: dbFiles, error: dbError } = await supabase
          .from('project_files')
          .select('*')
          .eq('form_id', projectForm.id)
        
        if (!dbError && dbFiles?.length) {
          console.log('Found files in project_files table:', dbFiles)
          setProjectFiles(dbFiles)
          setLoadingFiles(false)
          return
        }
        
        // Last resort: check storage directly
        const possibleFolders = [
          projectForm.sender_id,
          message.sender_id
        ].filter(Boolean) as string[]
        
        // Only check the first valid folder to avoid duplicates
        for (const folderId of possibleFolders) {
          const foundFiles = await fetchProjectFilesFromStorage(projectForm.id, [folderId])
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
  }, [isProjectDelivery, projectForm?.id, supabase, toast, message.sender_id])
  
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
    // Parse the message content
    const lines = message.content.split('\n').filter(line => line.trim())
    
    // Extract file count from the first line
    const fileCountMatch = lines[0].match(/\((\d+) file/);
    const fileCount = fileCountMatch ? parseInt(fileCountMatch[1]) : 0;
    
    // Extract notes - look for "Notes:" and take everything after it
    let projectNotes = "";
    const notesMatch = message.content.match(/Notes:\s*(.+?)(?=\n\n|Project link:|$)/s);
    if (notesMatch && notesMatch[1]) {
      projectNotes = notesMatch[1].trim();
    }
    
    // Extract project link
    let projectUrl = "";
    const linkMatch = message.content.match(/Project link:\s*(.+?)(?=\n|$)/);
    if (linkMatch && linkMatch[1]) {
      projectUrl = linkMatch[1].trim();
    }
    
    // Get data from the form if available
    if (projectForm) {
      projectUrl = projectForm.project_submission_url || projectUrl;
      projectNotes = projectForm.project_notes || projectNotes;
    }
    
    const submittedAt = projectForm?.project_submitted_at 
      ? new Date(projectForm.project_submitted_at) 
      : new Date(message.created_at);
    const daysSinceSubmission = Math.floor((Date.now() - submittedAt.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 3 - daysSinceSubmission);

    return (
      <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-lg`}>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-900">Project Delivered</h4>
                    {fileCount > 0 && (
                      <p className="text-sm text-green-700 mt-1">
                        {fileCount} file{fileCount > 1 ? 's' : ''} included
                      </p>
                    )}
                  </div>
                  
                  {/* Delivery Notes */}
                  {projectNotes && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Notes:</p>
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{projectNotes}</p>
                    </div>
                  )}
                  
                  {/* External Link */}
                  {projectUrl && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Project link:</p>
                      <a 
                        href={projectUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-start gap-2 text-sm text-blue-600 hover:text-blue-800 mt-1 group"
                      >
                        <Link className="h-4 w-4 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <span className="break-all hover:underline">{projectUrl}</span>
                      </a>
                    </div>
                  )}
                  
                  {/* Conversation closure warning */}
                  <div className="text-sm">
                    {daysRemaining > 0 ? (
                      <p className="text-amber-600 font-medium">
                        ⏰ The conversation will automatically close in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}.
                      </p>
                    ) : (
                      <p className="text-red-600 font-medium">
                        🔒 Conversation is closed
                      </p>
                    )}
                  </div>
                  
                  {/* Project Files */}
                  {(projectFiles.length > 0 || fileCount > 0) && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Files:</p>
                      <div className="space-y-2">
                        {loadingFiles ? (
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                            <span className="text-sm text-gray-600">Loading files...</span>
                          </div>
                        ) : projectFiles.length > 0 ? (
                          projectFiles.map((file, index) => (
                            <div 
                              key={`${file.file_path}-${index}`} 
                              className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                <span className="text-sm text-gray-700 truncate" title={file.file_name}>
                                  {file.file_name}
                                </span>
                                {file.file_size > 0 && (
                                  <span className="text-xs text-gray-500 flex-shrink-0">
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
                                  className="flex-shrink-0"
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
                        ) : (
                          // Fallback: Show a placeholder if we know there are files but can't access them
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800">
                              {fileCount} file{fileCount > 1 ? 's' : ''} delivered
                            </p>
                            <p className="text-xs text-amber-600 mt-1">
                              Unable to load file information. Please refresh the page or contact support.
                            </p>
                          </div>
                        )}
                      </div>
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
    <div className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse pl-11' : 'pr-11'}`}>
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
              className="mt-2 rounded max-w-full max-h-64 object-contain"
              loading="lazy"
            />
          )}
          
          {attachmentUrl && message.attachment_type === 'file' && (
            <a 
              href={attachmentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-2 text-xs underline inline-flex items-center gap-1 hover:opacity-80"
            >
              <FileText className="h-3 w-3" />
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