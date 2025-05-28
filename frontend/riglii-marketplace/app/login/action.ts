'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error, data: authData } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Login error:', error)
    
    // Return error message to client
    if (error.message === 'Invalid login credentials') {
      return { error: 'Invalid email or password. Please try again.' }
    } else if (error.message === 'Email not confirmed') {
      return { error: 'Please verify your email before signing in.', needsVerification: true, email: data.email }
    } else {
      return { error: error.message || 'An error occurred during login.' }
    }
  }

  // Check if user exists and email is confirmed
  if (authData?.user && !authData.user.email_confirmed_at) {
    await supabase.auth.signOut()
    return { error: 'Please verify your email before signing in.', needsVerification: true, email: data.email }
  }

  revalidatePath('/', 'layout')
  redirect('/account')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error, data: authData } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm`,
    }
  })

  if (error) {
    console.error('Signup error details:', {
      message: error.message,
      status: error.status,
      code: error.code,
      details: error
    })
    
    // Check for specific database error from your trigger
    if (error.message?.includes('duplicate key value violates unique constraint')) {
      return { error: 'This email is already registered. Please sign in instead.' }
    } else if (error.message?.includes('already registered')) {
      return { error: 'This email is already registered. Please sign in instead.' }
    } else if (error.message?.includes('password')) {
      return { error: 'Password should be at least 6 characters long.' }
    } else if (error.message?.includes('Database error')) {
      // The trigger is failing - check if it's because email already exists in public.users
      return { error: 'Unable to create account. This email may already be in use.' }
    } else {
      return { error: error.message || 'An error occurred during signup.' }
    }
  }

  // Successful signup - redirect to verify email page
  redirect(`/auth/verify-email?email=${encodeURIComponent(data.email)}`)
}