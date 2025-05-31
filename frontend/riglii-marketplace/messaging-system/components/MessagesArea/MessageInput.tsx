import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, FileText, Receipt, Loader2, Upload, CheckCircle } from "lucide-react"
import OfferForm from "../Forms/OfferForm"
import ProjectSubmission from "../Forms/ProjectSubmission"

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
  const allForms = messages.filter(m => m.message_type === 'form' && m.form)
  
  // Filter forms - use form_type when available
  const proposalForms = allForms.filter(m => {
    if (m.form.form_type) {
      return m.form.form_type === 'proposal'
    }
    return m.form.sender_id !== currentUserId || !isCurrentUserFreelancer
  })
  
  const commercialForms = allForms.filter(m => {
    if (m.form.form_type) {
      return m.form.form_type === 'commercial'
    }
    return m.form.sender_id === currentUserId && isCurrentUserFreelancer
  })

  // Check if there's an accepted proposal
  const acceptedProposal = proposalForms.find(m => m.form?.status === 'accepted')
  
  // Check commercial form states
  const hasCommercialForm = commercialForms.length > 0
  const acceptedCommercialForm = commercialForms.find(m => m.form?.status === 'accepted')
  const pendingCommercialForm = commercialForms.find(m => m.form?.status === 'pending')
  
  // Check if project has been submitted
  const projectSubmitted = acceptedCommercialForm?.form?.project_submitted

  // Determine if freelancer can send commercial forms
  const canSendCommercialForm = isCurrentUserFreelancer && 
    acceptedProposal && 
    !hasCommercialForm && 
    !projectSubmitted

  // Determine if freelancer can submit project
  const canSubmitProject = isCurrentUserFreelancer && 
    acceptedCommercialForm && 
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
      return 'active'
    }
  }

  const conversationState = getConversationState()

  // Determine if messages can be sent
  const canSendMessage = () => {
    if (acceptedProposal) {
      if (pendingCommercialForm) {
        return isCurrentUserFreelancer
      }
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
    // Calculate days since project submission
    const submittedAt = acceptedCommercialForm?.form?.project_submitted_at
    const daysSinceSubmission = submittedAt 
      ? Math.floor((Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0
    const daysRemaining = Math.max(0, 3 - daysSinceSubmission)

    return (
      <form onSubmit={handleSubmit} className="p-4 border-t">
        {/* Project completed banner */}
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Project has been delivered ✅
              </p>
              {daysRemaining > 0 ? (
                <p className="text-xs text-green-600 mt-1">
                  Conversation will close in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                </p>
              ) : (
                <p className="text-xs text-red-600 mt-1">
                  Conversation is closed
                </p>
              )}
            </div>
          </div>
        </div>

        {selectedFile && daysRemaining > 0 && (
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
              placeholder={daysRemaining > 0 ? "Type a message..." : "Conversation is closed"}
              disabled={sending || daysRemaining === 0}
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
            disabled={daysRemaining === 0}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || sending || daysRemaining === 0}
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

  // Show special message for freelancer when commercial form is accepted
  if (isCurrentUserFreelancer && acceptedCommercialForm && !projectSubmitted) {
    return (
      <>
        <form onSubmit={handleSubmit} className="p-4 border-t">
          {/* Info banner */}
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">
                Commercial form accepted!
              </p>
              <p className="text-xs text-blue-600 mt-1">
                You can now deliver the project files
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setShowProjectSubmission(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Submit Project
            </Button>
          </div>

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
                placeholder="Type a message..."
                disabled={sending}
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
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || sending}
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

          {/* Show commercial form button ONLY if conditions are met */}
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
    </>
  )
}