import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle } from "lucide-react"
import type { Conversation } from "../../types"
import { getUserInitials, getTimeAgo } from "../../utils/formatters"

// Ensure Conversation type includes participant property
import type { PublicUser } from "../../types"

interface ConversationWithParticipant extends Conversation {
  participant: PublicUser
}

interface ConversationItemProps {
  conversation: ConversationWithParticipant
  isActive: boolean
  currentUserId: string
  onClick: () => void
  messages?: any[] // Add messages prop to check form status
}

export default function ConversationItem({ 
  conversation, 
  isActive, 
  currentUserId,
  onClick,
  messages = []
}: ConversationItemProps) {
  const router = useRouter()

  // Get form status from messages
  const getFormStatus = () => {
    const formMessage = messages.find(m => 
      m.conversation_id === conversation.id && 
      m.message_type === 'form' && 
      m.form
    )
    return formMessage?.form?.status || null
  }

  const formStatus = getFormStatus()

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (conversation.participant.is_freelancer) {
      router.push(`/freelancer/${conversation.participant.id}`)
    }
  }

  const getStatusIcon = () => {
    switch (formStatus) {
      case 'accepted':
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'refused':
        return <XCircle className="h-3 w-3 text-red-500" />
      case 'pending':
        return <Clock className="h-3 w-3 text-yellow-500" />
      default:
        return null
    }
  }

  const getLastMessagePreview = () => {
    if (!conversation.lastMessage) return null

    // If last message is a form, show form status
    if (conversation.lastMessage.message_type === 'form') {
      return (
        <p className="text-sm text-gray-600 truncate mt-0.5">
          {conversation.lastMessage.sender_id === currentUserId && "You: "}
          📄 Project Proposal
        </p>
      )
    }

    // Regular message
    return (
      <p className="text-sm text-gray-600 truncate mt-0.5">
        {conversation.lastMessage.sender_id === currentUserId && "You: "}
        {conversation.lastMessage.content}
      </p>
    )
  }

  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 cursor-pointer hover:bg-white/50 transition-all duration-200 mx-2 rounded-xl ${
        isActive ? "bg-white shadow-sm" : ""
      }`}
    >
      <div className="flex items-center space-x-3">
        <div 
          className="relative"
          onClick={handleAvatarClick}
        >
          <Avatar className="h-10 w-10">
            {conversation.participant.avatar_url && (
              <AvatarImage src={conversation.participant.avatar_url} />
            )}
            <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
              {getUserInitials(conversation.participant.full_name)}
            </AvatarFallback>
          </Avatar>
          {formStatus && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
              {getStatusIcon()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h3 className="font-medium text-sm truncate">
              {conversation.participant.full_name}
            </h3>
            {conversation.lastMessage && (
            <span className="text-xs text-gray-500 ml-2">
          {getTimeAgo(new Date(conversation.lastMessage.created_at))}
          </span>
         )}
          </div>
          {getLastMessagePreview()}
          {formStatus === 'pending' && (
            <Badge variant="outline" className="mt-1 text-xs border-yellow-500 text-yellow-700">
              Proposal Pending
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}