import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function POST() {
  const supabase = await createClient()
  
  // Sign out the user
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error)
  }
  
  // Always redirect to home page after sign out
  return redirect('/')
}

// Also support GET method for direct navigation (optional)
export async function GET() {
  const supabase = await createClient()
  
  await supabase.auth.signOut()
  
  return redirect('/')
}