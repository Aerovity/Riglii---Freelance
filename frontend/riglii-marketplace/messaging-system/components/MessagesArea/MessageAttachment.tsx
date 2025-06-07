"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { 
  Download, 
  FileText, 
  Image as ImageIcon,
  Film, 
  Music, 
  File,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MessageAttachmentProps {
  attachmentUrl: string
  attachmentType?: string | null
  fileName?: string
  fileSize?: number
}

export default function MessageAttachment({ 
  attachmentUrl, 
  attachmentType,
  fileName,
  fileSize 
}: MessageAttachmentProps) {
  const [publicUrl, setPublicUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchPublicUrl = async () => {
      if (!attachmentUrl) return

      const { data } = supabase.storage
        .from("message-attachments")
        .getPublicUrl(attachmentUrl)

      if (data?.publicUrl) {
        setPublicUrl(data.publicUrl)
      }
    }

    fetchPublicUrl()
  }, [attachmentUrl, supabase.storage])

  const getFileIcon = () => {
    const ext = fileName?.split('.').pop()?.toLowerCase()
    
    if (['mp4', 'avi', 'mov'].includes(ext || '')) return <Film className="h-5 w-5" />
    if (['mp3', 'wav', 'ogg'].includes(ext || '')) return <Music className="h-5 w-5" />
    if (['pdf'].includes(ext || '')) return <FileText className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ""
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const handleDownload = async () => {
    if (!publicUrl) return

    try {
      const response = await fetch(publicUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName || 'download'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download file",
        variant: "destructive",
      })
    }
  }

  const isImage = attachmentType === 'image' || fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i)

  if (!publicUrl) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <span className="text-xs text-gray-400">Loading...</span>
      </div>
    )
  }

  // Image display - Instagram/Discord style
  if (isImage && !imageError) {
    return (
      <div className="mt-2 max-w-sm">
        <img
          src={publicUrl}
          alt={fileName || "Image"}
          className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(publicUrl, '_blank')}
          onError={() => setImageError(true)}
        />
      </div>
    )
  }

  // File display - Discord style
  return (
    <div 
      className="mt-2 inline-flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors max-w-sm"
      onClick={handleDownload}
    >
      <div className="text-gray-600 dark:text-gray-400">
        {getFileIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {fileName ? fileName.split('.').pop()?.toUpperCase() || 'File' : 'File'}
        </p>
        {fileSize && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatFileSize(fileSize)}
          </p>
        )}
      </div>
      <Download className="h-4 w-4 text-gray-400 flex-shrink-0" />
    </div>
  )
}