import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { Conversation } from "../types"
import { fetchUserAvatar } from "../utils/storage"
import { getFullName } from "../utils/formatters"

export const useConversations = (userId: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const fetchConversations = async () => {
    try {
      setLoading(true)
      
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          user1_id,
          user2_id,
          created_at,
          messages (
            content,
            created_at,
            sender_id,
            is_read,
            message_type
          )
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (convError) throw convError

      const processedConversations = await Promise.all(
        convData.map(async (conv) => {
          const participantId = conv.user1_id === userId ? conv.user2_id : conv.user1_id
          
          // Get participant info with freelancer status
          const { data: participantData } = await supabase
            .from('users')
            .select(`
              id, 
              email,
              is_freelancer,
              freelancer_profiles (
                display_name,
                first_name,
                last_name
              )
            `)
            .eq('id', participantId)
            .single()

          const avatarUrl = await fetchUserAvatar(participantId)
          const fullName = getFullName(participantData)

          const unreadMessages = conv.messages.filter(
            (msg: any) => msg.sender_id !== userId && !msg.is_read
          )

          const sortedMessages = conv.messages.sort(
            (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          
          return {
            id: conv.id,
            participant: {
              id: participantId,
              full_name: fullName,
              email: participantData?.email || '',
              avatar_url: avatarUrl,
              is_freelancer: participantData?.is_freelancer || false,
            },
            last_message: sortedMessages[0] || null,
            unread_count: unreadMessages.length,
          }
        })
      )

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