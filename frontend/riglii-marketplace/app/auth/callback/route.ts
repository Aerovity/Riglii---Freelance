import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/account'

  if (code) {
    const supabase = await createClient()
    
    try {
      // Exchange code for session
      const { error: authError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (authError) {
        console.error('Auth error:', authError)
        throw authError
      }

      // Get the authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('User error:', userError)
        throw userError || new Error('No user found')
      }

      console.log('OAuth user:', user)

      // Check if user exists in public.users table
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error checking user:', checkError)
        throw checkError
      }

      // If user doesn't exist in public.users, create them
      if (!existingUser) {
        console.log('Creating new user in public.users table')
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({ 
            id: user.id, 
            email: user.email || '',
            is_freelancer: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Error creating user in public.users:', insertError)
          // Don't throw here - user is authenticated, just log the error
          // You might want to handle this differently based on your needs
        } else {
          console.log('User created successfully in public.users')
        }
      } else {
        console.log('User already exists in public.users')
      }

      // Check if they're a freelancer and need profile setup
      if (existingUser?.is_freelancer || next.includes('freelancer')) {
        const { data: freelancerProfile } = await supabase
          .from('freelancer_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()
        
        if (!freelancerProfile && existingUser?.is_freelancer) {
          // Create a basic freelancer profile if they don't have one
          const { error: profileError } = await supabase
            .from('freelancer_profiles')
            .insert({
              user_id: user.id,
              first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
              last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
              display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (profileError) {
            console.error('Error creating freelancer profile:', profileError)
          }
        }
      }
      
      // Successful authentication - redirect to account or requested page
      return NextResponse.redirect(`${origin}${next}`)
      
    } catch (error) {
      console.error('Callback error:', error)
      // Redirect to error page with error info
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error?.message || 'Authentication failed')}`)
    }
  }

  // No code provided - redirect to error
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`)
}