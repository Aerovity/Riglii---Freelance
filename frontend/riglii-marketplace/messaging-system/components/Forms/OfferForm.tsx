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
import { FileText, Send, Loader2, DollarSign, Clock } from "lucide-react"
import type { FormData } from "../../types"
import { validateFormData } from "../../utils/validations"

interface OfferFormProps {
  conversationId: string
  receiverId: string
  senderId: string
  onFormSent?: () => void
  trigger?: React.ReactNode
}

export default function OfferForm({
  conversationId,
  receiverId,
  senderId,
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

  const handleSubmit = async () => {
    const validation = validateFormData(formData)
    if (!validation.isValid) {
      toast({
        title: "Invalid Form",
        description: validation.error,
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("forms")
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          receiver_id: receiverId,
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: Number.parseFloat(formData.price),
          time_estimate: formData.timeEstimate.trim(),
          status: "pending",
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Form Sent",
        description: "Your project form has been sent successfully",
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
      console.error("Error sending form:", error)
      toast({
        title: "Error",
        description: "Failed to send form. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const defaultTrigger = (
    <Button variant="outline" className="gap-2">
      <FileText className="h-4 w-4" />
      Send Project Form
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Project Form
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              placeholder="e.g., Logo Design for Tech Startup"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="100.00"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeEstimate">Time Estimate</Label>
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
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the project requirements, deliverables, and any specific details..."
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