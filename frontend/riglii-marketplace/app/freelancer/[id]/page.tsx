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

  // Get reviews for this freelancer with client information
  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select(`
      *,
      forms!inner(
        title,
        project_submitted_at
      ),
      users!reviews_client_id_fkey(
        email,
        freelancer_profiles(
          display_name,
          first_name,
          last_name,
          profile_picture_url
        )
      )
    `)
    .eq("freelancer_id", id)
    .order("created_at", { ascending: false })

  // Transform reviews data to match the expected interface
  const transformedReviews = reviews?.map(review => ({
    id: review.id,
    freelancer_id: review.freelancer_id,
    client_id: review.client_id,
    form_id: review.form_id,
    rating: review.rating,
    comment: review.comment,
    created_at: review.created_at,
    updated_at: review.updated_at,
    client_email: review.users?.email || '',
    client_display_name: review.users?.freelancer_profiles?.[0]?.display_name || null,
    client_first_name: review.users?.freelancer_profiles?.[0]?.first_name || null,
    client_last_name: review.users?.freelancer_profiles?.[0]?.last_name || null,
    client_avatar_url: review.users?.freelancer_profiles?.[0]?.profile_picture_url || null,
    project_title: review.forms?.title || null,
    project_submitted_at: review.forms?.project_submitted_at || null
  })) || []

  if (portfolioError) {
    console.error("Error loading portfolio:", portfolioError)
  }

  if (certificatesError) {
    console.error("Error loading certificates:", certificatesError)
  }

  if (reviewsError) {
    console.error("Error loading reviews:", reviewsError)
  }

  return (
    <FreelancerProfileView
      profile={profile}
      userData={userData}
      portfolioImages={portfolioImages || []}
      certificates={certificates || []}
      reviews={transformedReviews}
    />
  )
}