import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useAuthWithSupabase() {
  const { user, isLoaded } = useUser()
  const [supabaseUser, setSupabaseUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSupabaseUser() {
      if (!user || !isLoaded) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select(`
            *,
            freelancer_profiles (
              *,
              freelancer_languages (*),
              freelancer_categories (
                *,
                categories (*)
              ),
              freelancer_skills (*),
              freelancer_certificates (*),
              freelancer_education (*),
              freelancer_documents (*),
              freelancer_payment_info (*)
            )
          `)
          .eq('clerk_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user from Supabase:', error)
        } else {
          setSupabaseUser(data)
        }
      } catch (error) {
        console.error('Error in fetchSupabaseUser:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSupabaseUser()
  }, [user, isLoaded])

  return {
    clerkUser: user,
    supabaseUser,
    loading: loading || !isLoaded,
    isFreelancer: supabaseUser?.is_freelancer || false
  }
}