import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import FreelancerProfileView from "./freelancer-profile-view"

export default async function FreelancerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Get freelancer profile
  const { data: profile, error: profileError } = await supabase
    .from("freelancer_profiles")
    .select("*")
    .eq("user_id", id)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Get user data for avatar
  const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", id).single()

  // Get portfolio images
  const { data: portfolioImages, error: portfolioError } = await supabase
    .from("freelancer_documents")
    .select("*")
    .eq("freelancer_id", profile.id)
    .eq("document_type", "portfolio")
    .order("created_at", { ascending: false })

  // Get certificate documents
  const { data: certificates, error: certificatesError } = await supabase
    .from("freelancer_documents")
    .select("*")
    .eq("freelancer_id", profile.id)
    .eq("document_type", "certificate")
    .order("created_at", { ascending: false })

  if (portfolioError) {
    console.error("Error loading portfolio:", portfolioError)
  }

  if (certificatesError) {
    console.error("Error loading certificates:", certificatesError)
  }

  return (
    <FreelancerProfileView
      profile={profile}
      userData={userData}
      portfolioImages={portfolioImages || []}
      certificates={certificates || []}
    />
  )
}
