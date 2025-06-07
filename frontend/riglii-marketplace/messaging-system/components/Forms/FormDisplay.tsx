import { useState, useRef, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { CheckCircle, XCircle, Clock, FileText, Receipt, Package } from "lucide-react"
import type { Form } from "../../types"
import ProjectDeliveryDisplay from "./ProjectDeliveryDisplay"
import { sendProposalAcceptedEmail, sendCommercialAcceptedEmail } from "@/app/actions/emails"

interface FormDisplayProps {
  form: Form
  currentUserId: string
  onStatusUpdate?: () => void
}

export default function FormDisplay({ form, currentUserId, onStatusUpdate }: FormDisplayProps) {
  const [showSignature, setShowSignature] = useState(false)
  const [showRefuseDialog, setShowRefuseDialog] = useState(false)
  const [refuseReason, setRefuseReason] = useState("")
  const [updating, setUpdating] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  
  const supabase = createClient()
  const { toast } = useToast()

  const isReceiver = form.receiver_id === currentUserId
  const isSender = form.sender_id === currentUserId
  const canRespond = isReceiver && form.status === "pending"

  // Debug logging
  useEffect(() => {
    console.log("FormDisplay received form:", {
      id: form.id,
      conversation_id: form.conversation_id,
      title: form.title,
      hasConversationId: !!form.conversation_id,
      formKeys: Object.keys(form)
    })
  }, [form])

  // Fetch form_type if it's missing
  const [realFormType, setRealFormType] = useState(form.form_type)
  
  // If form_type is missing, fetch it from the database
  useEffect(() => {
    if (!form.form_type && form.id) {
      supabase
        .from('forms')
        .select('form_type')
        .eq('id', form.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            console.log('Fetched form_type:', data.form_type)
            setRealFormType(data.form_type)
          }
        })
    }
  }, [form.form_type, form.id, supabase])

  // Determine form type icon and label
  const isCommercialForm = realFormType === 'commercial'
  const FormIcon = isCommercialForm ? Receipt : FileText
  const formTypeLabel = isCommercialForm ? 'Commercial Form' : 'Project Proposal'

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} DZD`
  }

  const formatTime = (timeEstimate: string) => {
    // Handle common time formats and make them more readable
    const time = timeEstimate.toLowerCase()
    
    // If it already contains "day", "week", "month", etc., return as is
    if (time.includes('day') || time.includes('week') || time.includes('month') || time.includes('hour')) {
      return timeEstimate
    }
    
    // If it's just a number, assume days
    const numMatch = time.match(/^\d+$/)
    if (numMatch) {
      const num = parseInt(numMatch[0])
      return `${num} ${num === 1 ? 'day' : 'days'}`
    }
    
    // Return as is for any other format
    return timeEstimate
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    contextRef.current = canvasRef.current.getContext('2d')
    if (contextRef.current) {
      contextRef.current.beginPath()
      contextRef.current.moveTo(x, y)
      contextRef.current.strokeStyle = '#000'
      contextRef.current.lineWidth = 2
      setIsDrawing(true)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || !contextRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    contextRef.current.lineTo(x, y)
    contextRef.current.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    if (!canvasRef.current || !contextRef.current) return
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  const handleAccept = async () => {
    console.log("=== FORM ACCEPT DEBUG START ===")
    console.log("1. Form type:", isCommercialForm ? "Commercial" : "Proposal")
    console.log("2. Form details:", {
      formId: form.id,
      senderId: form.sender_id,
      receiverId: form.receiver_id,
      currentUserId,
      conversationId: form.conversation_id // Log this to see if it's null
    })

    if (!canvasRef.current) return
    
    // Check if canvas has any drawing
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const hasDrawing = imageData.data.some((channel, index) => {
      // Check alpha channel (every 4th value)
      return index % 4 === 3 && channel > 0
    })

    if (!hasDrawing) {
      toast({
        title: "Signature Required",
        description: "Please provide your signature before accepting.",
        variant: "destructive",
      })
      return
    }
    
    const signatureData = canvas.toDataURL()
    
    setUpdating(true)
    try {
      // If conversation_id is missing, fetch the complete form data
      let conversationId = form.conversation_id;
      
      if (!conversationId) {
        console.log("2.5. conversation_id is missing, fetching form data...")
        const { data: fullForm, error: formFetchError } = await supabase
          .from('forms')
          .select('*')
          .eq('id', form.id)
          .single()
        
        if (formFetchError) {
          console.error("Failed to fetch form data:", formFetchError)
          throw new Error("Failed to fetch form data")
        }
        
        conversationId = fullForm.conversation_id
        console.log("2.6. Fetched conversation_id:", conversationId)
        
        if (!conversationId) {
          throw new Error("Form has no conversation_id")
        }
      }

      // Get sender and receiver details for email
      console.log("3. Fetching sender data...")
      const { data: senderData, error: senderError } = await supabase
        .from('users')
        .select('email, freelancer_profiles(first_name, last_name, display_name)')
        .eq('id', form.sender_id)
        .single()

      console.log("4. Sender data result:", {
        hasData: !!senderData,
        email: senderData?.email,
        error: senderError
      })

      console.log("5. Fetching receiver data...")
      const { data: receiverData, error: receiverError } = await supabase
        .from('users')
        .select('email, freelancer_profiles(first_name, last_name, display_name)')
        .eq('id', currentUserId)
        .single()

      console.log("6. Receiver data result:", {
        hasData: !!receiverData,
        email: receiverData?.email,
        error: receiverError
      })

      // Update form status
      console.log("7. Updating form status...")
      const { error: formError } = await supabase
        .from("forms")
        .update({
          status: "accepted",
          responded_at: new Date().toISOString(),
          digital_signature: signatureData
        })
        .eq("id", form.id)

      if (formError) {
        console.error("8. Form update error:", formError)
        throw formError
      }
      console.log("8. Form updated successfully")

      // Customize message based on form type
      const acceptanceMessage = isCommercialForm 
        ? "✅ Commercial form accepted. The freelancer can now deliver the project."
        : "✅ Proposal accepted. You can now exchange messages."

      console.log("9. Inserting message with conversation_id:", conversationId)
      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId, // Use the fetched or existing conversation_id
          sender_id: currentUserId,
          receiver_id: form.sender_id,
          content: acceptanceMessage,
          message_type: "text"
        })

      if (messageError) {
        console.error("10. Message insert error:", messageError)
        throw messageError
      }
      console.log("10. Message inserted successfully")

      // Send email notification
      console.log("11. PREPARING TO SEND EMAIL")
      console.log("   - Has sender email:", !!senderData?.email)
      console.log("   - Sender email:", senderData?.email)
      console.log("   - Is commercial form:", isCommercialForm)
      
      try {
        if (senderData?.email) {
          console.log("12. Email sending conditions met, preparing data...")
          
          const senderName = senderData.freelancer_profiles?.[0]?.display_name || 
                           senderData.freelancer_profiles?.[0]?.first_name || 
                           senderData.email.split('@')[0]

          const clientName = receiverData?.freelancer_profiles?.[0]?.display_name ||
                           receiverData?.freelancer_profiles?.[0]?.first_name ||
                           receiverData?.email?.split('@')[0] || 'Client'

          console.log("13. Email parameters:", {
            recipientEmail: senderData.email,
            recipientName: senderName,
            title: form.title,
            clientName: clientName,
            price: form.price,
            timeEstimate: form.time_estimate
          })

          console.log("14. Calling email function...")
          let emailResult;
          
          if (isCommercialForm) {
            console.log("15. Sending commercial accepted email...")
            emailResult = await sendCommercialAcceptedEmail({
              recipientEmail: senderData.email,
              recipientName: senderName,
              commercialTitle: form.title,
              clientName: clientName,
              acceptedDate: new Date(),
              totalPrice: form.price,
              deliveryTime: form.time_estimate
            })
          } else {
            console.log("15. Sending proposal accepted email...")
            emailResult = await sendProposalAcceptedEmail({
              recipientEmail: senderData.email,
              recipientName: senderName,
              proposalTitle: form.title,
              clientName: clientName,
              acceptedDate: new Date(),
              projectBudget: form.price,
              timeEstimate: form.time_estimate
            })
          }
          
          console.log("16. EMAIL RESULT:", emailResult)
        } else {
          console.log("12. NO SENDER EMAIL FOUND - Skipping email")
        }
      } catch (emailError) {
        console.error("EMAIL ERROR CAUGHT:", emailError)
        console.error("Stack trace:", emailError instanceof Error ? emailError.stack : emailError)
        // Don't fail the whole operation if email fails
      }

      console.log("17. Form acceptance complete")
      console.log("=== FORM ACCEPT DEBUG END ===")

      toast({
        title: `${formTypeLabel} Accepted`,
        description: `You have accepted the ${isCommercialForm ? 'commercial form' : 'project proposal'}.`,
      })

      setShowSignature(false)
      onStatusUpdate?.()
    } catch (error) {
      console.error("FORM ACCEPT ERROR:", error)
      toast({
        title: "Error",
        description: "Failed to accept the form. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleRefuse = async () => {
    setUpdating(true)
    try {
      // Get conversation_id if missing
      let conversationId = form.conversation_id;
      
      if (!conversationId) {
        const { data: fullForm, error: formFetchError } = await supabase
          .from('forms')
          .select('conversation_id')
          .eq('id', form.id)
          .single()
        
        if (formFetchError || !fullForm?.conversation_id) {
          throw new Error("Failed to get conversation ID")
        }
        
        conversationId = fullForm.conversation_id
      }

      const { error: formError } = await supabase
        .from("forms")
        .update({
          status: "refused",
          responded_at: new Date().toISOString(),
        })
        .eq("id", form.id)

      if (formError) throw formError

      const refusalMessage = isCommercialForm
        ? `❌ Commercial form refused${refuseReason ? `: ${refuseReason}` : ""}.`
        : `❌ Proposal refused${refuseReason ? `: ${refuseReason}` : ""}.`

      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          receiver_id: form.sender_id,
          content: refusalMessage,
          message_type: "text"
        })

      if (messageError) throw messageError

      toast({
        title: `${formTypeLabel} Refused`,
        description: `You have refused the ${isCommercialForm ? 'commercial form' : 'project proposal'}.`,
      })

      setShowRefuseDialog(false)
      setRefuseReason("")
      onStatusUpdate?.()
    } catch (error) {
      console.error("Error refusing form:", error)
      toast({
        title: "Error",
        description: "Failed to refuse the form. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = () => {
    switch (form.status) {
      case "accepted":
        return (
          <Badge variant="outline" className="border-green-500 text-green-700">
            <CheckCircle className="mr-1 h-3 w-3" />
            Accepted
          </Badge>
        )
      case "refused":
        return (
          <Badge variant="outline" className="border-red-500 text-red-700">
            <XCircle className="mr-1 h-3 w-3" />
            Refused
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-700">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
    }
  }

  // Show project submission status for commercial forms
  const showProjectStatus = isCommercialForm && form.status === 'accepted'

  return (
    <>
      <Card className="max-w-lg mx-auto my-4">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FormIcon className="h-5 w-5 text-gray-500" />
                {form.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formTypeLabel}
              </p>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{form.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {isCommercialForm ? 'Total Price' : 'Budget'}
              </p>
              <p className="font-semibold text-lg">
                {formatPrice(form.price)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {isCommercialForm ? 'Delivery Time' : 'Timeline'}
              </p>
              <p className="font-semibold">
                {formatTime(form.time_estimate)}
              </p>
            </div>
          </div>

          {form.responded_at && (
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground">
                {form.status === "accepted" ? "Accepted" : "Refused"} on{" "}
                {new Date(form.responded_at).toLocaleDateString()}
              </p>
            </div>
          )}

          {showProjectStatus && (
            <div className="pt-3 border-t">
              {form.project_submitted ? (
                <div className="text-green-600">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Project delivered on {new Date(form.project_submitted_at!).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="text-yellow-600">
                  <p className="text-sm">⏳ Awaiting project delivery</p>
                </div>
              )}
            </div>
          )}

          {/* Show buttons for receiver when pending */}
          {form.status === "pending" && (
            <div className="pt-4 border-t">
              {isReceiver && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowSignature(true)}
                    disabled={updating}
                    className="flex-1"
                    style={{ backgroundColor: '#16a34a', color: 'white' }}
                    type="button"
                  >
                    Accept & Sign
                  </Button>
                  <Button
                    onClick={() => setShowRefuseDialog(true)}
                    disabled={updating}
                    variant="destructive"
                    className="flex-1"
                    type="button"
                  >
                    Refuse
                  </Button>
                </div>
              )}
              {isSender && (
                <div className="text-center mt-3">
                  <p className="text-sm text-yellow-600">
                    ⏳ Waiting for response from {isCommercialForm ? 'client' : 'freelancer'}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Show project delivery details if project is submitted */}
      {form.project_submitted && (
        <ProjectDeliveryDisplay form={form} currentUserId={currentUserId} />
      )}

      {/* Digital Signature Dialog */}
      <Dialog open={showSignature} onOpenChange={setShowSignature}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Digital Signature Required</DialogTitle>
            <DialogDescription>
              Please sign below to accept this {isCommercialForm ? 'commercial form' : 'project proposal'}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={400}
                height={200}
                className="w-full cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{ touchAction: 'none' }}
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={clearSignature}
                disabled={updating}
              >
                Clear
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSignature(false)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAccept}
                disabled={updating}
                className="flex-1"
                style={{ backgroundColor: '#16a34a', color: 'white' }}
                type="button"
              >
                {updating ? "Accepting..." : "Accept & Submit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Refuse Dialog */}
      <Dialog open={showRefuseDialog} onOpenChange={setShowRefuseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Refuse {formTypeLabel}</DialogTitle>
            <DialogDescription>
              Please provide a reason for refusing (optional).
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              value={refuseReason}
              onChange={(e) => setRefuseReason(e.target.value)}
              placeholder="Enter reason for refusing..."
              rows={4}
            />
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowRefuseDialog(false)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRefuse}
                disabled={updating}
                variant="destructive"
                className="flex-1"
              >
                {updating ? "Refusing..." : `Refuse ${formTypeLabel}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}