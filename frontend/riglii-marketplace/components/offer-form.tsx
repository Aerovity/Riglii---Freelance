"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { FileText, Clock, DollarSign, Check, X, Loader2, Send, Calendar } from "lucide-react"

interface OfferFormProps {
  conversationId: string
  receiverId: string
  senderId: string
  onFormSent?: () => void
  trigger?: React.ReactNode
}

interface FormData {
  title: string
  description: string
  price: string
  timeEstimate: string
}

interface FormDisplayProps {
  form: {
    id: string
    title: string
    description: string
    price: number
    time_estimate: string
    status: "pending" | "accepted" | "refused" | "cancelled"
    sender_id: string
    receiver_id: string
    created_at: string
    responded_at?: string
  }
  currentUserId: string
  onStatusUpdate?: () => void
}

// Helper function for time formatting
const getTimeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + " years ago"
  
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + " months ago"
  
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + " days ago"
  
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + " hours ago"
  
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + " minutes ago"
  
  return "just now"
}

// Form creation component
export function OfferForm({ conversationId, receiverId, senderId, onFormSent, trigger }: OfferFormProps) {
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

    if (!formData.title.trim() || !formData.description.trim() || !formData.price || !formData.timeEstimate.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const price = Number.parseFloat(formData.price)
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price",
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
          price: price,
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

// Form display component for messages
export function FormDisplay({ form, currentUserId, onStatusUpdate }: FormDisplayProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const isReceiver = currentUserId === form.receiver_id
  const isSender = currentUserId === form.sender_id
  const canRespond = isReceiver && form.status === "pending"

  const handleStatusUpdate = async (newStatus: "accepted" | "refused") => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("forms")
        .update({
          status: newStatus,
          responded_at: new Date().toISOString(),
        })
        .eq("id", form.id)

      if (error) throw error

      toast({
        title: newStatus === "accepted" ? "Form Accepted" : "Form Declined",
        description: `You have ${newStatus} the project form`,
      })

      onStatusUpdate?.()
    } catch (error) {
      console.error("Error updating form status:", error)
      toast({
        title: "Error",
        description: "Failed to update form status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200"
      case "refused":
        return "bg-red-100 text-red-800 border-red-200"
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <Check className="h-3 w-3" />
      case "refused":
        return <X className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  return (
    <Card
      className={`max-w-md ${isSender ? "ml-auto" : "mr-auto"} border-2 ${
        form.status === "accepted"
          ? "border-green-200"
          : form.status === "refused"
            ? "border-red-200"
            : "border-[#00D37F]"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#00D37F]" />
            <CardTitle className="text-lg">{form.title}</CardTitle>
          </div>
          <Badge variant="outline" className={`${getStatusColor(form.status)} flex items-center gap-1`}>
            {getStatusIcon(form.status)}
            {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="font-semibold">${form.price.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{form.time_estimate}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Description:</p>
          <p className="text-sm text-gray-600 leading-relaxed">{form.description}</p>
        </div>

        <div className="text-xs text-gray-500 border-t pt-3">
          <p>Sent {getTimeAgo(new Date(form.created_at))}</p>
          {form.responded_at && (
            <p>Responded {getTimeAgo(new Date(form.responded_at))}</p>
          )}
        </div>

        {canRespond && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusUpdate("refused")}
              disabled={loading}
              className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => handleStatusUpdate("accepted")}
              disabled={loading}
              className="flex-1 bg-[#00D37F] hover:bg-[#00c070]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </>
              )}
            </Button>
          </div>
        )}

        {form.status !== "pending" && (
          <div
            className={`text-center py-2 px-3 rounded-md text-sm ${
              form.status === "accepted" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {form.status === "accepted" ? "✅ This form has been accepted" : "❌ This form has been declined"}
          </div>
        )}
      </CardContent>
    </Card>
  )
}