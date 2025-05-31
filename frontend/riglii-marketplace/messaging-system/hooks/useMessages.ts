import { useState, useEffect, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { Message } from "../types"

export const useMessages = (conversationId: string | null, userId: string) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()
  const senderCacheRef = useRef(new Map<string, any>())

  const fetchMessages = async (silent: boolean = false) => {
    if (!conversationId) return

    try {
      if (!silent) setLoading(true)
      
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
            responded_at,
            form_type,
            project_submitted,
            project_submitted_at,
            project_files,
            project_submission_url,
            project_notes
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      
      // Get unique sender IDs not in cache
      const senderIds = new Set<string>()
      data?.forEach(msg => {
        if (!senderCacheRef.current.has(msg.sender_id)) {
          senderIds.add(msg.sender_id)
        }
      })

      // Fetch sender info only for new senders
      if (senderIds.size > 0) {
        const { data: sendersData } = await supabase
          .from('users')
          .select(`
            id,
            email,
            freelancer_profiles (
              display_name,
              first_name,
              last_name,
              profile_picture_url
            )
          `)
          .in('id', Array.from(senderIds))

        sendersData?.forEach(sender => {
          const profile = sender.freelancer_profiles?.[0]
          const fullName = profile?.display_name ||
                         `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
                         sender.email?.split('@')[0] || 
                         'Unknown'
          
          senderCacheRef.current.set(sender.id, {
            full_name: fullName,
            avatar_url: profile?.profile_picture_url || null
          })
        })
      }

      // Process messages with cached sender info
      const processedMessages = (data || []).map(msg => ({
        ...msg,
        sender: senderCacheRef.current.get(msg.sender_id) || {
          full_name: msg.sender_id === userId ? 'You' : 'Unknown',
          avatar_url: null
        }
      }))

      setMessages(processedMessages)
      
      // Mark messages as read in background
      const unreadMessageIds = data
        ?.filter(msg => msg.receiver_id === userId && !msg.is_read)
        .map(msg => msg.id) || []
      
      if (unreadMessageIds.length > 0) {
        supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadMessageIds)
          .then(() => {})
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
    } finally {
      if (!silent) setLoading(false)
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
    
    // Optimistically add the message
    const tempId = `temp-${Date.now()}`
    const optimisticMessage: Message = {
      id: tempId,
      content: content || (attachmentUrl ? `Sent ${attachmentType === 'image' ? 'an image' : 'a file'}` : ''),
      sender_id: userId,
      receiver_id: receiverId,
      conversation_id: conversationId,
      created_at: new Date().toISOString(),
      attachment_url: attachmentUrl,
      attachment_type: attachmentType,
      message_type: 'text',
      is_read: false,
      sender: {
        full_name: 'You',
        avatar_url: null
      }
    }
    
    setMessages(prev => [...prev, optimisticMessage])

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: optimisticMessage.content,
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

      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...data, sender: optimisticMessage.sender } : msg
      ))
      
      return { success: true }
    } catch (error) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId))
      
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

  const addNewMessage = (message: Message) => {
    setMessages(prev => {
      // Check if message already exists
      if (prev.some(m => m.id === message.id)) {
        return prev
      }
      
      // Add sender info from cache or default
      const messageWithSender = {
        ...message,
        sender: senderCacheRef.current.get(message.sender_id) || {
          full_name: message.sender_id === userId ? 'You' : 'Unknown',
          avatar_url: null
        }
      }
      
      return [...prev, messageWithSender]
    })
  }

  const refetch = () => fetchMessages(false)

  useEffect(() => {
    if (conversationId) {
      fetchMessages()
    } else {
      setMessages([])
    }
  }, [conversationId])

  return {
    messages,
    sending,
    loading,
    sendMessage,
    refetch,
    addNewMessage
  }
}