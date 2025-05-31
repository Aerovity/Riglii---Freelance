import { useState, useRef } from "react"
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
import { CheckCircle, XCircle, Clock, DollarSign, FileText, Receipt } from "lucide-react"
import type { Form } from "../../types"

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

  // Fetch form_type if it's missing
  const [realFormType, setRealFormType] = useState(form.form_type)
  
  // If form_type is missing, fetch it from the database
  useState(() => {
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
  })

  // Determine form type icon and label
  const isCommercialForm = realFormType === 'commercial'
  const FormIcon = isCommercialForm ? Receipt : FileText
  const formTypeLabel = isCommercialForm ? 'Commercial Form' : 'Project Proposal'

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
      const { error: formError } = await supabase
        .from("forms")
        .update({
          status: "accepted",
          responded_at: new Date().toISOString(),
          digital_signature: signatureData
        })
        .eq("id", form.id)

      if (formError) throw formError

      // Customize message based on form type
      const acceptanceMessage = isCommercialForm 
        ? "✅ Commercial form accepted. The freelancer can now deliver the project."
        : "✅ Proposal accepted. You can now exchange messages."

      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: form.conversation_id,
          sender_id: currentUserId,
          receiver_id: form.sender_id,
          content: acceptanceMessage,
          message_type: "text"
        })

      if (messageError) throw messageError

      toast({
        title: `${formTypeLabel} Accepted`,
        description: `You have accepted the ${isCommercialForm ? 'commercial form' : 'project proposal'}.`,
      })

      setShowSignature(false)
      onStatusUpdate?.()
    } catch (error) {
      console.error("Error accepting form:", error)
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
          conversation_id: form.conversation_id,
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
              <p className="font-semibold flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {form.price.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {isCommercialForm ? 'Delivery Time' : 'Timeline'}
              </p>
              <p className="font-semibold">{form.time_estimate}</p>
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
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <p className="text-sm font-medium">
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