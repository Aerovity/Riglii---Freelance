import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Check,
  X,
  Clock,
  DollarSign,
  Calendar,
  ChevronRight,
  Loader2,
} from "lucide-react"
import type { Form } from "../../types"
import { getTimeAgo, formatPrice } from "../../utils/formatters"
import { COLORS } from "../../constants"

interface FormDisplayProps {
  form: Form
  currentUserId: string
  onStatusUpdate?: () => void
}

export default function FormDisplay({ form, currentUserId, onStatusUpdate }: FormDisplayProps) {
  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
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

      setShowDetails(false)
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
        return `${COLORS.success.bg} ${COLORS.success.text} ${COLORS.success.border}`
      case "refused":
        return `${COLORS.error.bg} ${COLORS.error.text} ${COLORS.error.border}`
      case "cancelled":
        return `${COLORS.neutral.bg} ${COLORS.neutral.text} ${COLORS.neutral.border}`
      default:
        return `${COLORS.warning.bg} ${COLORS.warning.text} ${COLORS.warning.border}`
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

  const CompactView = () => (
    <div className="flex justify-center my-4">
      <Card
        className={`w-full max-w-sm cursor-pointer transition-all hover:shadow-lg border-2 ${
          form.status === "accepted"
            ? "border-green-200 hover:border-green-300"
            : form.status === "refused"
              ? "border-red-200 hover:border-red-300"
              : "border-[#00D37F] hover:border-[#00c070]"
        }`}
        onClick={() => setShowDetails(true)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                form.status === "accepted" ? "bg-green-100" : 
                form.status === "refused" ? "bg-red-100" : "bg-[#00D37F]/10"
              }`}>
                <FileText className={`h-5 w-5 ${
                  form.status === "accepted" ? "text-green-600" : 
                  form.status === "refused" ? "text-red-600" : "text-[#00D37F]"
                }`} />
              </div>
              <div>
                <h4 className="font-semibold text-sm line-clamp-1">{form.title}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatPrice(form.price)}</span>
                  <span>•</span>
                  <span>{form.time_estimate}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${getStatusColor(form.status)} text-xs`}>
                {getStatusIcon(form.status)}
                <span className="ml-1">{form.status}</span>
              </Badge>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const DetailedView = () => (
    <Dialog open={showDetails} onOpenChange={setShowDetails}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#00D37F]" />
            Project Form Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{form.title}</h3>
            <Badge variant="outline" className={`${getStatusColor(form.status)} flex items-center gap-1`}>
              {getStatusIcon(form.status)}
              {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Price</p>
                <span className="font-semibold">{formatPrice(form.price)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Time Estimate</p>
                <span className="font-semibold">{form.time_estimate}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Description</p>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 leading-relaxed">{form.description}</p>
            </div>
          </div>

          <div className="text-xs text-gray-500 border-t pt-3">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Sent {getTimeAgo(new Date(form.created_at))}</span>
            </div>
            {form.responded_at && (
              <div className="flex items-center gap-2 mt-1">
                <Check className="h-3 w-3" />
                <span>Responded {getTimeAgo(new Date(form.responded_at))}</span>
              </div>
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
              className={`text-center py-3 px-4 rounded-md text-sm font-medium ${
                form.status === "accepted" 
                  ? "bg-green-50 text-green-700 border border-green-200" 
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {form.status === "accepted" 
                ? "✅ This form has been accepted" 
                : "❌ This form has been declined"}
            </div>
          )}

          {!canRespond && form.status === "pending" && isSender && (
            <div className="text-center py-3 px-4 rounded-md text-sm bg-yellow-50 text-yellow-700 border border-yellow-200">
              ⏳ Waiting for response
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <>
      <CompactView />
      <DetailedView />
    </>
  )
}