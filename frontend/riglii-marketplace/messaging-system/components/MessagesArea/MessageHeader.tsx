"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MoreVertical, Phone, Video, Trash2, User, MessageSquare } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

interface Conversation {
  id: string
  participant: {
    id: string
    full_name: string
    avatar_url?: string
    is_freelancer: boolean
  }
}

interface MessageHeaderProps {
  conversation: Conversation
  currentUserId: string
  isCurrentUserFreelancer: boolean | null
  isMobileView: boolean
  onBack: () => void
  onFormSent: () => void
  onConversationRemoved?: () => void
}

const getUserInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function MessageHeader({
  conversation,
  currentUserId,
  isCurrentUserFreelancer,
  isMobileView,
  onBack,
  onFormSent,
  onConversationRemoved,
}: MessageHeaderProps) {
  const router = useRouter()
  const [isRemoving, setIsRemoving] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const supabase = createClient()

  const handleProfileClick = () => {
    if (conversation.participant.is_freelancer) {
      router.push(`/freelancer/${conversation.participant.id}`)
    }
  }

  const handleRemoveConversation = async () => {
    setIsRemoving(true)

    try {
      // Delete the conversation directly - simpler approach
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversation.id)

      if (error) {
        throw error
      }

      toast.success("Conversation removed successfully")

      if (onConversationRemoved) {
        onConversationRemoved()
      } else {
        router.push("/messages")
      }
    } catch (error) {
      console.error("Error removing conversation:", error)
      toast.error("Failed to remove conversation")
    } finally {
      setIsRemoving(false)
      setShowRemoveDialog(false)
    }
  }

  return (
    <>
      <div className="relative">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-purple-50" />

        {/* Main header content */}
        <div className="relative px-4 py-4 border-b border-gray-200/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            {/* Left section - Back button and user info */}
            <div className="flex items-center gap-3">
              {isMobileView && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onBack}
                  className="mr-1 h-9 w-9 rounded-full hover:bg-white/80 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}

              {/* User avatar and info */}
              <div
                className={`flex items-center gap-3 ${
                  conversation.participant.is_freelancer
                    ? "cursor-pointer hover:bg-white/50 rounded-lg p-2 -m-2 transition-colors"
                    : ""
                }`}
                onClick={handleProfileClick}
              >
                <div className="relative">
                  <Avatar className="h-11 w-11 ring-2 ring-white shadow-sm">
                    {conversation.participant.avatar_url && (
                      <AvatarImage src={conversation.participant.avatar_url || "/placeholder.svg"} />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                      {getUserInitials(conversation.participant.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full" />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-base">{conversation.participant.full_name}</h3>
                    {conversation.participant.is_freelancer && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100">
                        Freelancer
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-green-600 font-medium">Active now</p>
                </div>
              </div>
            </div>

            {/* Right section - Action buttons */}
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-full hover:bg-white/80 transition-colors group"
              >
                <Phone className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-full hover:bg-white/80 transition-colors group"
              >
                <Video className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 rounded-full hover:bg-white/80 transition-colors group"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-600 group-hover:text-gray-900 transition-colors" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {conversation.participant.is_freelancer && (
                    <>
                      <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem className="cursor-pointer">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Clear Chat
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowRemoveDialog(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Conversation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Remove conversation dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent className="p-6 max-w-md">
          <div className="flex items-start gap-2 mb-4">
            <Trash2 className="h-5 w-5 text-red-600 mt-0.5" />
            <AlertDialogTitle className="m-0 text-lg font-medium">Remove Conversation</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-700 mb-6">
            Are you sure you want to remove this conversation with {conversation.participant.full_name}? This will
            permanently delete all messages and cannot be undone.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel disabled={isRemoving} className="bg-white border border-gray-200 hover:bg-gray-50">
              Cancel
            </AlertDialogCancel>
            <button
              onClick={handleRemoveConversation}
              disabled={isRemoving}
              className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {isRemoving ? "Removing..." : "Remove"}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}