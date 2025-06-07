"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getUserInitials, getTimeAgo } from "../../utils/formatters"
import { Package, Download, Link, FileText, Loader2, CheckCircle, Clock } from "lucide-react"
import { downloadProjectFile, fetchProjectFilesFromStorage } from "../../utils/storage"
import FormDisplay from "../Forms/FormDisplay"
import MessageAttachment from "./MessageAttachment"
import { useAvatar } from "../../hooks/useAvatar"
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
  onMessageRemoved?: (messageId: string) => void
  conversationId?: string
}

export default function MessageDisplay({
  message,
  isOwn,
  currentUserId,
  allMessages = [],
  onMessageRemoved,
  conversationId,
}: MessageDisplayProps) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  // Use the improved avatar hook for sender's avatar
  const { avatarUrl: senderAvatarUrl } = useAvatar(message.sender_id)

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
      console.error("Download error:", err)
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
    if (bytes === 0) return "0 B"
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  // Check if this is a system/status message
  const isSystemMessage = message.content.includes("✅ Proposal accepted") || 
                         message.content.includes("Accepted the project form")

  // Check if this is a project delivery message
  const isProjectDelivery = message.content.includes("📦 Project delivered!")

  // If it's a project delivery message, find the associated commercial form
  const projectForm = isProjectDelivery
    ? (allMessages.find(
        (m) => m.message_type === "form" && m.form?.form_type === "commercial" && m.form?.status === "accepted",
      )?.form as ProjectForm | undefined)
    : null

  // Fetch project files if this is a project delivery message
  useEffect(() => {
    const fetchProjectFiles = async () => {
      if (!isProjectDelivery || !projectForm?.id || loadingFiles) return

      setLoadingFiles(true)

      try {
        // First check if files are stored in the form's JSONB column
        if (projectForm.project_files?.length) {
          console.log("Found files in form data:", projectForm.project_files)
          setProjectFiles(projectForm.project_files)
          setLoadingFiles(false)
          return
        }

        // If no files in JSONB, check the project_files table
        const { data: dbFiles, error: dbError } = await supabase
          .from("project_files")
          .select("*")
          .eq("form_id", projectForm.id)

        if (!dbError && dbFiles?.length) {
          console.log("Found files in project_files table:", dbFiles)
          setProjectFiles(dbFiles)
          setLoadingFiles(false)
          return
        }

        // Last resort: check storage directly
        const possibleFolders = [projectForm.sender_id, message.sender_id].filter(Boolean) as string[]

        // Only check the first valid folder to avoid duplicates
        for (const folderId of possibleFolders) {
          const foundFiles = await fetchProjectFilesFromStorage(projectForm.id, [folderId])
          if (foundFiles.length > 0) {
            console.log("Found project files in storage:", foundFiles)
            setProjectFiles(foundFiles)
            break
          }
        }
      } catch (err) {
        console.error("Error fetching project files:", err)
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
  if (message.message_type === "form" && message.form) {
    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
        <div className="max-w-lg">
          <FormDisplay
            form={message.form}
            currentUserId={currentUserId}
            messageId={message.id}
            conversationId={message.conversation_id}
            onFormRemoved={() => {
              // Add callback to handle form removal
              // This should trigger a refresh of the messages or remove the message from the UI
            }}
          />
          <p className="text-xs text-gray-500 mt-1 text-center">{getTimeAgo(new Date(message.created_at))}</p>
        </div>
      </div>
    )
  }

  // If it's a system message (proposal accepted, commercial form accepted)
  if (isSystemMessage) {
    return (
      <div className="flex justify-center mb-4">
        <div className="max-w-md">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  {message.content}
                </span>
              </div>
            </CardContent>
          </Card>
          <p className="text-xs text-gray-500 mt-1 text-center">{getTimeAgo(new Date(message.created_at))}</p>
        </div>
      </div>
    )
  }

  // If it's a project delivery message, show original simple display
  if (isProjectDelivery) {
    return (
      <div className={`flex mb-4 ${isOwn ? "justify-end" : "justify-start"}`}>
        <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-lg`}>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900">Project Delivered</h4>
                  <p className="text-sm text-green-700 mt-1">{message.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <span className="text-xs text-gray-500 mt-1">{getTimeAgo(new Date(message.created_at))}</span>
        </div>
      </div>
    )
  }

  // Regular message display
  return (
    <div className={`flex gap-3 mb-4 ${isOwn ? "flex-row-reverse pl-11" : "pr-11"}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage 
          src={senderAvatarUrl || undefined}
          alt={`${message.sender?.full_name || "User"}'s avatar`}
        />
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
          {getUserInitials(message.sender?.full_name || "Unknown")}
        </AvatarFallback>
      </Avatar>

      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
        <div className={`rounded-lg px-4 py-2 ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

          {message.attachment_url && (
            <MessageAttachment
              attachmentUrl={message.attachment_url}
              attachmentType={message.attachment_type}
              fileName={message.attachment_filename}
              fileSize={message.attachment_size}
            />
          )}
        </div>

        <span className="text-xs text-gray-500 mt-1">{getTimeAgo(new Date(message.created_at))}</span>
      </div>
    </div>
  )
}