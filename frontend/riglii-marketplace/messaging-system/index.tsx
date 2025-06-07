"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { MessagingSystemProps } from "./types"
import { useConversations } from "./hooks/useConversations"
import { useMessages } from "./hooks/useMessages"
import { useRealtimeUpdates } from "./hooks/useRealtimeUpdates"
import { useUserSearch } from "./hooks/useUserSearch"
import ConversationsList from "./components/ConversationsList"
import MessagesArea from "./components/MessagesArea"
import NewMessageDialog from "./components/Dialogs/NewMessageDialog"

export default function MessagingSystem({ user: propUser }: MessagingSystemProps) {
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [isCurrentUserFreelancer, setIsCurrentUserFreelancer] = useState<boolean | null>(null)
  const [allMessages, setAllMessages] = useState<any[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()

  // First, ensure user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          console.error('No session found:', sessionError)
          toast({
            title: "Authentication Required",
            description: "Please log in to access messages",
            variant: "destructive",
          })
          router.push('/login') // Adjust to your login route
          return
        }

        console.log('Session found:', session.user.id)

        // Verify the user exists in the database
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (userError || !userData) {
          console.error('User not found in database:', userError)
          
          // If user doesn't exist in users table, create them
          if (userError?.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: session.user.id,
                email: session.user.email || '',
                is_freelancer: false // Default value
              })

            if (insertError) {
              console.error('Failed to create user:', insertError)
              return
            }
            
            // Fetch the newly created user
            const { data: newUser } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
              
            if (newUser) {
              setCurrentUser(newUser)
              setIsCurrentUserFreelancer(newUser.is_freelancer)
              setIsAuthenticated(true)
            }
          }
          return
        }

        setCurrentUser(userData)
        setIsCurrentUserFreelancer(userData.is_freelancer)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        toast({
          title: "Error",
          description: "Failed to verify authentication",
          variant: "destructive",
        })
      }
    }

    checkAuth()
  }, [supabase, toast, router])

  // Hooks - only use when authenticated
  const { conversations, loading: conversationsLoading, refetch: refetchConversations } = useConversations(
    isAuthenticated ? (currentUser?.id || propUser.id) : ''
  )
  const { messages, sending, sendMessage, refetch: refetchMessages } = useMessages(
    activeConversation, 
    isAuthenticated ? (currentUser?.id || propUser.id) : ''
  )
  const { searchResults, searching, searchUsers, fetchRecommendedUsers } = useUserSearch(
    isAuthenticated ? (currentUser?.id || propUser.id) : '', 
    isCurrentUserFreelancer
  )

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    checkMobileView()
    window.addEventListener('resize', checkMobileView)
    return () => window.removeEventListener('resize', checkMobileView)
  }, [])

  // Fetch all messages for form status checking
  useEffect(() => {
    if (!isAuthenticated || conversations.length === 0) return

    const fetchAllMessages = async () => {
      const conversationIds = conversations.map(c => c.id)
      
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
  }, [conversations, supabase, isAuthenticated])

  // Set up real-time updates
  useRealtimeUpdates({
    userId: currentUser?.id || propUser.id,
    activeConversation,
    onNewMessage: (message) => {
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
      const existingConversation = conversations.find(c => 
        c.participant.id === recipientId
      )
      
      if (existingConversation) {
        setActiveConversation(existingConversation.id)
        setShowNewMessageDialog(false)
        return
      }

      // Create new conversation with proper user IDs
      const userId = currentUser?.id || propUser.id
      const [orderedUser1, orderedUser2] = [userId, recipientId].sort()
      
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          user1_id: orderedUser1,
          user2_id: orderedUser2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating conversation:', error)
        throw error
      }
      
      setShowNewMessageDialog(false)
      await refetchConversations()
      
      setTimeout(() => {
        setActiveConversation(newConv.id)
      }, 100)
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

  // Show loading while authenticating
  if (!isAuthenticated) {
    return (
      <div className="flex h-[calc(100vh-280px)] bg-white rounded-2xl overflow-hidden shadow-sm items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    )
  }

  const activeConversationData = conversations.find(c => c.id === activeConversation) || null

  return (
    <div className="flex h-[calc(100vh-280px)] bg-white rounded-2xl overflow-hidden shadow-sm">
      <ConversationsList
        conversations={conversations}
        activeConversation={activeConversation}
        currentUserId={currentUser?.id || propUser.id}
        loading={conversationsLoading}
        isMobileView={isMobileView}
        onConversationSelect={setActiveConversation}
        onNewMessage={() => setShowNewMessageDialog(true)}
        messages={allMessages}
      />

      <MessagesArea
        activeConversation={activeConversationData}
        messages={messages}
        currentUserId={currentUser?.id || propUser.id}
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