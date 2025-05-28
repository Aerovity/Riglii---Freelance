import FreelancerEditForm from "./freelancer-edit-form"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function FreelancerEditPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is a freelancer - try multiple methods
  let isFreelancer = false

  // First check user metadata
  if (user?.user_metadata?.is_freelancer === true) {
    isFreelancer = true
  }

  // If not found in metadata, check users table
  if (!isFreelancer) {
    const { data: userData } = await supabase
      .from('users')
      .select('is_freelancer')
      .eq('id', user.id)
      .single()
    
    if (userData?.is_freelancer === true) {
      isFreelancer = true
    }
  }

  // As a last resort, check if they have a freelancer profile
  if (!isFreelancer) {
    const { data: profileData } = await supabase
      .from('freelancer_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single()
    
    if (profileData) {
      isFreelancer = true
    }
  }

  if (!isFreelancer) {
    redirect("/account")
  }

  return <FreelancerEditForm user={user} />
}