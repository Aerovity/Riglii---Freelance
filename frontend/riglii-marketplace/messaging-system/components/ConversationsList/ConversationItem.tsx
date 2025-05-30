import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Conversation } from "../../types"
import { getUserInitials, getTimeAgo } from "../../utils/formatters"

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  currentUserId: string
  onClick: () => void
}

export default function ConversationItem({ 
  conversation, 
  isActive, 
  currentUserId,
  onClick 
}: ConversationItemProps) {
  const router = useRouter()

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (conversation.participant.is_freelancer) {
      router.push(`/freelancer/${conversation.participant.id}`)
    }
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
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h3 className="font-medium text-sm truncate">
              {conversation.participant.full_name}
            </h3>
            {conversation.last_message && (
              <span className="text-xs text-gray-500 ml-2">
                {getTimeAgo(new Date(conversation.last_message.created_at))}
              </span>
            )}
          </div>
          {conversation.last_message && (
            <p className="text-sm text-gray-600 truncate mt-0.5">
              {conversation.last_message.sender_id === currentUserId && "You: "}
              {conversation.last_message.content}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}