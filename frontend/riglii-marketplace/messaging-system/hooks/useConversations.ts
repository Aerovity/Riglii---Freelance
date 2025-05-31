import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { Conversation, PublicUser } from "../types"

export const useConversations = (userId: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()
  const usersCache = useRef(new Map<string, PublicUser>())

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch conversations with minimal data first
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          user1_id,
          user2_id,
          created_at,
          updated_at
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('updated_at', { ascending: false })

      if (convError) throw convError
      if (!convData) return

      // Get unique participant IDs that aren't cached
      const participantIds = new Set<string>()
      convData.forEach(conv => {
        const participantId = conv.user1_id === userId ? conv.user2_id : conv.user1_id
        if (!usersCache.current.has(participantId)) {
          participantIds.add(participantId)
        }
      })

      // Fetch only new participant data
      if (participantIds.size > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select(`
            id,
            email,
            is_freelancer,
            freelancer_profiles (
              display_name,
              first_name,
              last_name,
              profile_picture_url
            )
          `)
          .in('id', Array.from(participantIds))

        if (!usersError && usersData) {
          // Update cache
          usersData.forEach(user => {
            const profile = user.freelancer_profiles?.[0]
            const fullName = profile?.display_name || 
                           `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
                           user.email?.split('@')[0] || 
                           'Unknown User'

            const participant: PublicUser = {
              id: user.id,
              email: user.email || '',
              full_name: fullName,
              avatar_url: profile?.profile_picture_url,
              is_freelancer: user.is_freelancer || false
            }
            
            usersCache.current.set(user.id, participant)
          })
        }
      }

      // Fetch messages separately for better performance
      const conversationIds = convData.map(c => c.id)
      const { data: messagesData } = await supabase
        .from('messages')
        .select('id, content, created_at, sender_id, receiver_id, is_read, conversation_id, message_type')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false })

      // Group messages by conversation
      const messagesByConversation = new Map<string, any[]>()
      messagesData?.forEach(msg => {
        if (!messagesByConversation.has(msg.conversation_id)) {
          messagesByConversation.set(msg.conversation_id, [])
        }
        messagesByConversation.get(msg.conversation_id)!.push(msg)
      })

      // Transform conversations
      const processedConversations: Conversation[] = convData.map(conv => {
        const participantId = conv.user1_id === userId ? conv.user2_id : conv.user1_id
        const participant = usersCache.current.get(participantId) || {
          id: participantId,
          email: '',
          full_name: 'Unknown User',
          avatar_url: undefined,
          is_freelancer: false
        }

        const messages = messagesByConversation.get(conv.id) || []
        const lastMessage = messages[0] || null
        const unreadCount = messages.filter(
          msg => msg.sender_id !== userId && !msg.is_read
        ).length

        return {
          id: conv.id,
          user1_id: conv.user1_id,
          user2_id: conv.user2_id,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          participant,
          participants: [participant],
          lastMessage,
          last_message: lastMessage,
          unreadCount,
          unread_count: unreadCount
        }
      })

      setConversations(processedConversations)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [userId, supabase, toast])

  // Optimized update for single conversation
  const updateConversation = useCallback(async (conversationId: string) => {
    try {
      // Fetch only the updated conversation's messages
      const { data: messages } = await supabase
        .from('messages')
        .select('id, content, created_at, sender_id, receiver_id, is_read, conversation_id, message_type')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (messages && messages.length > 0) {
        setConversations(prev => {
          return prev.map(conv => {
            if (conv.id === conversationId) {
              // Ensure lastMessage has conversation_id
              const lastMessage = {
                ...messages[0],
                conversation_id: conversationId
              }
              return {
                ...conv,
                lastMessage,
                last_message: lastMessage,
                updated_at: lastMessage.created_at
              }
            }
            return conv
          }).sort((a, b) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )
        })
      }
    } catch (error) {
      console.error('Error updating conversation:', error)
    }
  }, [supabase])

  useEffect(() => {
    if (userId) {
      fetchConversations()
    }
  }, [userId, fetchConversations])

  return {
    conversations,
    loading,
    refetch: fetchConversations,
    updateConversation
  }
}