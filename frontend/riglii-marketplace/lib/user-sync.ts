import { supabaseAdmin } from './supabase'
import { User } from '@clerk/nextjs/server'

export async function syncUserToSupabase(user: User) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert({
        clerk_id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        is_freelancer: false,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'clerk_id'
      })

    if (error) {
      console.error('Error syncing user to Supabase:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in syncUserToSupabase:', error)
    return null
  }
}

export async function createFreelancerProfile(clerkId: string, profileData: any) {
  try {
    // First get the user
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', clerkId)
      .single()

    if (userError || !userData) {
      throw new Error('User not found')
    }

    // Update user to be freelancer
    await supabaseAdmin
      .from('users')
      .update({ is_freelancer: true })
      .eq('id', userData.id)

    // Create freelancer profile
    const { data, error } = await supabaseAdmin
      .from('freelancer_profiles')
      .insert({
        user_id: userData.id,
        ...profileData,
        created_at: new Date().toISOString()
      })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating freelancer profile:', error)
    throw error
  }
}