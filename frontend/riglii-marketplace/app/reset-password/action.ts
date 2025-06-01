"use server"

import { createClient } from "@/utils/supabase/server"

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get("password") as string

  if (!password) {
    return { error: "Password is required." }
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." }
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      console.error("Password update error:", error)

      if (error.message.includes("session") || error.message.includes("JWT")) {
        return { error: "Your session has expired. Please request a new password reset." }
      }

      return { error: "Failed to update password. Please try again." }
    }

    // Success - no error returned
    return { success: true }
  } catch (err) {
    console.error("Unexpected error:", err)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
