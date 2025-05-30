import { useState, useEffect, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { Message } from "../types"
import { POLLING_INTERVAL } from "../constants"

export const useMessages = (conversationId: string | null, userId: string) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [sending, setSending] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  const fetchMessages = async (silent: boolean = false) => {
    if (!conversationId) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          form:forms!form_id (
            id,
            title,
            description,
            price,
            time_estimate,
            status,
            sender_id,
            receiver_id,
            created_at,
            responded_at
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      
      // Process messages to include sender info
      const processedMessages = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: senderData } = await supabase
            .from('users')
            .select(`
              email,
              freelancer_profiles (
                display_name,
                first_name,
                last_name
              )
            `)
            .eq('id', msg.sender_id)
            .single()

          // Try to get avatar from auth metadata
          const { data: { user: authUser } } = await supabase.auth.getUser()
          let avatarUrl = null
          
          if (msg.sender_id === userId) {
            avatarUrl = authUser?.user_metadata?.avatar_url || null
          }
          
          const senderName = senderData?.freelancer_profiles?.[0]?.display_name ||
                           `${senderData?.freelancer_profiles?.[0]?.first_name || ''} ${senderData?.freelancer_profiles?.[0]?.last_name || ''}`.trim() ||
                           (msg.sender_id === userId ? authUser?.user_metadata?.full_name : null) ||
                           senderData?.email?.split('@')[0] || 
                           'Unknown'

          return {
            ...msg,
            sender: {
              full_name: senderName,
              avatar_url: avatarUrl
            }
          }
        })
      )

      setMessages(processedMessages)
      
      // Mark messages as read
      const unreadMessageIds = data
        ?.filter(msg => msg.receiver_id === userId && !msg.is_read)
        .map(msg => msg.id) || []
      
      if (unreadMessageIds.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadMessageIds)
      }
    } catch (error) {
      if (!silent) {
        console.error('Error fetching messages:', error)
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        })
      }
    }
  }

  const sendMessage = async (
    content: string,
    receiverId: string,
    attachmentUrl?: string | null,
    attachmentType?: string | null
  ) => {
    if (!conversationId) return

    setSending(true)
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: content || (attachmentUrl ? `Sent ${attachmentType === 'image' ? 'an image' : 'a file'}` : ''),
          sender_id: userId,
          receiver_id: receiverId,
          conversation_id: conversationId,
          attachment_url: attachmentUrl,
          attachment_type: attachmentType,
          message_type: 'text'
        })
        .select()
        .single()

      if (error) throw error

      const { data: { user } } = await supabase.auth.getUser()
      
      setMessages((prev) => [...prev, {
        ...data,
        sender: {
          full_name: user?.user_metadata?.full_name || 'You',
          avatar_url: user?.user_metadata?.avatar_url || null,
        }
      }])
      
      return { success: true }
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
      return { success: false, error }
    } finally {
      setSending(false)
    }
  }

  // Set up polling
  useEffect(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }

    if (conversationId) {
      fetchMessages()
      
      pollingIntervalRef.current = setInterval(() => {
        fetchMessages(true)
      }, POLLING_INTERVAL)
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [conversationId])

  return {
    messages,
    sending,
    sendMessage,
    refetch: fetchMessages
  }
}