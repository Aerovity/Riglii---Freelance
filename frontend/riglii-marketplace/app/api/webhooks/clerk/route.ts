import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  console.log('🔵 Webhook received at:', new Date().toISOString())
  
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('❌ CLERK_WEBHOOK_SECRET not found')
    return new Response('Webhook secret not configured', { status: 500 })
  }

  try {
    // Get headers
    const headerPayload = headers()
    const svix_id = headerPayload.get("svix-id")
    const svix_timestamp = headerPayload.get("svix-timestamp")
    const svix_signature = headerPayload.get("svix-signature")

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('❌ Missing svix headers')
      return new Response('Missing svix headers', { status: 400 })
    }

    // Get body
    const payload = await req.text()
    console.log('📝 Webhook payload received, length:', payload.length)

    // Verify webhook
    const wh = new Webhook(WEBHOOK_SECRET)
    const evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent

    console.log('✅ Webhook verified, event type:', evt.type)
    console.log('👤 User ID:', evt.data.id)

    // Handle user events
    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      await syncUserToSupabase(evt.data)
    }

    if (evt.type === 'user.deleted') {
      await deleteUserFromSupabase(evt.data.id)
    }

    console.log('✅ Webhook processed successfully')
    return new Response('OK', { status: 200 })

  } catch (err) {
    console.error('❌ Webhook error:', err)
    return new Response(`Webhook error: ${err.message}`, { status: 400 })
  }
}

async function syncUserToSupabase(userData: any) {
  try {
    console.log('🔄 Syncing user to Supabase:', userData.id)
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert({
        clerk_id: userData.id,
        email: userData.email_addresses?.[0]?.email_address || null,
        is_freelancer: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'clerk_id'
      })
      .select()

    if (error) {
      console.error('❌ Supabase sync error:', error)
      throw error
    }

    console.log('✅ User synced to database:', data)
    return data
  } catch (error) {
    console.error('❌ Failed to sync user:', error)
    throw error
  }
}

async function deleteUserFromSupabase(clerkId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('clerk_id', clerkId)

    if (error) throw error
    console.log('✅ User deleted from database:', clerkId)
  } catch (error) {
    console.error('❌ Failed to delete user:', error)
  }
}