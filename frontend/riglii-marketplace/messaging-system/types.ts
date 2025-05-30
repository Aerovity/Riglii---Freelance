import type { User } from "@supabase/supabase-js"

export interface Conversation {
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

export interface Message {
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
  message_type?: "text" | "form" | "form_response"
  form_id?: string
  form?: Form
  sender?: {
    full_name: string
    avatar_url: string | null
  }
}

export interface Form {
  id: string
  title: string
  description: string
  price: number
  time_estimate: string
  status: "pending" | "accepted" | "refused" | "cancelled"
  sender_id: string
  receiver_id: string
  created_at: string
  responded_at?: string
}

export interface SearchResult {
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

export interface FormData {
  title: string
  description: string
  price: string
  timeEstimate: string
}

export interface MessagingSystemProps {
  user: User
}