"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { formatDistanceToNow } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Mail, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/app/language-provider"

interface Message {
  id: string
  content: string
  sender_id: string
  receiver_id: string
  conversation_id: string
  is_read: boolean
  created_at: string
  sender?: {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
    is_freelancer?: boolean
  }
}

export default function MessagesDropdown() {
  const { t } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [avatarUrls, setAvatarUrls] = useState<{ [key: string]: string }>({})
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchRecentMessages()
    
    // Set up real-time subscription for new messages
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const channel = supabase
        .channel('header-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`,
          },
          () => {
            // Refresh messages when a new one arrives
            fetchRecentMessages()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    const cleanup = setupSubscription()
    
    // Refresh messages every 30 seconds
    const interval = setInterval(fetchRecentMessages, 30000)
    
    return () => {
      clearInterval(interval)
      cleanup?.then(fn => fn?.())
      // Clean up avatar URLs
      Object.values(avatarUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

  const fetchRecentMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get conversations where the user is involved
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          user1_id,
          user2_id,
          messages (
            id,
            content,
            sender_id,
            receiver_id,
            conversation_id,
            is_read,
            created_at
          )
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(10)

      if (convError) throw convError

      // Process messages and get the most recent from each conversation
      const recentMessages: Message[] = []
      const newAvatarUrls: { [key: string]: string } = {}

      for (const conv of conversations || []) {
        // Get the most recent message from this conversation
        const sortedMessages = (conv.messages || []).sort(
          (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        
        if (sortedMessages.length === 0) continue
        
        const lastMessage = sortedMessages[0]
        
        // Only include if it's not sent by the current user
        if (lastMessage.sender_id === user.id) continue

        // Get sender info
        const senderId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id
        
        const { data: senderData } = await supabase
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
          .eq('id', senderId)
          .single()

        // Try to get avatar
        if (!newAvatarUrls[senderId]) {
          try {
            const possiblePaths = [
              `${senderId}/avatar.webp`,
              `${senderId}/avatar.jpg`,
              `${senderId}/avatar.jpeg`,
              `${senderId}/avatar.png`,
              `${senderId}/avatar.gif`
            ]
            
            for (const path of possiblePaths) {
              const { data } = await supabase.storage.from('avatars').download(path)
              if (data) {
                newAvatarUrls[senderId] = URL.createObjectURL(data)
                break
              }
            }
          } catch (err) {
            // No avatar found
          }
        }

        let senderName = senderData?.email?.split('@')[0] || 'Unknown'
        
        if (senderData?.is_freelancer && senderData.freelancer_profiles?.[0]) {
          const profile = senderData.freelancer_profiles[0]
          senderName = profile.display_name || 
                       `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
                       senderName
        }

        recentMessages.push({
          ...lastMessage,
          sender: {
            id: senderId,
            full_name: senderName,
            email: senderData?.email || '',
            avatar_url: newAvatarUrls[senderId] || null,
            is_freelancer: senderData?.is_freelancer || false
          }
        })
      }

      // Sort by created_at and take only the 5 most recent
      const sortedRecentMessages = recentMessages
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      setMessages(sortedRecentMessages)
      setAvatarUrls(prev => {
        // Clean up old URLs
        Object.entries(prev).forEach(([id, url]) => {
          if (!newAvatarUrls[id] && url.startsWith('blob:')) {
            URL.revokeObjectURL(url)
          }
        })
        return newAvatarUrls
      })
      
      // Count unread messages
      const unread = sortedRecentMessages.filter(msg => !msg.is_read).length
      setUnreadCount(unread)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const unreadMessageIds = messages
        .filter(msg => !msg.is_read)
        .map(msg => msg.id)

      if (unreadMessageIds.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadMessageIds)
          .eq('receiver_id', user.id)

        // Update local state
        setMessages(messages.map(msg => ({ ...msg, is_read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const handleMessageClick = (conversationId: string) => {
    router.push(`/messages?conversation=${conversationId}`)
  }

  const getUserInitials = (name: string) => {
    const names = name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-[#0F2830] relative">
          <Mail className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#00D37F] text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="font-semibold">{t("messages")}</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              className="text-xs text-[#00D37F] hover:text-[#00B86A]"
              onClick={markAllAsRead}
            >
              {t("markAllRead")}
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Mail className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">{t("noMessages")}</p>
            </div>
          ) : (
            messages.map((message) => (
              <DropdownMenuItem
                key={message.id}
                className={`flex items-start p-4 cursor-pointer hover:bg-gray-50 ${
                  !message.is_read ? "bg-[#AFF8C8]/10" : ""
                }`}
                onClick={() => handleMessageClick(message.conversation_id)}
              >
                <Avatar className="h-10 w-10 mr-3">
                  {message.sender?.avatar_url && (
                    <AvatarImage src={message.sender.avatar_url || "/placeholder.svg"} />
                  )}
                  <AvatarFallback className="bg-[#AFF8C8] text-[#014751] text-sm">
                    {getUserInitials(message.sender?.full_name || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {message.sender?.full_name}
                      </span>
                      {message.sender?.is_freelancer && (
                        <Badge variant="secondary" className="text-xs h-4">
                          {t("freelancer")}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatDistanceToNow(new Date(message.created_at), { 
                        addSuffix: false 
                      }).replace('about ', '').replace('less than a minute', 'now')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {message.content}
                  </p>
                  {!message.is_read && (
                    <div className="flex justify-end mt-1">
                      <div className="w-2 h-2 bg-[#00D37F] rounded-full"></div>
                    </div>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <div className="p-2 border-t">
          <Button 
            variant="outline" 
            className="w-full text-[#00D37F] hover:text-[#00B86A] hover:bg-[#00D37F]/5"
            onClick={() => router.push('/messages')}
          >
            {t("viewAllMessages")}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
