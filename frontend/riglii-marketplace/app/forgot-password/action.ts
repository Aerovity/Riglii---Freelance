"use server"

import { createClient } from "@/utils/supabase/server"

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string

  if (!email) {
    return { error: "Email is required." }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password`,
  })

  if (error) {
    console.error("Password reset error:", error)
    return { error: "Failed to send password reset email. Please try again." }
  }

  // Success - no error returned
  return { success: true }
}
