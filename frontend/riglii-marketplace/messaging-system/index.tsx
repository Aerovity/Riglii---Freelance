"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { startConversation } from "@/utils/message-utils"
import { useToast } from "@/hooks/use-toast"
import type { MessagingSystemProps } from "./types"
import { useConversations } from "./hooks/useConversations"
import { useMessages } from "./hooks/useMessages"
import { useRealtimeUpdates } from "./hooks/useRealtimeUpdates"
import { useUserSearch } from "./hooks/useUserSearch"
import ConversationsList from "./components/ConversationsList"
import MessagesArea from "./components/MessagesArea"
import NewMessageDialog from "./components/Dialogs/NewMessageDialog"

export default function MessagingSystem({ user }: MessagingSystemProps) {
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [isCurrentUserFreelancer, setIsCurrentUserFreelancer] = useState<boolean | null>(null)

  const supabase = createClient()
  const { toast } = useToast()

  // Hooks
  const { conversations, loading: conversationsLoading, refetch: refetchConversations } = useConversations(user.id)
  const { messages, sending, sendMessage, refetch: refetchMessages } = useMessages(activeConversation, user.id)
  const { searchResults, searching, searchUsers, fetchRecommendedUsers } = useUserSearch(user.id, isCurrentUserFreelancer)

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    checkMobileView()
    window.addEventListener('resize', checkMobileView)
    return () => window.removeEventListener('resize', checkMobileView)
  }, [])

  // Check if current user is a freelancer
  useEffect(() => {
    const checkUserType = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('is_freelancer')
          .eq('id', user.id)
          .single()
        
        if (error) {
          console.error('Error checking user type:', error)
          setIsCurrentUserFreelancer(false)
        } else {
          setIsCurrentUserFreelancer(data?.is_freelancer || false)
        }
      } catch (err) {
        console.error('Error in checkUserType:', err)
        setIsCurrentUserFreelancer(false)
      }
    }
    checkUserType()
  }, [user.id, supabase])

  // Set up real-time updates
  useRealtimeUpdates({
    userId: user.id,
    activeConversation,
    onNewMessage: (message) => {
      // This will be handled by the polling in useMessages hook
    },
    onFormUpdate: () => {
      if (activeConversation) {
        refetchMessages()
      }
    },
    onConversationUpdate: refetchConversations
  })

  const handleStartNewConversation = async (recipientId: string) => {
    try {
      const conversationId = await startConversation(recipientId)
      setActiveConversation(conversationId)
      setShowNewMessageDialog(false)
      await refetchConversations()
      await refetchMessages()
    } catch (error) {
      console.error('Error starting conversation:', error)
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      })
    }
  }

  const handleSendMessage = async (
    content: string,
    receiverId: string,
    attachmentUrl?: string | null,
    attachmentType?: string | null
  ) => {
    const result = await sendMessage(content, receiverId, attachmentUrl, attachmentType)
    if (result.success) {
      refetchConversations()
    }
    return result
  }

  const handleMobileBack = () => {
    setActiveConversation(null)
  }

  const activeConversationData = conversations.find(c => c.id === activeConversation) || null

  return (
    <div className="flex h-[calc(100vh-280px)] bg-white rounded-2xl overflow-hidden shadow-sm">
      <ConversationsList
        conversations={conversations}
        activeConversation={activeConversation}
        currentUserId={user.id}
        loading={conversationsLoading}
        isMobileView={isMobileView}
        onConversationSelect={setActiveConversation}
        onNewMessage={() => setShowNewMessageDialog(true)}
      />

      <MessagesArea
        activeConversation={activeConversationData}
        messages={messages}
        currentUserId={user.id}
        isCurrentUserFreelancer={isCurrentUserFreelancer}
        isMobileView={isMobileView}
        sending={sending}
        onBack={handleMobileBack}
        onFormSent={refetchMessages}
        onNewMessage={() => setShowNewMessageDialog(true)}
        onSendMessage={handleSendMessage}
      />

      <NewMessageDialog
        open={showNewMessageDialog}
        onOpenChange={setShowNewMessageDialog}
        searchResults={searchResults}
        searching={searching}
        isCurrentUserFreelancer={isCurrentUserFreelancer}
        onSearch={searchUsers}
        onUserSelect={handleStartNewConversation}
        onMount={fetchRecommendedUsers}
      />
    </div>
  )
}