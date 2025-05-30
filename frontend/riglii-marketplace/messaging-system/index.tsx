"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
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
  const [allMessages, setAllMessages] = useState<any[]>([]) // Store all messages for status checking

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

  // Fetch all messages for form status checking
  useEffect(() => {
    const fetchAllMessages = async () => {
      const conversationIds = conversations.map(c => c.id)
      if (conversationIds.length === 0) return

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          form:forms(*),
          sender:users!messages_sender_id_fkey(*)
        `)
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setAllMessages(data)
      }
    }

    fetchAllMessages()
  }, [conversations, supabase])

  // Set up real-time updates
  useRealtimeUpdates({
    userId: user.id,
    activeConversation,
    onNewMessage: (message) => {
      // Refetch messages to get the latest
      if (activeConversation) {
        refetchMessages()
      }
    },
    onFormUpdate: () => {
      if (activeConversation) {
        refetchMessages()
      }
      refetchConversations()
    },
    onConversationUpdate: refetchConversations
  })

  const handleStartNewConversation = async (recipientId: string) => {
    try {
      // The NewMessageDialog now handles form creation for clients
      // Just select the conversation
      const existingConversation = conversations.find(c => 
        c.participant.id === recipientId
      )
      
      if (existingConversation) {
        setActiveConversation(existingConversation.id)
      }
      
      setShowNewMessageDialog(false)
      await refetchConversations()
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
    if (result && result.success) {
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
        messages={allMessages}
      />

      <MessagesArea
        activeConversation={activeConversationData}
        messages={messages}
        currentUserId={user.id}
        isCurrentUserFreelancer={isCurrentUserFreelancer}
        isMobileView={isMobileView}
        sending={sending}
        onBack={handleMobileBack}
        onFormSent={() => {
          refetchMessages()
          refetchConversations()
        }}
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