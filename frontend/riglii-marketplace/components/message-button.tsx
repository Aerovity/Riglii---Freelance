"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { startConversation } from "@/utils/message-utils"
import { useToast } from "@/hooks/use-toast"

interface MessageButtonProps {
  recipientId: string
  recipientName?: string
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

export default function MessageButton({ 
  recipientId, 
  recipientName = "this user",
  className,
  variant = "default",
  size = "default"
}: MessageButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleMessage = async () => {
    try {
      setLoading(true)
      const conversationId = await startConversation(recipientId)
      router.push(`/messages?conversation=${conversationId}`)
    } catch (error) {
      console.error('Error starting conversation:', error)
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleMessage}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      {loading ? "Opening..." : `Message ${recipientName}`}
    </Button>
  )
}