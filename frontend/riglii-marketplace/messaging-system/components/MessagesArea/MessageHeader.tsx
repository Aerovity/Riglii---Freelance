import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react"
import type { Conversation } from "../../types"
import { getUserInitials } from "../../utils/formatters"

interface MessageHeaderProps {
  conversation: Conversation
  currentUserId: string
  isCurrentUserFreelancer: boolean | null
  isMobileView: boolean
  onBack: () => void
  onFormSent: () => void
}

export default function MessageHeader({
  conversation,
  currentUserId,
  isCurrentUserFreelancer,
  isMobileView,
  onBack,
  onFormSent
}: MessageHeaderProps) {
  const router = useRouter()

  const handleProfileClick = () => {
    if (conversation.participant.is_freelancer) {
      router.push(`/freelancer/${conversation.participant.id}`)
    }
  }

  return (
    <div className="px-4 py-3 border-b border-gray-100 bg-white/50 backdrop-blur-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isMobileView && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onBack}
            className="mr-2 h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div 
          className={`${conversation.participant.is_freelancer ? "cursor-pointer" : ""}`}
          onClick={handleProfileClick}
        >
          <Avatar className="h-9 w-9">
            {conversation.participant.avatar_url && (
              <AvatarImage src={conversation.participant.avatar_url} />
            )}
            <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
              {getUserInitials(conversation.participant.full_name)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h3 className="font-semibold text-sm">{conversation.participant.full_name}</h3>
          {conversation.participant.is_freelancer && (
            <p className="text-xs text-gray-500">Freelancer</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-gray-100">
          <Phone className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-gray-100">
          <Video className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-gray-100">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {conversation.participant.is_freelancer && (
              <DropdownMenuItem onClick={handleProfileClick}>
                View Profile
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>Clear Chat</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Block User</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}