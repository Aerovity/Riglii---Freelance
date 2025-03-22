import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://glafuweuazsrmlbfxfbl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsYWZ1d2V1YXpzcm1sYmZ4ZmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MjkzMDQsImV4cCI6MjA1ODAwNTMwNH0.ofnQTxGNicad4xMr7NFs5ESSlVvexw2rCqLTI8GBXB8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

if (supabase) {
  console.log("Supabase client created successfully!");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed. Use POST.' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          clerk_id: 'test_clerk_id',
          email: 'testuser@example.com',
          is_freelancer: false,
        },
      ])
      .select();

    if (error) {
      throw error;
    }

    res.status(200).json({
      message: '✅ Test user inserted successfully!',
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      message: '❌ Failed to insert test user!',
      error: error.message || error,
    });
  }
}

