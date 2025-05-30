import { useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import type { Message } from "../types"

interface UseRealtimeUpdatesProps {
  userId: string
  activeConversation: string | null
  onNewMessage: (message: Message) => void
  onFormUpdate: () => void
  onConversationUpdate: () => void
}

export const useRealtimeUpdates = ({
  userId,
  activeConversation,
  onNewMessage,
  onFormUpdate,
  onConversationUpdate
}: UseRealtimeUpdatesProps) => {
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          if (activeConversation === newMsg.conversation_id) {
            onNewMessage(newMsg)
            // Mark as read
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMsg.id)
              .then(() => {})
          }
          onConversationUpdate()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forms',
        },
        () => {
          onFormUpdate()
          onConversationUpdate()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, activeConversation, onNewMessage, onFormUpdate, onConversationUpdate])
}