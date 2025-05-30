import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, Image } from "lucide-react"
import type { Message } from "../../types"
import { getUserInitials, getTimeAgo } from "../../utils/formatters"
import FormDisplay from "../Forms/FormDisplay"

interface MessageItemProps {
  message: Message
  currentUserId: string
  onFormUpdate?: () => void
}

export default function MessageItem({ message, currentUserId, onFormUpdate }: MessageItemProps) {
  const isOwnMessage = message.sender_id === currentUserId

  if (message.message_type === "form" && message.form) {
    return (
      <FormDisplay 
        form={message.form} 
        currentUserId={currentUserId} 
        onStatusUpdate={onFormUpdate} 
      />
    )
  }

  // Helper to safely get sender info
  const getSenderInfo = () => {
    if (!message.sender) return { full_name: 'Unknown', avatar_url: undefined }
    
    // If it's already transformed
    if (typeof message.sender.full_name === 'string') {
      return message.sender
    }
    
    // If it needs transformation
    const profile = message.sender.freelancer_profiles?.[0]
    const full_name = profile?.display_name || 
                     `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
                     message.sender.email?.split('@')[0] || 
                     'Unknown'
    
    return {
      full_name,
      avatar_url: profile?.profile_picture_url
    }
  }

  const senderInfo = getSenderInfo()

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div className={`flex items-end gap-2 max-w-[70%] ${
        isOwnMessage ? "flex-row-reverse" : ""
      }`}>
        {!isOwnMessage && (
          <Avatar className="h-8 w-8">
            {senderInfo.avatar_url && (
              <AvatarImage src={senderInfo.avatar_url} />
            )}
            <AvatarFallback className="bg-gray-300 text-xs">
              {getUserInitials(senderInfo.full_name)}
            </AvatarFallback>
          </Avatar>
        )}
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwnMessage
              ? "bg-[#00D37F] text-white"
              : "bg-white border"
          }`}
        >
          {message.attachment_url && (
            <div className="mb-2">
              {message.attachment_type === 'image' ? (
                <img 
                  src={message.attachment_url.startsWith('http') 
                    ? message.attachment_url 
                    : `/api/storage/${message.attachment_url}`
                  } 
                  alt="Attachment" 
                  className="rounded-lg max-w-full h-auto max-h-64"
                />
              ) : (
                <a 
                  href={message.attachment_url.startsWith('http') 
                    ? message.attachment_url 
                    : `/api/storage/${message.attachment_url}`
                  } 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 underline"
                >
                  <FileText className="h-4 w-4" />
                  <span>Download attachment</span>
                </a>
              )}
            </div>
          )}
          <p className="break-words">{message.content}</p>
          <p className={`text-xs mt-1 ${
            isOwnMessage ? "text-green-100" : "text-gray-500"
          }`}>
            {getTimeAgo(new Date(message.created_at))}
          </p>
        </div>
      </div>
    </div>
  )
}