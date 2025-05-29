import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import MessagingSystem from '@/components/messaging-system'

export default async function MessagesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      <MessagingSystem user={user} />
    </div>
  )
}