import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, FileText, Loader2 } from "lucide-react"
import OfferForm from "../Forms/OfferForm"

interface MessageInputProps {
  onSendMessage: (content: string, file?: File) => Promise<void>
  sending: boolean
  conversation?: any // Add proper type
  messages?: any[] // Add proper type
  currentUserId?: string
  isCurrentUserFreelancer?: boolean
}

export default function MessageInput({ 
  onSendMessage, 
  sending,
  conversation,
  messages = [],
  currentUserId,
  isCurrentUserFreelancer = false
}: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if there's an initial form in the conversation
  const hasInitialForm = messages.some(m => 
    m.message_type === 'form' && 
    m.form && 
    m.sender_id === currentUserId
  )

  // Get the status of the initial form if it exists
  const initialFormMessage = messages.find(m => 
  m.message_type === 'form' && 
  m.form
)

const initialFormStatus = initialFormMessage?.form?.status

  // Determine if user can send messages
  const canSendMessage = () => {
    // If user is a client (not freelancer)
    if (!isCurrentUserFreelancer) {
      // Must have sent initial form and it must be accepted
      return hasInitialForm && initialFormStatus === 'accepted'
    }
    
    // If user is a freelancer
    if (isCurrentUserFreelancer) {
      // Can send messages if there's a form and it's accepted
      return initialFormStatus === 'accepted'
    }
    
    return false
  }

  // Determine if we should show the form-first message
  const shouldShowFormFirst = !isCurrentUserFreelancer && !hasInitialForm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !canSendMessage()) return

    await onSendMessage(message, selectedFile || undefined)
    setMessage("")
    setSelectedFile(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (canSendMessage()) {
        handleSubmit(e as any)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  // Show form-first UI for clients who haven't sent a form
  if (shouldShowFormFirst && conversation) {
    return (
      <div className="p-4 border-t bg-yellow-50 border-yellow-200">
        <div className="flex flex-col items-center justify-center space-y-3">
          <FileText className="h-8 w-8 text-yellow-600" />
          <p className="text-sm font-medium text-yellow-800 text-center">
            You must send a project proposal to start the conversation
          </p>
          <OfferForm
            conversationId={conversation.id}
            receiverId={conversation.participant.id}
            senderId={currentUserId!}
            trigger={
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                Create Project Proposal
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  // Show waiting state for clients whose form is pending
  if (!isCurrentUserFreelancer && initialFormStatus === 'pending') {
    return (
      <div className="p-4 border-t bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-sm">Waiting for freelancer to respond to your proposal...</p>
        </div>
      </div>
    )
  }

  // Show message for freelancers with pending forms
  if (isCurrentUserFreelancer && initialFormStatus === 'pending') {
    return (
      <div className="p-4 border-t bg-blue-50">
        <div className="text-center text-blue-700">
          <p className="text-sm">Please accept or refuse the proposal above to continue the conversation</p>
        </div>
      </div>
    )
  }

  // Show closed conversation state
  if (initialFormStatus === 'refused' || initialFormStatus === 'cancelled') {
    return (
      <div className="p-4 border-t bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-sm">This conversation has been closed</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      {selectedFile && (
        <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
          <span className="text-sm text-gray-600 truncate">{selectedFile.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFile(null)}
          >
            Remove
          </Button>
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={canSendMessage() ? "Type a message..." : "Accept the proposal to start messaging"}
            disabled={sending || !canSendMessage()}
            className="resize-none pr-10 min-h-[44px] max-h-32"
            rows={1}
          />
          {selectedFile && (
            <div className="absolute right-2 top-2">
              <Paperclip className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.txt"
        />

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={!canSendMessage()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Show form button for active conversations */}
        {canSendMessage() && conversation && (
          <OfferForm
            conversationId={conversation.id}
            receiverId={conversation.participant.id}
            senderId={currentUserId!}
            trigger={
              <Button type="button" size="icon" variant="ghost">
                <FileText className="h-4 w-4" />
              </Button>
            }
          />
        )}

        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || sending || !canSendMessage()}
          className="bg-[#00D37F] hover:bg-[#00c070]"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </form>
  )
}