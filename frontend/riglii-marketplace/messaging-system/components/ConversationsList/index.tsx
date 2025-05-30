import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Edit, MessageCircle, Loader2 } from "lucide-react"
import type { Conversation } from "../../types"
import ConversationItem from "./ConversationItem"
import ConversationSearch from "./ConversationSearch"

interface ConversationsListProps {
  conversations: Conversation[]
  activeConversation: string | null
  currentUserId: string
  loading: boolean
  isMobileView: boolean
  onConversationSelect: (conversationId: string) => void
  onNewMessage: () => void
  messages?: any[] // Add messages prop
}

export default function ConversationsList({
  conversations,
  activeConversation,
  currentUserId,
  loading,
  isMobileView,
  onConversationSelect,
  onNewMessage,
  messages = []
}: ConversationsListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = conversations.filter((conv) =>
    conv.participants?.some((participant: any) =>
      participant.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  return (
    <div className={`${isMobileView && activeConversation ? 'hidden' : 'flex'} flex-col ${
      isMobileView ? 'w-full' : 'w-80'
    } border-r border-gray-100 bg-gray-50/50`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={onNewMessage}
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <ConversationSearch value={searchQuery} onChange={setSearchQuery} />
      </div>
      
      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500">No messages yet</p>
          </div>
        ) : (
          <div className="py-2">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={activeConversation === conversation.id}
                currentUserId={currentUserId}
                onClick={() => onConversationSelect(conversation.id)}
                messages={messages}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}