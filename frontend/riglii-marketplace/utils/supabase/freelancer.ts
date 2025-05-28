import { createClient } from "@/utils/supabase/client"

export async function checkFreelancerProfileExists(userId: string) {
  const supabase = createClient()
  
  try {
    // First, verify we're authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.log('No active session when checking profile')
      return { exists: false, error: new Error('Not authenticated') }
    }

    const { data, error } = await supabase
      .from('freelancer_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle() // Use maybeSingle to avoid errors when no rows found
    
    if (error) {
      // Log the full error for debugging
      console.error('Error checking freelancer profile:', {
        error,
        userId,
        sessionUserId: session.user.id
      })
      
      // For 406 errors, we'll assume the profile doesn't exist
      if (error.code === 'PGRST301' || error.message.includes('406')) {
        return { exists: false, error: null }
      }
      
      return { exists: false, error }
    }
    
    return { exists: !!data, profileId: data?.id, error: null }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { exists: false, error: err }
  }
}

export async function checkFreelancerProfileExistsRPC(userId: string) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .rpc('check_freelancer_profile_exists', { p_user_id: userId })
      .single()
    
    if (error) {
      console.error('Error checking freelancer profile via RPC:', error)
      return { exists: false, error }
    }
    
    return { 
      exists: data?.profile_exists || false, 
      profileId: data?.profile_id || null, 
      error: null 
    }
  } catch (err) {
    console.error('Unexpected error in RPC:', err)
    return { exists: false, error: err }
  }
}

export async function getFreelancerProfile(userId: string) {
  const supabase = createClient()
  
  const { data: profile, error: profileError } = await supabase
    .from('freelancer_profiles')
    .select(`
      *,
      freelancer_languages (
        id,
        language,
        proficiency_level
      ),
      freelancer_categories (
        id,
        category_id,
        categories (
          id,
          name
        )
      ),
      freelancer_skills (
        id,
        skill,
        level
      ),
      freelancer_education (
        id,
        country,
        university,
        title,
        major,
        year
      ),
      freelancer_certificates (
        id,
        name,
        issuer,
        year
      ),
      freelancer_documents (
        id,
        document_type,
        document_url
      ),
      freelancer_payment_info (
        id,
        payment_type,
        account_number,
        account_holder_name
      )
    `)
    .eq('user_id', userId)
    .single()
    
  if (profileError) {
    return { profile: null, error: profileError }
  }
  
  return { profile, error: null }
}

export async function updateFreelancerProfile(userId: string, updates: any) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('freelancer_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()
    
  if (error) {
    return { profile: null, error }
  }
  
  return { profile: data, error: null }
}

export async function deleteFreelancerProfile(userId: string) {
  const supabase = createClient()
  
  // Delete in correct order due to foreign key constraints
  const tables = [
    'freelancer_payment_info',
    'freelancer_documents',
    'freelancer_certificates',
    'freelancer_education',
    'freelancer_skills',
    'freelancer_categories',
    'freelancer_languages'
  ]
  
  // Get the freelancer profile ID first
  const { data: profile } = await supabase
    .from('freelancer_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()
    
  if (!profile) {
    return { success: false, error: new Error('Profile not found') }
  }
  
  // Delete related data
  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('freelancer_id', profile.id)
      
    if (error) {
      console.error(`Error deleting from ${table}:`, error)
    }
  }
  
  // Finally delete the main profile
  const { error } = await supabase
    .from('freelancer_profiles')
    .delete()
    .eq('user_id', userId)
    
  if (error) {
    return { success: false, error }
  }
  
  return { success: true, error: null }
}