import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AccountDashboard from './account-dashboard'

export default async function AccountPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <AccountDashboard user={user} />
}