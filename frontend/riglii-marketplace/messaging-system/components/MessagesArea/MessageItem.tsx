import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText } from "lucide-react"
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

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex items-end gap-2 max-w-[70%] ${
        isOwnMessage ? "flex-row-reverse" : ""
      }`}>
        {!isOwnMessage && (
          <Avatar className="h-8 w-8 mb-1">
            {message.sender?.avatar_url && (
              <AvatarImage src={message.sender.avatar_url} />
            )}
            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
              {getUserInitials(message.sender?.full_name || 'BE')}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col gap-1">
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwnMessage
                ? "bg-[#00D37F] text-white rounded-br-sm"
                : "bg-gray-100 text-gray-900 rounded-bl-sm"
            }`}
          >
            {message.attachment_url && (
              <div className="mb-2">
                {message.attachment_type === 'image' ? (
                  <img 
                    src={`/api/storage/${message.attachment_url}`} 
                    alt="Attachment" 
                    className="rounded-lg max-w-full h-auto max-h-64"
                  />
                ) : (
                  <a 
                    href={`/api/storage/${message.attachment_url}`} 
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
            <p className="break-words text-sm">{message.content}</p>
          </div>
          <span className={`text-xs text-gray-500 px-1 ${
            isOwnMessage ? "text-right" : "text-left"
          }`}>
            {getTimeAgo(new Date(message.created_at))}
          </span>
        </div>
      </div>
    </div>
  )
}