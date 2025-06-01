import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, Send, Loader2 } from "lucide-react"

interface ReviewFormProps {
  freelancerId: string
  clientId: string
  formId: string
  projectTitle: string
  freelancerName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmitted?: () => void
}

export default function ReviewForm({
  freelancerId,
  clientId,
  formId,
  projectTitle,
  freelancerName,
  open,
  onOpenChange,
  onSubmitted
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()
  const { toast } = useToast()

  // Replace the handleSubmit function in ReviewForm.tsx

const handleSubmit = async () => {
  if (rating === 0) {
    toast({
      title: "Rating Required",
      description: "Please select a rating before submitting.",
      variant: "destructive",
    })
    return
  }

  setLoading(true)
  try {
    // First, verify the form is eligible for review
    const { data: formData, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .single()

    if (formError) {
      console.error('Error fetching form:', formError)
      throw new Error('Could not verify form eligibility')
    }

    if (!formData) {
      throw new Error('Form not found')
    }

    // Check if the form meets review criteria
    if (formData.status !== 'accepted') {
      throw new Error('Form must be accepted before review')
    }

    if (!formData.project_submitted) {
      throw new Error('Project must be submitted before review')
    }

    // Verify the current user is the client (receiver)
    if (formData.receiver_id !== clientId) {
      throw new Error('You are not authorized to review this project')
    }

    console.log('Form verification passed:', {
      formId: formData.id,
      status: formData.status,
      project_submitted: formData.project_submitted,
      receiver_id: formData.receiver_id,
      client_id: clientId
    });

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("form_id", formId)
      .eq("client_id", clientId)
      .maybeSingle()

    if (existingReview) {
      // Update existing review
      const { error } = await supabase
        .from("reviews")
        .update({
          rating,
          comment: comment.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingReview.id)

      if (error) {
        console.error('Error updating review:', error)
        throw error
      }

      toast({
        title: "Review Updated",
        description: "Your review has been updated successfully.",
      })
    } else {
      // Create new review
      const reviewData = {
        freelancer_id: freelancerId,
        client_id: clientId,
        form_id: formId,
        rating,
        comment: comment.trim() || null
      }

      console.log('Creating review with data:', reviewData);

      const { error } = await supabase
        .from("reviews")
        .insert(reviewData)

      if (error) {
        console.error('Error creating review:', error)
        throw error
      }

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      })
    }

    // Reset form
    setRating(0)
    setComment("")
    
    // Close dialog and trigger callback
    onOpenChange(false)
    onSubmitted?.()
    
  } catch (error: any) {
    console.error("Error submitting review:", error)
    toast({
      title: "Submission Failed",
      description: error.message || "Failed to submit review. Please try again.",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "Poor"
      case 2: return "Fair"
      case 3: return "Good"
      case 4: return "Very Good"
      case 5: return "Excellent"
      default: return ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
          <DialogDescription>
            How was your experience working with {freelancerName} on "{projectTitle}"?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating Stars */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none focus:scale-110"
                  disabled={loading}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      value <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {(hoveredRating || rating) > 0 && (
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {getRatingText(hoveredRating || rating)}
                </span>
              )}
            </div>
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience working with this freelancer..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              disabled={loading}
              className="resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Guidelines */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Review Guidelines:</strong> Please be honest and constructive. 
              Focus on the quality of work, communication, and professionalism.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || rating === 0} 
              className="flex-1 bg-[#00D37F] hover:bg-[#00c070] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}