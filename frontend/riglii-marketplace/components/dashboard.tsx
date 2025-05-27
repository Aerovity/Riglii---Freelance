'use client'

import { useAuthWithSupabase } from '@/hooks/use-auth'
import { SignOutButton } from '@clerk/nextjs'

export default function Dashboard() {
  const { clerkUser, supabaseUser, loading, isFreelancer } = useAuthWithSupabase()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!clerkUser) {
    return <div>Please sign in</div>
  }

  return (
    <div className="p-6">
      <h1>Dashboard</h1>
      <p>Welcome, {clerkUser.firstName || clerkUser.emailAddresses[0]?.emailAddress}!</p>
      
      {isFreelancer && supabaseUser?.freelancer_profiles && (
        <div className="mt-4">
          <h2>Freelancer Profile</h2>
          <p>Display Name: {supabaseUser.freelancer_profiles.display_name}</p>
          <p>Occupation: {supabaseUser.freelancer_profiles.occupation}</p>
        </div>
      )}

      <SignOutButton>
        <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
          Sign Out
        </button>
      </SignOutButton>
    </div>
  )
}