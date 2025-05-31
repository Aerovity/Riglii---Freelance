import { useEffect, useCallback, useRef } from "react"
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
  const processedMessageIds = useRef(new Set<string>())
  const updateTimeouts = useRef(new Map<string, NodeJS.Timeout>())

  // Debounce function to prevent too many updates
  const debounce = useCallback((key: string, callback: () => void, delay: number = 300) => {
    // Clear existing timeout for this key
    const existingTimeout = updateTimeouts.current.get(key)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      callback()
      updateTimeouts.current.delete(key)
    }, delay)
    
    updateTimeouts.current.set(key, timeout)
  }, [])

  // Mark message as read without blocking
  const markMessageAsRead = useCallback(async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }, [supabase])

  useEffect(() => {
    // Clear processed messages when conversation changes
    processedMessageIds.current.clear()

    const channel = supabase
      .channel(`messages-${userId}`)
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
          
          // Prevent duplicate processing
          if (processedMessageIds.current.has(newMsg.id)) {
            return
          }
          processedMessageIds.current.add(newMsg.id)

          // Process message for active conversation
          if (activeConversation === newMsg.conversation_id) {
            // Add message immediately for smooth experience
            onNewMessage(newMsg)
            
            // Mark as read asynchronously
            markMessageAsRead(newMsg.id)
          }
          
          // Debounce conversation list update to prevent flickering
          debounce('conversation-update', () => {
            onConversationUpdate()
          }, 500)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${userId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          
          // Prevent duplicate processing
          if (processedMessageIds.current.has(newMsg.id)) {
            return
          }
          processedMessageIds.current.add(newMsg.id)

          // Process own messages for active conversation
          if (activeConversation === newMsg.conversation_id) {
            onNewMessage(newMsg)
          }
          
          // Debounce conversation list update
          debounce('conversation-update', () => {
            onConversationUpdate()
          }, 500)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forms',
        },
        (payload) => {
          // Get the form data
          const form = payload.new || payload.old
          
          // Only update if it's related to current conversation
          if (form && activeConversation) {
            // Debounce form updates to prevent rapid re-renders
            debounce('form-update', () => {
              onFormUpdate()
            }, 300)
            
            // Debounce conversation update separately
            debounce('conversation-update-form', () => {
              onConversationUpdate()
            }, 800)
          }
        }
      )
      .subscribe()

    // Cleanup function
    return () => {
      // Clear all pending timeouts
      updateTimeouts.current.forEach(timeout => clearTimeout(timeout))
      updateTimeouts.current.clear()
      
      // Remove channel
      supabase.removeChannel(channel)
    }
  }, [userId, activeConversation, onNewMessage, onFormUpdate, onConversationUpdate, debounce, markMessageAsRead, supabase])

  // Additional cleanup on unmount
  useEffect(() => {
    return () => {
      processedMessageIds.current.clear()
    }
  }, [])
}