import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { Conversation, PublicUser } from "../types"

export const useConversations = (userId: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const fetchConversations = async () => {
    try {
      setLoading(true)
      
      // First, get all conversations
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          user1_id,
          user2_id,
          created_at,
          updated_at,
          messages (
            id,
            content,
            created_at,
            sender_id,
            receiver_id,
            is_read,
            message_type,
            form:forms(*)
          )
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('updated_at', { ascending: false })

      if (convError) throw convError

      // Get all unique participant IDs
      const participantIds = new Set<string>()
      convData.forEach(conv => {
        const participantId = conv.user1_id === userId ? conv.user2_id : conv.user1_id
        participantIds.add(participantId)
      })

      // Fetch all participant data at once
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

      if (usersError) throw usersError

      // Create a map for quick lookup
      const usersMap = new Map()
      usersData.forEach(user => {
        usersMap.set(user.id, user)
      })

      // Transform conversations
      const processedConversations: Conversation[] = convData.map(conv => {
        const participantId = conv.user1_id === userId ? conv.user2_id : conv.user1_id
        const participantData = usersMap.get(participantId)

        // Get full name
        let fullName = 'Unknown User'
        if (participantData) {
          const profile = participantData.freelancer_profiles?.[0]
          if (profile) {
            fullName = profile.display_name || 
                      `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
                      participantData.email?.split('@')[0] || 
                      'Unknown User'
          } else {
            fullName = participantData.email?.split('@')[0] || 'Unknown User'
          }
        }

        // Create participant object
        const participant: PublicUser = {
          id: participantId,
          email: participantData?.email || '',
          full_name: fullName,
          avatar_url: participantData?.freelancer_profiles?.[0]?.profile_picture_url,
          is_freelancer: participantData?.is_freelancer || false
        }

        // Get last message
        const sortedMessages = conv.messages?.sort(
          (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ) || []
        
        const lastMessage = sortedMessages[0] || null

        // Count unread messages
        const unreadCount = conv.messages?.filter(
          (msg: any) => msg.sender_id !== userId && !msg.is_read
        ).length || 0

        return {
          id: conv.id,
          user1_id: conv.user1_id,
          user2_id: conv.user2_id,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          participant,
          participants: [participant], // For compatibility
          lastMessage,
          last_message: lastMessage, // Support both formats
          unreadCount,
          unread_count: unreadCount // Support both formats
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
  }

  useEffect(() => {
    fetchConversations()
  }, [userId])

  return {
    conversations,
    loading,
    refetch: fetchConversations
  }
}