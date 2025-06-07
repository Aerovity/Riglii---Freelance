import { useState, useRef, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, FileText, Receipt, Loader2, Upload, CheckCircle, Star } from "lucide-react"
import OfferForm from "../Forms/OfferForm"
import ProjectSubmission from "../Forms/ProjectSubmission"
import ReviewForm from "../Forms/ReviewForm"

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
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

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
  const projectSubmittedAt = acceptedCommercialForm?.form?.project_submitted_at

  // Calculate days since project submission
  const daysSinceSubmission = projectSubmittedAt 
    ? Math.floor((Date.now() - new Date(projectSubmittedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0
  const daysRemaining = Math.max(0, 3 - daysSinceSubmission)
  const conversationClosed = projectSubmitted && daysRemaining === 0

  // Determine if freelancer can send commercial forms
  const canSendCommercialForm = isCurrentUserFreelancer && 
    acceptedProposal && 
    !hasCommercialForm && 
    !projectSubmitted

  // Determine if freelancer can submit project
  const canSubmitProject = isCurrentUserFreelancer && 
    acceptedCommercialForm && 
    !projectSubmitted

  // Check if client has already reviewed
  useEffect(() => {
    const checkExistingReview = async () => {
      if (!isCurrentUserFreelancer && acceptedCommercialForm?.form?.id && currentUserId && projectSubmitted) {
        try {
          const { data, error } = await supabase
            .from("reviews")
            .select("id")
            .eq("form_id", acceptedCommercialForm.form.id)
            .eq("client_id", currentUserId)
            .maybeSingle()
          
          setHasReviewed(!!data)
        } catch (err) {
          console.error('Error checking review:', err)
        }
      }
    }
    
    checkExistingReview()
  }, [acceptedCommercialForm?.form?.id, currentUserId, isCurrentUserFreelancer, projectSubmitted, supabase])

  // SIMPLIFIED MESSAGE SENDING LOGIC:
  // 1. Block if no accepted proposal (conversation not opened)
  // 2. Block if conversation is closed (3+ days after project submission)
  // 3. Allow everything else
  const canSendMessage = () => {
    // Block if no accepted proposal
    if (!acceptedProposal) return false
    
    // Block if conversation is closed (3+ days after project submission)
    if (conversationClosed) return false
    
    // Allow all other cases
    return true
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!message.trim() && !selectedFile) || !canSendMessage()) return

    try {
      await onSendMessage(message || "", selectedFile || undefined)
      setMessage("")
      setSelectedFile(null)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (canSendMessage()) {
        handleSubmit(e as any)
      }
    }
  }

  // CLIENT: Show proposal requirement if no accepted proposal
  if (!isCurrentUserFreelancer && !acceptedProposal) {
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

  // FREELANCER: Show accept/refuse requirement if no accepted proposal
  if (isCurrentUserFreelancer && !acceptedProposal) {
    const pendingProposal = proposalForms.find(m => m.form?.status === 'pending')
    
    if (pendingProposal) {
      return (
        <div className="p-4 border-t bg-blue-50">
          <div className="text-center text-blue-700">
            <p className="text-sm">Please accept or refuse the proposal above to start the conversation</p>
          </div>
        </div>
      )
    } else {
      return (
        <div className="p-4 border-t bg-gray-50">
          <div className="text-center text-gray-500">
            <p className="text-sm">No proposal in this conversation</p>
          </div>
        </div>
      )
    }
  }

  // CONVERSATION CLOSED: Show closed state
  if (conversationClosed) {
    return (
      <div className="p-4 border-t">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Conversation is closed
              </p>
              <p className="text-xs text-red-600 mt-1">
                This conversation was automatically closed 3 days after project delivery
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // PROJECT COMPLETED: Show completed state with review option
  if (projectSubmitted) {
    return (
      <>
        <form onSubmit={handleSubmit} className="p-4 border-t">
          {/* Project completed banner */}
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Project has been delivered ✅
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Conversation will close in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              {/* Show review button for clients */}
              {!isCurrentUserFreelancer && acceptedCommercialForm && (
                <Button
                  type="button"
                  onClick={() => setShowReviewForm(true)}
                  className={hasReviewed ? "bg-gray-600 hover:bg-gray-700" : "bg-blue-600 hover:bg-blue-700"}
                  size="sm"
                >
                  <Star className="h-4 w-4 mr-2" />
                  {hasReviewed ? "Update Review" : "Leave Review"}
                </Button>
              )}
            </div>
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
              accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar,.mp4,.mp3,.xls,.xlsx,.ppt,.pptx"
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

        {/* Review Form Dialog for clients */}
        {!isCurrentUserFreelancer && acceptedCommercialForm && (
          <ReviewForm
            freelancerId={acceptedCommercialForm.form.sender_id}
            clientId={currentUserId!}
            formId={acceptedCommercialForm.form.id}
            projectTitle={acceptedCommercialForm.form.title}
            freelancerName={conversation.participant.full_name || "the freelancer"}
            open={showReviewForm}
            onOpenChange={setShowReviewForm}
            onSubmitted={() => {
              setHasReviewed(true)
              onFormSent?.()
            }}
          />
        )}
      </>
    )
  }

  // FREELANCER WITH ACCEPTED COMMERCIAL FORM: Show project submission option
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
              accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar,.mp4,.mp3,.xls,.xlsx,.ppt,.pptx"
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

  // REGULAR MESSAGE INPUT: Once proposal is accepted, allow normal messaging
  return (
    <>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        {/* Show commercial form pending notice for clients */}
        {!isCurrentUserFreelancer && pendingCommercialForm && (
          <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              📄 Please review the commercial form above
            </p>
          </div>
        )}

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
            accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar,.mp4,.mp3,.xls,.xlsx,.ppt,.pptx"
          />

          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
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
    </>
  )
}