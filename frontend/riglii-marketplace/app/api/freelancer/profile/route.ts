import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    
    // Get user from Supabase
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !userData) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Create or update freelancer profile
    const { data, error } = await supabaseAdmin
      .from('freelancer_profiles')
      .upsert({
        user_id: userData.id,
        ...body,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Update user to be freelancer
    await supabaseAdmin
      .from('users')
      .update({ is_freelancer: true })
      .eq('id', userData.id)

    return Response.json({ data })
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}