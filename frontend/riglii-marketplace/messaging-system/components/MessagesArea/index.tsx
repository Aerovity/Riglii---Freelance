import type { Conversation, Message } from "../../types"
import MessageHeader from "./MessageHeader"
import MessagesList from "./MessagesList"
import MessageInput from "./MessageInput"
import { uploadAttachment } from "../../utils/storage"

interface MessagesAreaProps {
  activeConversation: Conversation | null
  messages: Message[]
  currentUserId: string
  isCurrentUserFreelancer: boolean | null
  isMobileView: boolean
  sending: boolean
  onBack: () => void
  onFormSent: () => void
  onNewMessage: () => void
  onSendMessage: (content: string, receiverId: string, attachmentUrl?: string | null, attachmentType?: string | null) => Promise<{ success: boolean }>
}

export default function MessagesArea({
  activeConversation,
  messages,
  currentUserId,
  isCurrentUserFreelancer,
  isMobileView,
  sending,
  onBack,
  onFormSent,
  onNewMessage,
  onSendMessage
}: MessagesAreaProps) {
  const handleSendMessage = async (content: string, file?: File) => {
    if (!activeConversation) return
    
    let attachmentUrl = null
    let attachmentType = null

    if (file) {
      const result = await uploadAttachment(file, currentUserId)
      if (result.error) {
        return
      }
      attachmentUrl = result.url
      attachmentType = result.type
    }

    await onSendMessage(
      content,
      activeConversation.participant.id,
      attachmentUrl,
      attachmentType
    )
  }

  if (!activeConversation) {
    return (
      <div className={`${isMobileView ? 'hidden md:flex' : 'flex'} flex-1 items-center justify-center bg-gray-50`}>
        <div className="text-center text-gray-500">
          <p className="text-sm">Select a conversation to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${isMobileView && !activeConversation ? 'hidden' : 'flex'} flex-1 flex flex-col bg-white`}>
      <MessageHeader
        conversation={activeConversation}
        currentUserId={currentUserId}
        isCurrentUserFreelancer={isCurrentUserFreelancer}
        isMobileView={isMobileView}
        onBack={onBack}
        onFormSent={onFormSent}
      />
      <MessagesList
        messages={messages}
        currentUserId={currentUserId}
        onFormUpdate={onFormSent}
      />
      <MessageInput
        onSendMessage={handleSendMessage}
        sending={sending}
      />
    </div>
  )
}