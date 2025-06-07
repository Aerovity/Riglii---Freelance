import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, Send, Loader2, Clock, Receipt } from "lucide-react"
import type { FormData } from "../../types"
import { validateFormData } from "../../utils/validations"
import { sendProposalReceivedEmail } from "@/app/actions/emails"

interface OfferFormProps {
  conversationId: string
  receiverId: string
  senderId: string
  isFreelancer: boolean
  onFormSent?: () => void
  trigger?: React.ReactNode
}

export default function OfferForm({
  conversationId,
  receiverId,
  senderId,
  isFreelancer,
  onFormSent,
  trigger
}: OfferFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    price: "",
    timeEstimate: "",
  })

  const supabase = createClient()
  const { toast } = useToast()
  
  const formType = isFreelancer ? 'commercial' : 'proposal'
  const formTitle = isFreelancer ? 'Create Commercial Form' : 'Create Project Proposal'
  const formIcon = isFreelancer ? Receipt : FileText

  const handleSubmit = async () => {
    console.log("=== OFFER FORM SUBMIT DEBUG START ===")
    console.log("1. Initial form submission parameters:")
    console.log("   - Form type:", isFreelancer ? "Commercial" : "Proposal")
    console.log("   - Conversation ID:", conversationId)
    console.log("   - Sender ID:", senderId)
    console.log("   - Receiver ID:", receiverId)
    console.log("   - Form data:", {
      title: formData.title,
      description: formData.description.substring(0, 50) + "...",
      price: formData.price,
      timeEstimate: formData.timeEstimate
    })
    
    // Validate conversation ID first
    if (!conversationId) {
      console.error("2. CRITICAL ERROR: conversationId is missing!")
      toast({
        title: "Error",
        description: "Missing conversation ID. Please refresh and try again.",
        variant: "destructive",
      })
      return
    }
    
    const validation = validateFormData(formData)
    if (!validation.isValid) {
      console.log("2. Form validation failed:", validation.error)
      toast({
        title: "Invalid Form",
        description: validation.error,
        variant: "destructive",
      })
      return
    }
    console.log("2. Form validation passed")

    setLoading(true)
    try {
      console.log("3. Starting database operations...")
      
      // Verify conversation exists first
      console.log("4. Verifying conversation exists...")
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id, user1_id, user2_id')
        .eq('id', conversationId)
        .single()

      if (convError || !conversation) {
        console.error("4. Conversation verification failed:", convError)
        throw new Error("Conversation not found")
      }
      
      console.log("4. Conversation verified:", {
        id: conversation.id,
        user1_id: conversation.user1_id,
        user2_id: conversation.user2_id
      })

      console.log("5. Fetching sender user data...")
      const { data: senderUser, error: senderError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          freelancer_profiles(
            id,
            first_name,
            last_name,
            display_name
          )
        `)
        .eq('id', senderId)
        .single()

      console.log("6. Sender data result:", {
        hasData: !!senderUser,
        userId: senderUser?.id,
        email: senderUser?.email,
        hasProfile: !!senderUser?.freelancer_profiles?.[0],
        profileName: senderUser?.freelancer_profiles?.[0]?.display_name || 
                    senderUser?.freelancer_profiles?.[0]?.first_name,
        error: senderError
      })

      if (senderError) {
        console.error("6. Sender fetch error:", senderError)
        throw senderError
      }

      console.log("7. Fetching receiver user data...")
      const { data: receiverUser, error: receiverError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          freelancer_profiles(
            id,
            first_name,
            last_name,
            display_name
          )
        `)
        .eq('id', receiverId)
        .single()

      console.log("8. Receiver data result:", {
        hasData: !!receiverUser,
        userId: receiverUser?.id,
        email: receiverUser?.email,
        hasProfile: !!receiverUser?.freelancer_profiles?.[0],
        profileName: receiverUser?.freelancer_profiles?.[0]?.display_name || 
                    receiverUser?.freelancer_profiles?.[0]?.first_name,
        error: receiverError
      })

      if (receiverError) {
        console.error("8. Receiver fetch error:", receiverError)
        throw receiverError
      }

      // Create the form with explicit conversation_id
      console.log("9. Creating form with data:")
      const formInsertData = {
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number.parseFloat(formData.price),
        time_estimate: formData.timeEstimate.trim(),
        status: "pending",
        form_type: formType,
      }
      console.log("9. Form insert data:", formInsertData)

      const { data: createdForm, error: formError } = await supabase
        .from("forms")
        .insert(formInsertData)
        .select(`
          id,
          conversation_id,
          sender_id,
          receiver_id,
          title,
          description,
          price,
          time_estimate,
          status,
          form_type,
          created_at
        `)
        .single()

      if (formError) {
        console.error("10. Form creation error:", formError)
        console.error("    Error details:", {
          code: formError.code,
          message: formError.message,
          details: formError.details,
          hint: formError.hint
        })
        throw formError
      }
      
      console.log("10. Form created successfully:", {
        id: createdForm.id,
        conversation_id: createdForm.conversation_id,
        title: createdForm.title,
        status: createdForm.status,
        form_type: createdForm.form_type
      })

      // Verify the form was created with conversation_id
      if (!createdForm.conversation_id) {
        console.error("11. CRITICAL: Form created but conversation_id is null!")
        throw new Error("Form created but missing conversation_id")
      }
      console.log("11. Form conversation_id verified:", createdForm.conversation_id)

      // Send email notification for proposal forms
      console.log("12. Email notification check:")
      console.log("    - Is freelancer (skip email):", isFreelancer)
      console.log("    - Receiver has email:", !!receiverUser?.email)
      console.log("    - Sender data available:", !!senderUser)
      
      if (!isFreelancer && receiverUser?.email && senderUser) {
        console.log("13. Preparing to send proposal received email...")
        try {
          const receiverName = receiverUser.freelancer_profiles?.[0]?.display_name || 
                             receiverUser.freelancer_profiles?.[0]?.first_name || 
                             receiverUser.email.split('@')[0]

          const senderName = senderUser.freelancer_profiles?.[0]?.display_name ||
                           senderUser.freelancer_profiles?.[0]?.first_name ||
                           senderUser.email?.split('@')[0] || 'Client'

          console.log("14. Email parameters prepared:", {
            recipientEmail: receiverUser.email,
            recipientName: receiverName,
            proposalTitle: formData.title.trim(),
            clientName: senderName,
            clientEmail: senderUser.email || '',
            projectBudget: Number.parseFloat(formData.price),
            timeEstimate: formData.timeEstimate.trim(),
            hasDescription: !!formData.description.trim()
          })

          console.log("15. Calling sendProposalReceivedEmail...")
          const emailResult = await sendProposalReceivedEmail({
            recipientEmail: receiverUser.email,
            recipientName: receiverName,
            proposalTitle: formData.title.trim(),
            clientName: senderName,
            clientEmail: senderUser.email || '',
            projectBudget: Number.parseFloat(formData.price),
            timeEstimate: formData.timeEstimate.trim(),
            projectDescription: formData.description.trim()
          })
          
          console.log("16. Email sent successfully:", emailResult)
        } catch (emailError) {
          console.error("EMAIL ERROR CAUGHT:", emailError)
          console.error("Email error details:", {
            name: emailError instanceof Error ? emailError.name : 'Unknown',
            message: emailError instanceof Error ? emailError.message : emailError,
            stack: emailError instanceof Error ? emailError.stack : 'No stack trace'
          })
          // Don't fail the whole operation if email fails
        }
      } else {
        console.log("13. Skipping email notification:")
        if (isFreelancer) {
          console.log("    - Reason: Commercial forms don't trigger emails")
        } else if (!receiverUser?.email) {
          console.log("    - Reason: Receiver has no email address")
        } else if (!senderUser) {
          console.log("    - Reason: Sender data not found")
        }
      }

      console.log("17. Form submission completed successfully")
      console.log("=== OFFER FORM SUBMIT DEBUG END ===")

      toast({
        title: "Form Sent",
        description: `Your ${formType} form has been sent successfully`,
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        price: "",
        timeEstimate: "",
      })

      setOpen(false)
      onFormSent?.()
      
    } catch (error) {
      console.error("=== FORM SUBMIT ERROR ===")
      console.error("Error caught in main try-catch:", error)
      console.error("Error details:", {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : 'No stack trace'
      })
      console.log("=== FORM SUBMIT ERROR END ===")
      
      toast({
        title: "Error",
        description: "Failed to send form. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const FormIcon = formIcon

  const defaultTrigger = (
    <Button variant="outline" className="gap-2">
      <FormIcon className="h-4 w-4" />
      Send {isFreelancer ? 'Commercial Form' : 'Project Form'}
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FormIcon className="h-5 w-5" />
            {formTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              {isFreelancer ? 'Service Title' : 'Project Title'}
            </Label>
            <Input
              id="title"
              placeholder={isFreelancer ? "e.g., Logo Design Package" : "e.g., Logo Design for Tech Startup"}
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">
                {isFreelancer ? 'Total Price (DZD)' : 'Budget (DZD)'}
              </Label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="10000"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  className="pr-12"
                  disabled={loading}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                  DZD
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeEstimate">
                {isFreelancer ? 'Delivery Time' : 'Time Estimate'}
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="timeEstimate"
                  placeholder="e.g., 3 days, 1 week"
                  value={formData.timeEstimate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, timeEstimate: e.target.value }))}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              {isFreelancer ? 'Service Description' : 'Project Description'}
            </Label>
            <Textarea
              id="description"
              placeholder={isFreelancer 
                ? "Describe what's included in this service package..." 
                : "Describe the project requirements, deliverables, and any specific details..."}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="bg-[#00D37F] hover:bg-[#00c070]">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Form
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}