import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, FileText, Receipt, Loader2, Upload } from "lucide-react"
import OfferForm from "../Forms/OfferForm"
import ProjectSubmission from "../Forms/Projectsubmission"

interface MessageInputProps {
  onSendMessage: (content: string, file?: File) => Promise<void>
  sending: boolean
  conversation?: any
  messages?: any[]
  currentUserId?: string
  isCurrentUserFreelancer?: boolean
  onFormSent?: () => void
}

export default function MessageInput({ 
  onSendMessage, 
  sending,
  conversation,
  messages = [],
  currentUserId,
  isCurrentUserFreelancer = false,
  onFormSent
}: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showProjectSubmission, setShowProjectSubmission] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get all forms in the conversation
  // Handle legacy forms without form_type field
  const allForms = messages.filter(m => m.message_type === 'form' && m.form)
  
  // Debug log all forms
  console.log('All forms:', allForms.map(f => ({
    id: f.form?.id,
    title: f.form?.title,
    form_type: f.form?.form_type,
    status: f.form?.status,
    sender_id: f.form?.sender_id
  })))
  
  // Filter forms - use sender_id to determine type if form_type is missing
  const proposalForms = allForms.filter(m => {
    // If form_type exists, use it
    if (m.form.form_type) {
      return m.form.form_type === 'proposal'
    }
    // Otherwise, proposals come from clients (non-freelancers)
    // This is a temporary workaround - you should fix the query to include form_type
    return m.form.sender_id !== currentUserId || !isCurrentUserFreelancer
  })
  
  const commercialForms = allForms.filter(m => {
    // If form_type exists, use it
    if (m.form.form_type) {
      return m.form.form_type === 'commercial'
    }
    // Otherwise, commercial forms come from freelancers
    // Check if the form has characteristics of a commercial form
    return m.form.sender_id === currentUserId && isCurrentUserFreelancer
  })

  // Check if there's an accepted proposal
  const acceptedProposal = proposalForms.find(m => m.form?.status === 'accepted')
  
  // Check if there's any commercial form (pending, accepted, or refused)
  const hasCommercialForm = commercialForms.length > 0
  const acceptedCommercialForm = commercialForms.find(m => m.form?.status === 'accepted')
  const pendingCommercialForm = commercialForms.find(m => m.form?.status === 'pending')
  
  // Check if project has been submitted
  const projectSubmitted = acceptedCommercialForm?.form?.project_submitted

  // Determine if freelancer can send commercial forms
  // Can send if: has accepted proposal AND no ACCEPTED commercial form exists
  const canSendCommercialForm = isCurrentUserFreelancer && 
    acceptedProposal && 
    !acceptedCommercialForm && // No accepted commercial form
    !projectSubmitted

  // Determine conversation state
  const getConversationState = () => {
    if (!isCurrentUserFreelancer) {
      // Client flow
      if (!proposalForms.length) return 'need_proposal'
      if (!acceptedProposal) return 'waiting_proposal_response'
      if (pendingCommercialForm) return 'commercial_pending'
      if (acceptedCommercialForm && !projectSubmitted) return 'awaiting_project'
      if (projectSubmitted) return 'project_completed'
      return 'active'
    } else {
      // Freelancer flow
      if (!acceptedProposal) {
        const pendingProposal = proposalForms.find(m => m.form?.status === 'pending')
        return pendingProposal ? 'proposal_pending' : 'no_proposal'
      }
      if (pendingCommercialForm) return 'commercial_sent'
      if (projectSubmitted) return 'project_completed'
      return 'active' // Can always be active after proposal accepted
    }
  }

  const conversationState = getConversationState()

  // Debug logging for submit project button
  console.log('Submit Project Button Debug:', {
    isCurrentUserFreelancer,
    hasAcceptedCommercialForm: !!acceptedCommercialForm,
    acceptedCommercialFormId: acceptedCommercialForm?.form?.id,
    projectSubmitted,
    shouldShowSubmitButton: isCurrentUserFreelancer && acceptedCommercialForm && !projectSubmitted,
    canSendCommercialForm,
    commercialFormsCount: commercialForms.length,
    commercialForms: commercialForms.map(f => ({ 
      id: f.form?.id, 
      status: f.form?.status,
      form_type: f.form?.form_type 
    }))
  })

  // Determine if messages can be sent
  const canSendMessage = () => {
    // Both parties can send messages after proposal is accepted
    if (acceptedProposal) {
      // If there's a pending commercial form, only freelancer can send messages
      if (pendingCommercialForm) {
        return isCurrentUserFreelancer
      }
      // Otherwise both can send messages
      return true
    }
    return false
  }

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

  // Render different states for clients
  if (!isCurrentUserFreelancer) {
    if (conversationState === 'need_proposal') {
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
              isFreelancer={false}
              onFormSent={onFormSent}
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

    if (conversationState === 'waiting_proposal_response') {
      return (
        <div className="p-4 border-t bg-gray-50">
          <div className="text-center text-gray-500">
            <p className="text-sm">Waiting for freelancer to respond to your proposal...</p>
          </div>
        </div>
      )
    }

    if (conversationState === 'commercial_pending') {
      return (
        <div className="p-4 border-t bg-orange-50">
          <div className="text-center text-orange-700">
            <p className="text-sm">Please review the commercial form above</p>
          </div>
        </div>
      )
    }

    if (conversationState === 'awaiting_project') {
      return (
        <div className="p-4 border-t bg-yellow-50">
          <div className="text-center text-yellow-700">
            <p className="text-sm">Waiting for freelancer to deliver the project...</p>
          </div>
        </div>
      )
    }
  }

  // Render different states for freelancers
  if (isCurrentUserFreelancer) {
    if (conversationState === 'proposal_pending') {
      return (
        <div className="p-4 border-t bg-blue-50">
          <div className="text-center text-blue-700">
            <p className="text-sm">Please accept or refuse the proposal above to continue the conversation</p>
          </div>
        </div>
      )
    }

    if (conversationState === 'no_proposal') {
      return (
        <div className="p-4 border-t bg-gray-50">
          <div className="text-center text-gray-500">
            <p className="text-sm">No proposal in this conversation</p>
          </div>
        </div>
      )
    }

    if (conversationState === 'commercial_sent') {
      return (
        <div className="p-4 border-t bg-orange-50">
          <div className="text-center text-orange-700">
            <p className="text-sm">Waiting for client to respond to your commercial form...</p>
            <p className="text-xs mt-1">You can continue sending messages</p>
          </div>
        </div>
      )
    }
  }

  if (conversationState === 'project_completed') {
    return (
      <div className="p-4 border-t bg-green-50">
        <div className="text-center text-green-700">
          <p className="text-sm">Project has been completed and delivered ✅</p>
        </div>
      </div>
    )
  }

  // Regular message input
  return (
    <>
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
              placeholder={canSendMessage() ? "Type a message..." : "Complete the form process to send messages"}
              disabled={sending || !canSendMessage()}
              className="resize-none pr-10 min-h-[44px] max-h-32"
              rows={1}
            />
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

          {/* Show commercial form button ONLY if no commercial forms exist at all */}
          {canSendCommercialForm && (
            <OfferForm
              conversationId={conversation.id}
              receiverId={conversation.participant.id}
              senderId={currentUserId!}
              isFreelancer={true}
              onFormSent={onFormSent}
              trigger={
                <Button type="button" size="icon" variant="ghost" title="Send Commercial Form">
                  <Receipt className="h-4 w-4" />
                </Button>
              }
            />
          )}

          {/* Show project submission button when commercial form is accepted (replaces commercial form button) */}
          {isCurrentUserFreelancer && acceptedCommercialForm && !projectSubmitted && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => {
                console.log('Project submission button clicked')
                setShowProjectSubmission(true)
              }}
              title="Submit Project"
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Upload className="h-4 w-4" />
            </Button>
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

      {/* Project Submission Dialog */}
      {acceptedCommercialForm && (
        <ProjectSubmission
          formId={acceptedCommercialForm.form.id}
          conversationId={conversation.id}
          receiverId={conversation.participant.id}
          senderId={currentUserId!}
          open={showProjectSubmission}
          onOpenChange={setShowProjectSubmission}
          onSubmitted={() => {
            setShowProjectSubmission(false)
            onFormSent?.()
          }}
        />
      )}
    </>
  )
}