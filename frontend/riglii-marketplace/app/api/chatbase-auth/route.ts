// app/api/chatbase-auth/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Your Chatbase secret key (store in environment variables)
    const secret = process.env.CHATBASE_SECRET_KEY // '62makv9oi0tqpjk1r6jp3gt86uiqp65x'
    
    if (!secret) {
      return NextResponse.json({ error: 'Secret key not configured' }, { status: 500 })
    }

    // Generate HMAC hash using user ID
    const userId = user.id
    const hash = crypto.createHmac('sha256', secret).update(userId).digest('hex')

    return NextResponse.json({
      userId,
      userHash: hash,
      userEmail: user.email
    })

  } catch (error) {
    console.error('Chatbase auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}