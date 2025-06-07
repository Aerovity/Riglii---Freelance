import type { Conversation, Message } from "../../types"
import MessageHeader from "./MessageHeader"
import MessagesList from "./MessagesList"
import MessageInput from "./MessageInput"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"

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
  onSendMessage: (content: string, receiverId: string, attachmentUrl?: string | null, attachmentType?: string | null, attachmentFilename?: string | null, attachmentSize?: number | null) => Promise<{ success: boolean }>
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
  const supabase = createClient()
  const { toast } = useToast()

  const handleSendMessage = async (content: string, file?: File) => {
    if (!activeConversation) return
    
    let attachmentUrl = null
    let attachmentType = null
    let attachmentFilename = null
    let attachmentSize = null

    if (file) {
      try {
        // Generate a unique file name
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${currentUserId}/${activeConversation.id}/${fileName}`

        console.log('Uploading file:', { fileName, filePath, fileSize: file.size })

        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('message-attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw uploadError
        }

        console.log('Upload successful:', uploadData)

        // Set attachment metadata
        attachmentUrl = uploadData.path
        attachmentType = file.type.startsWith('image/') ? 'image' : 'file'
        attachmentFilename = file.name
        attachmentSize = file.size

      } catch (error) {
        console.error('Error uploading file:', error)
        toast({
          title: "Upload Failed",
          description: "Unable to upload file. Please try again.",
          variant: "destructive",
        })
        return
      }
    }

    // Send message with attachment metadata
    await onSendMessage(
      content,
      activeConversation.participant.id,
      attachmentUrl,
      attachmentType,
      attachmentFilename,
      attachmentSize
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
        conversation={activeConversation}
        messages={messages}
        currentUserId={currentUserId}
        isCurrentUserFreelancer={isCurrentUserFreelancer || false}
        onFormSent={onFormSent}
      />
    </div>
  )
}