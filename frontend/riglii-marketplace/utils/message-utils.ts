import { createClient } from '@/utils/supabase/client'

export async function startConversation(otherUserId: string) {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Ensure consistent ordering (smaller UUID first)
    const user1_id = user.id < otherUserId ? user.id : otherUserId
    const user2_id = user.id < otherUserId ? otherUserId : user.id

    // Check if conversation already exists
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('user1_id', user1_id)
      .eq('user2_id', user2_id)
      .single()

    if (existingConv) {
      return existingConv.id
    }

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        user1_id,
        user2_id,
      })
      .select()
      .single()

    if (error) throw error

    return newConv.id
  } catch (error) {
    console.error('Error starting conversation:', error)
    throw error
  }
}

export async function sendQuickMessage(receiverId: string, content: string) {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get or create conversation
    const conversationId = await startConversation(receiverId)

    // Send message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        content,
        sender_id: user.id,
        receiver_id: receiverId,
        conversation_id: conversationId,
      })
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}