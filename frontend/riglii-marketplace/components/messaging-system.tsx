"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  X, 
  Search, 
  Circle, 
  Plus,
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  Info,
  Edit,
  Loader2,
  MessageCircle
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@supabase/supabase-js"
import { startConversation } from "@/utils/message-utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Conversation {
  id: string
  participant: {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
    is_online?: boolean
    is_freelancer?: boolean
  }
  last_message: {
    content: string
    created_at: string
    sender_id: string
  } | null
  unread_count: number
}

interface Message {
  id: string
  content: string
  sender_id: string
  receiver_id: string
  conversation_id: string
  is_read: boolean
  created_at: string
  updated_at: string
  attachment_url?: string
  attachment_type?: string
  sender?: {
    full_name: string
    avatar_url: string | null
  }
}

interface SearchResult {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  is_freelancer: boolean
  freelancer_profile?: {
    display_name: string
    occupation: string
    first_name: string
    last_name: string
  }
}

export default function ModernMessaging({ user }: { user: User }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [conversationSearchQuery, setConversationSearchQuery] = useState("")
  const [isCurrentUserFreelancer, setIsCurrentUserFreelancer] = useState<boolean | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousMessagesRef = useRef<Message[]>([])
  const previousMessageCountRef = useRef<number>(0)
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    checkMobileView()
    window.addEventListener('resize', checkMobileView)
    return () => window.removeEventListener('resize', checkMobileView)
  }, [])

  // Check if current user is a freelancer from users table
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
          console.log('Current user is_freelancer:', data?.is_freelancer)
          setIsCurrentUserFreelancer(data?.is_freelancer || false)
        }
      } catch (err) {
        console.error('Error in checkUserType:', err)
        setIsCurrentUserFreelancer(false)
      }
    }
    checkUserType()
  }, [user.id, supabase])

  // Fetch conversations
  useEffect(() => {
    fetchConversations()
    
    // Set up real-time subscription
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          if (activeConversation === newMsg.conversation_id) {
            setMessages((prev) => [...prev, newMsg])
            markAsRead(newMsg.id)
          }
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user.id, activeConversation])

  // Set up polling for active conversation
  useEffect(() => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }

    // Set up new interval if there's an active conversation
    if (activeConversation) {
      console.log('Setting up polling for conversation:', activeConversation)
      
      // Initial fetch
      fetchMessages(activeConversation)
      
      // Set up polling interval
      pollingIntervalRef.current = setInterval(() => {
        console.log('Polling messages for conversation:', activeConversation)
        fetchMessages(activeConversation, true) // true = silent fetch (no loading state)
      }, 500) // 0.5 seconds
    }

    // Cleanup on unmount or when activeConversation changes
    return () => {
      if (pollingIntervalRef.current) {
        console.log('Clearing polling interval')
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [activeConversation])

  // Fetch users when dialog opens
  useEffect(() => {
    if (showNewMessageDialog && isCurrentUserFreelancer !== null) {
      fetchRecommendedUsers()
    }
  }, [showNewMessageDialog, isCurrentUserFreelancer])

  // Scroll to bottom when messages change
  useEffect(() => {
    // Only scroll if new messages were added (not on every render)
    if (messages.length > previousMessageCountRef.current) {
      scrollToBottom()
    }
    previousMessageCountRef.current = messages.length
  }, [messages])

  // Reset search when dialog closes
  useEffect(() => {
    if (!showNewMessageDialog) {
      setSearchQuery("")
      setSearchResults([])
    }
  }, [showNewMessageDialog])

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
            is_read
          )
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (convError) throw convError

      const processedConversations = await Promise.all(
        convData.map(async (conv) => {
          const participantId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id
          
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

          // For avatar, we'll need to check if they have one in the avatars bucket
          let avatarUrl = null
          try {
            // Try to get avatar from storage
            const possiblePaths = [
              `${participantId}/avatar.webp`,
              `${participantId}/avatar.jpg`,
              `${participantId}/avatar.jpeg`,
              `${participantId}/avatar.png`,
              `${participantId}/avatar.gif`
            ]
            
            for (const path of possiblePaths) {
              const { data } = await supabase.storage.from('avatars').download(path)
              if (data) {
                avatarUrl = URL.createObjectURL(data)
                break
              }
            }
          } catch (err) {
            // No avatar found
          }
          
          const fullName = participantData?.freelancer_profiles?.[0]?.display_name || 
                          `${participantData?.freelancer_profiles?.[0]?.first_name || ''} ${participantData?.freelancer_profiles?.[0]?.last_name || ''}`.trim() ||
                          participantData?.email?.split('@')[0] || 
                          'Unknown User'

          const unreadMessages = conv.messages.filter(
            (msg: any) => msg.sender_id !== user.id && !msg.is_read
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

  const fetchMessages = async (conversationId: string, silent: boolean = false) => {
    try {
      if (!silent) {
        console.log('Fetching messages for conversation:', conversationId)
      }
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      
      // Process messages to include sender info
      const processedMessages = await Promise.all(
        (data || []).map(async (msg) => {
          // Get sender info separately
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
          
          if (msg.sender_id === user.id) {
            // Current user's avatar
            avatarUrl = authUser?.user_metadata?.avatar_url || null
          } else {
            // For other users, we might need to implement a different approach
            // since we can't access other users' auth metadata directly
            avatarUrl = null
          }
          
          const senderName = senderData?.freelancer_profiles?.[0]?.display_name ||
                           `${senderData?.freelancer_profiles?.[0]?.first_name || ''} ${senderData?.freelancer_profiles?.[0]?.last_name || ''}`.trim() ||
                           (msg.sender_id === user.id ? authUser?.user_metadata?.full_name : null) ||
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
        ?.filter(msg => msg.receiver_id === user.id && !msg.is_read)
        .map(msg => msg.id) || []
      
      if (unreadMessageIds.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadMessageIds)
        
        // Update conversations to reflect read status
        if (!silent) {
          fetchConversations()
        }
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

  const fetchRecommendedUsers = async () => {
    try {
      setSearching(true)
      console.log('Fetching recommended users, isCurrentUserFreelancer:', isCurrentUserFreelancer)
      
      // If current user is a freelancer, show clients (is_freelancer = false)
      // If current user is a client, show freelancers (is_freelancer = true)
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          is_freelancer,
          freelancer_profiles (
            display_name,
            occupation,
            first_name,
            last_name
          )
        `)
        .eq('is_freelancer', !isCurrentUserFreelancer) // Opposite of current user type
        .neq('id', user.id)
        .limit(30)
        .order('created_at', { ascending: false })

      console.log('Fetched users:', users)
      if (error) {
        console.error('Error fetching users:', error)
        throw error
      }

      // Process users
      const results = await Promise.all(
        (users || []).map(async (userData) => {
          // Try to get avatar
          let avatarUrl = null
          try {
            const possiblePaths = [
              `${userData.id}/avatar.webp`,
              `${userData.id}/avatar.jpg`,
              `${userData.id}/avatar.jpeg`,
              `${userData.id}/avatar.png`,
              `${userData.id}/avatar.gif`
            ]
            
            for (const path of possiblePaths) {
              const { data } = await supabase.storage.from('avatars').download(path)
              if (data) {
                avatarUrl = URL.createObjectURL(data)
                break
              }
            }
          } catch (err) {
            // No avatar found
          }

          let fullName = userData.email.split('@')[0]
          
          // If user is a freelancer, get their profile name
          if (userData.is_freelancer && userData.freelancer_profiles?.[0]) {
            const profile = userData.freelancer_profiles[0]
            fullName = profile.display_name || 
                      `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
                      fullName
          }

          return {
            id: userData.id,
            email: userData.email,
            full_name: fullName,
            avatar_url: avatarUrl,
            is_freelancer: userData.is_freelancer,
            freelancer_profile: userData.freelancer_profiles?.[0] || null
          }
        })
      )

      console.log('Processed results:', results)
      setSearchResults(results)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setSearching(false)
    }
  }

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      // Reset to recommended users
      fetchRecommendedUsers()
      return
    }

    try {
      setSearching(true)
      
      // Search users with the same type filter
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          is_freelancer,
          freelancer_profiles (
            display_name,
            occupation,
            first_name,
            last_name
          )
        `)
        .eq('is_freelancer', !isCurrentUserFreelancer) // Opposite of current user type
        .or(`email.ilike.%${query}%`)
        .neq('id', user.id)
        .limit(20)

      if (error) throw error

      // If searching for freelancers, also search in freelancer profiles
      let combinedResults = [...(users || [])]
      
      if (!isCurrentUserFreelancer) { // Current user is client, searching for freelancers
        const { data: freelancerProfiles } = await supabase
          .from('freelancer_profiles')
          .select(`
            user_id,
            display_name,
            occupation,
            first_name,
            last_name
          `)
          .or(`display_name.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%,occupation.ilike.%${query}%`)
          .neq('user_id', user.id)
          .limit(20)

        // Get user data for freelancer profiles that match
        if (freelancerProfiles && freelancerProfiles.length > 0) {
          const freelancerUserIds = freelancerProfiles.map(p => p.user_id)
          const { data: freelancerUsers } = await supabase
            .from('users')
            .select(`
              id,
              email,
              is_freelancer,
              freelancer_profiles (
                display_name,
                occupation,
                first_name,
                last_name
              )
            `)
            .in('id', freelancerUserIds)
            .eq('is_freelancer', true)

          if (freelancerUsers) {
            // Merge results, avoiding duplicates
            const existingIds = new Set(combinedResults.map(u => u.id))
            freelancerUsers.forEach(fu => {
              if (!existingIds.has(fu.id)) {
                combinedResults.push(fu)
              }
            })
          }
        }
      }

      // Process results
      const results = await Promise.all(
        combinedResults.map(async (userData) => {
          // Try to get avatar
          let avatarUrl = null
          try {
            const possiblePaths = [
              `${userData.id}/avatar.webp`,
              `${userData.id}/avatar.jpg`,
              `${userData.id}/avatar.jpeg`,
              `${userData.id}/avatar.png`,
              `${userData.id}/avatar.gif`
            ]
            
            for (const path of possiblePaths) {
              const { data } = await supabase.storage.from('avatars').download(path)
              if (data) {
                avatarUrl = URL.createObjectURL(data)
                break
              }
            }
          } catch (err) {
            // No avatar found
          }

          let fullName = userData.email.split('@')[0]
          
          // If user is a freelancer, get their profile name
          if (userData.is_freelancer && userData.freelancer_profiles?.[0]) {
            const profile = userData.freelancer_profiles[0]
            fullName = profile.display_name || 
                      `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
                      fullName
          }

          return {
            id: userData.id,
            email: userData.email,
            full_name: fullName,
            avatar_url: avatarUrl,
            is_freelancer: userData.is_freelancer,
            freelancer_profile: userData.freelancer_profiles?.[0] || null
          }
        })
      )

      setSearchResults(results)
    } catch (error) {
      console.error('Error searching users:', error)
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      })
    } finally {
      setSearching(false)
    }
  }

  const startNewConversation = async (recipientId: string) => {
    try {
      const conversationId = await startConversation(recipientId)
      setActiveConversation(conversationId)
      setShowNewMessageDialog(false)
      setSearchQuery("")
      setSearchResults([])
      await fetchConversations()
      await fetchMessages(conversationId)
    } catch (error) {
      console.error('Error starting conversation:', error)
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      })
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return
    if (!activeConversation) return

    setSending(true)
    try {
      let attachmentUrl = null
      let attachmentType = null

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${user.id}_${Date.now()}.${fileExt}`
        const filePath = `message-attachments/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('message-attachments')
          .upload(filePath, selectedFile)

        if (uploadError) throw uploadError

        attachmentUrl = filePath
        attachmentType = selectedFile.type.startsWith('image/') ? 'image' : 'file'
      }

      const conversation = conversations.find(c => c.id === activeConversation)
      if (!conversation) return

      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: newMessage || (selectedFile ? `Sent ${attachmentType === 'image' ? 'an image' : 'a file'}` : ''),
          sender_id: user.id,
          receiver_id: conversation.participant.id,
          conversation_id: activeConversation,
          attachment_url: attachmentUrl,
          attachment_type: attachmentType,
        })
        .select()
        .single()

      if (error) throw error

      setMessages((prev) => [...prev, {
        ...data,
        sender: {
          full_name: user.user_metadata?.full_name || 'You',
          avatar_url: user.user_metadata?.avatar_url || null,
        }
      }])
      
      setNewMessage("")
      setSelectedFile(null)
      fetchConversations()
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        })
        return
      }
      setSelectedFile(file)
    }
  }

  const getUserInitials = (name: string) => {
    const names = name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.participant.full_name.toLowerCase().includes(conversationSearchQuery.toLowerCase()) ||
    conv.participant.email.toLowerCase().includes(conversationSearchQuery.toLowerCase())
  )

  const activeConversationData = conversations.find(c => c.id === activeConversation)

  // Mobile back button handler
  const handleMobileBack = () => {
    setActiveConversation(null)
  }

  return (
    <div className="flex h-[calc(100vh-200px)] md:h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Conversations Sidebar */}
      <div className={`${isMobileView && activeConversation ? 'hidden' : 'flex'} flex-col ${isMobileView ? 'w-full' : 'w-full md:w-1/3'} border-r bg-gray-50`}>
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Messages</h2>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowNewMessageDialog(true)}
              className="hover:bg-gray-100"
            >
              <Edit className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={conversationSearchQuery}
              onChange={(e) => setConversationSearchQuery(e.target.value)}
              className="pl-10 bg-gray-100 border-gray-200"
            />
          </div>
        </div>
        
        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500 mb-4">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No conversations yet</p>
              </div>
              <Button 
                onClick={() => setShowNewMessageDialog(true)}
                className="bg-[#00D37F] hover:bg-[#00c070]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => {
                  setActiveConversation(conversation.id)
                }}
                className={`p-4 cursor-pointer hover:bg-gray-100 transition-colors ${
                  activeConversation === conversation.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div 
                    className="relative cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (conversation.participant.is_freelancer) {
                        router.push(`/freelancer/${conversation.participant.id}`)
                      }
                    }}
                  >
                    <Avatar className={`h-12 w-12 ${conversation.participant.is_freelancer ? 'group-hover:ring-2 group-hover:ring-[#00D37F] transition-all' : ''}`}>
                      {conversation.participant.avatar_url && (
                        <AvatarImage src={conversation.participant.avatar_url} />
                      )}
                      <AvatarFallback className="bg-[#00D37F] text-white">
                        {getUserInitials(conversation.participant.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.participant.is_online && (
                      <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">
                          {conversation.participant.full_name}
                        </h3>
                        {conversation.participant.is_freelancer && (
                          <Badge variant="secondary" className="text-xs">Freelancer</Badge>
                        )}
                      </div>
                      {conversation.last_message && (
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(conversation.last_message.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                    {conversation.last_message && (
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.last_message.sender_id === user.id && "You: "}
                        {conversation.last_message.content}
                      </p>
                    )}
                    {conversation.unread_count > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full mt-1">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Messages Area */}
      <div className={`${isMobileView && !activeConversation ? 'hidden' : 'flex'} flex-1 flex flex-col`}>
        {activeConversation && activeConversationData ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isMobileView && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleMobileBack}
                    className="mr-2"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <div 
                  className={`${activeConversationData.participant.is_freelancer ? "cursor-pointer group" : ""}`}
                  onClick={() => {
                    if (activeConversationData.participant.is_freelancer) {
                      router.push(`/freelancer/${activeConversationData.participant.id}`)
                    }
                  }}
                >
                  <Avatar className={`h-10 w-10 ${activeConversationData.participant.is_freelancer ? 'group-hover:ring-2 group-hover:ring-[#00D37F] transition-all' : ''}`}>
                    {activeConversationData.participant.avatar_url && (
                      <AvatarImage src={activeConversationData.participant.avatar_url} />
                    )}
                    <AvatarFallback className="bg-[#00D37F] text-white">
                      {getUserInitials(activeConversationData.participant.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h3 className="font-semibold">{activeConversationData.participant.full_name}</h3>
                  {activeConversationData.participant.is_freelancer && (
                    <p className="text-xs text-gray-500">Freelancer</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost">
                  <Video className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {activeConversationData.participant.is_freelancer && (
                      <DropdownMenuItem 
                        onClick={() => router.push(`/freelancer/${activeConversationData.participant.id}`)}
                      >
                        View Profile
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>Clear Chat</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Block User</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className={`flex items-end gap-2 max-w-[70%] ${
                      message.sender_id === user.id ? "flex-row-reverse" : ""
                    }`}>
                      {message.sender_id !== user.id && (
                        <Avatar className="h-8 w-8">
                          {message.sender?.avatar_url && (
                            <AvatarImage src={message.sender.avatar_url} />
                          )}
                          <AvatarFallback className="bg-gray-300 text-xs">
                            {getUserInitials(message.sender?.full_name || '')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          message.sender_id === user.id
                            ? "bg-[#00D37F] text-white"
                            : "bg-white border"
                        }`}
                      >
                        {message.attachment_url && (
                          <div className="mb-2">
                            {message.attachment_type === 'image' ? (
                              <img 
                                src={`/api/storage/${message.attachment_url}`} 
                                alt="Attachment" 
                                className="rounded-lg max-w-full h-auto max-h-64"
                              />
                            ) : (
                              <a 
                                href={`/api/storage/${message.attachment_url}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 underline"
                              >
                                <FileText className="h-4 w-4" />
                                <span>Download attachment</span>
                              </a>
                            )}
                          </div>
                        )}
                        <p className="break-words">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === user.id ? "text-green-100" : "text-gray-500"
                        }`}>
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
              {selectedFile && (
                <div className="mb-3 p-3 bg-gray-100 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedFile.type.startsWith('image/') ? (
                      <ImageIcon className="h-5 w-5 text-gray-600" />
                    ) : (
                      <FileText className="h-5 w-5 text-gray-600" />
                    )}
                    <span className="text-sm truncate max-w-xs">{selectedFile.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending}
                  className="hover:bg-gray-100"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  disabled={sending}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={sending || (!newMessage.trim() && !selectedFile)}
                  className="bg-[#00D37F] hover:bg-[#00c070]"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full p-6 inline-flex mb-4">
                <MessageCircle className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
              <p className="text-gray-500 mb-4">Send messages to freelancers and clients</p>
              <Button 
                onClick={() => setShowNewMessageDialog(true)}
                className="bg-[#00D37F] hover:bg-[#00c070]"
              >
                Send Message
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* New Message Dialog */}
      <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Message - {isCurrentUserFreelancer === true ? 'Find Clients' : isCurrentUserFreelancer === false ? 'Find Freelancers' : 'Loading...'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder={`Search for ${isCurrentUserFreelancer === true ? 'clients' : isCurrentUserFreelancer === false ? 'freelancers' : 'users'}...`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  searchUsers(e.target.value)
                }}
                className="pl-10"
                autoFocus
              />
            </div>
            
            {searching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : searchResults.length > 0 ? (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => startNewConversation(result.id)}
                      className="p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className={`${result.is_freelancer ? "cursor-pointer group" : ""}`}
                          onClick={(e) => {
                            if (result.is_freelancer) {
                              e.stopPropagation()
                              router.push(`/freelancer/${result.id}`)
                            }
                          }}
                        >
                          <Avatar className={`h-10 w-10 ${result.is_freelancer ? 'group-hover:ring-2 group-hover:ring-[#00D37F] transition-all' : ''}`}>
                            {result.avatar_url && <AvatarImage src={result.avatar_url} />}
                            <AvatarFallback className="bg-[#00D37F] text-white">
                              {getUserInitials(result.full_name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{result.full_name}</p>
                            {result.is_freelancer && (
                              <Badge variant="secondary" className="text-xs">Freelancer</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{result.email}</p>
                          {result.freelancer_profile?.occupation && (
                            <p className="text-xs text-gray-500">{result.freelancer_profile.occupation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : searchQuery.length > 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No users found</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm">Loading {isCurrentUserFreelancer === true ? 'clients' : isCurrentUserFreelancer === false ? 'freelancers' : 'users'}...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}