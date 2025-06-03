"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
  Star,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Heart,
  Share2,
  Award,
  Download,
  X,
  Maximize2,
  GraduationCap,
  Languages,
  Briefcase,
  CreditCard,
  CheckCircle,
} from "lucide-react"
import ReviewForm from "@/messaging-system/components/Forms/ReviewForm"

interface FreelancerProfile {
  id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
  description: string | null
  occupation: string | null
  custom_occupation: string | null
  profile_picture_url: string | null
  price: number | null
  created_at: string
  updated_at: string
  average_rating: number | null
  total_reviews: number | null
}

interface FreelancerDocument {
  id: string
  freelancer_id: string
  document_type: string
  document_url: string
  verified: boolean
  verification_date: string | null
  created_at: string
  updated_at: string
}

interface FreelancerCertificate {
  id: string
  freelancer_id: string
  name: string
  issuer: string
  year: string | null
  created_at: string
}

interface FreelancerSkill {
  id: string
  freelancer_id: string
  skill: string
  level: string
  created_at: string
}

interface FreelancerLanguage {
  id: string
  freelancer_id: string
  language: string
  proficiency_level: string
  created_at: string
}

interface FreelancerEducation {
  id: string
  freelancer_id: string
  country: string | null
  university: string | null
  title: string | null
  major: string | null
  year: string | null
  created_at: string
}

interface FreelancerCategory {
  freelancer_id: string
  category_id: string
  created_at: string
  categories: {
    id: string
    name: string
    created_at: string
  }
}

interface FreelancerPaymentInfo {
  id: string
  freelancer_id: string
  payment_type: string
  account_number: string
  account_holder_name: string
  verified: boolean
  verification_date: string | null
  created_at: string
  updated_at: string
}

interface UserData {
  id: string
  email: string
  user_metadata?: {
    avatar_url?: string
    full_name?: string
    name?: string
  }
}

interface Review {
  id: string
  freelancer_id: string
  client_id: string
  form_id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
  client_email: string
  client_display_name: string | null
  client_first_name: string | null
  client_last_name: string | null
  client_avatar_url: string | null
  project_title: string | null
  project_submitted_at: string | null
}

interface FreelancerProfileViewProps {
  profile: FreelancerProfile
  userData: UserData | null
  portfolioImages: FreelancerDocument[]
  certificateDocuments: FreelancerDocument[]
  certificates: FreelancerCertificate[]
  skills: FreelancerSkill[]
  languages: FreelancerLanguage[]
  education: FreelancerEducation | null
  categories: FreelancerCategory[]
  paymentInfo: FreelancerPaymentInfo | null
  reviews: Review[]
}

export default function FreelancerProfileView({
  profile,
  userData,
  portfolioImages,
  certificateDocuments,
  certificates,
  skills,
  languages,
  education,
  categories,
  paymentInfo,
  reviews,
}: FreelancerProfileViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [portfolioImageUrls, setPortfolioImageUrls] = useState<string[]>([])
  const [certificateUrls, setCertificateUrls] = useState<string[]>([])
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [canReview, setCanReview] = useState(false)
  const [eligibleForm, setEligibleForm] = useState<any>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const supabase = createClient()

  // Calculate review statistics
  const calculateReviewStats = () => {
    if (!reviews || reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      }
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviews.forEach((review) => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++
    })

    return {
      averageRating,
      totalReviews: reviews.length,
      ratingDistribution,
    }
  }

  // Helper function to get client name consistently
  const getClientName = (review: Review) => {
    return (
      review.client_display_name ||
      `${review.client_first_name || ""} ${review.client_last_name || ""}`.trim() ||
      review.client_email?.split("@")[0] ||
      "Anonymous Client"
    )
  }

  // Helper function to get client initials consistently
  const getClientInitials = (review: Review) => {
    if (review.client_display_name) {
      const names = review.client_display_name.split(" ")
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return review.client_display_name.slice(0, 2).toUpperCase()
    }
    if (review.client_first_name && review.client_last_name) {
      return `${review.client_first_name[0]}${review.client_last_name[0]}`.toUpperCase()
    }
    if (review.client_email) {
      return review.client_email.slice(0, 2).toUpperCase()
    }
    return "AC"
  }

  // Check if current user can review this freelancer
  const checkReviewEligibility = async () => {
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (!user) {
        return
      }

      setCurrentUserId(user.id)
      
      // Check if viewing own profile
      setIsOwnProfile(user.id === profile.user_id)

      // Check for completed projects with this freelancer
      const { data: forms, error } = await supabase
        .from("forms")
        .select("*")
        .eq("sender_id", profile.user_id) // Freelancer is sender
        .eq("receiver_id", user.id) // Current user is receiver (client)
        .eq("status", "accepted")
        .eq("project_submitted", true) // Project MUST be submitted for review

      if (error) {
        return
      }

      if (forms && forms.length > 0) {
        const form = forms[0] // Use the first eligible form
        setEligibleForm(form)

        // Check if already reviewed
        const { data: existingReview, error: reviewError } = await supabase
          .from("reviews")
          .select("*")
          .eq("form_id", form.id)
          .eq("client_id", user.id)
          .maybeSingle()

        setHasReviewed(!!existingReview)
        setCanReview(true)
      } else {
        setCanReview(false)
        setHasReviewed(false)
      }
    } catch (error) {
      // Silently handle errors
    }
  }

  useEffect(() => {
    checkReviewEligibility()
  }, [profile.user_id, supabase])

  // Function to download avatar image from Supabase storage using user ID
  const downloadAvatar = async (userId: string) => {
    try {
      // Try different path structures that might exist
      const possiblePaths = [
        `${userId}/avatar.webp`,
        `${userId}/avatar.jpg`,
        `${userId}/avatar.jpeg`,
        `${userId}/avatar.png`,
        `${userId}/avatar.gif`,
        `${userId}.webp`,
        `${userId}.jpg`,
        `${userId}.jpeg`,
        `${userId}.png`,
        `${userId}.gif`,
      ]

      for (const path of possiblePaths) {
        try {
          const { data, error } = await supabase.storage.from("avatars").download(path)
          if (!error && data) {
            const url = URL.createObjectURL(data)
            setAvatarUrl(url)
            return
          }
        } catch (err) {
          // Continue to next path
          continue
        }
      }

      setAvatarUrl(null)
    } catch (error) {
      setAvatarUrl(null)
    }
  }

  // Function to download portfolio images
  const downloadPortfolioImages = async () => {
    try {
      const urls: string[] = []

      for (const image of portfolioImages) {
        try {
          const { data, error } = await supabase.storage.from("portfolio").download(image.document_url)
          if (error) {
            const publicUrl = supabase.storage.from("portfolio").getPublicUrl(image.document_url).data.publicUrl
            urls.push(publicUrl)
          } else {
            const url = URL.createObjectURL(data)
            urls.push(url)
          }
        } catch (err) {
          urls.push("/placeholder.svg?height=600&width=800")
        }
      }

      setPortfolioImageUrls(urls)
    } catch (error) {
      // Handle error silently
    }
  }

  // Function to download certificate images
  const downloadCertificates = async () => {
    try {
      const urls: string[] = []

      for (const cert of certificateDocuments) {
        try {
          const { data, error } = await supabase.storage.from("certificates").download(cert.document_url)
          if (error) {
            const publicUrl = supabase.storage.from("certificates").getPublicUrl(cert.document_url).data.publicUrl
            urls.push(publicUrl)
          } else {
            const url = URL.createObjectURL(data)
            urls.push(url)
          }
        } catch (err) {
          urls.push("/placeholder.svg?height=400&width=500")
        }
      }

      setCertificateUrls(urls)
    } catch (error) {
      // Handle error silently
    }
  }

  // Download avatar on component mount or when user_id changes
  useEffect(() => {
    if (profile.user_id) {
      downloadAvatar(profile.user_id)
    }

    return () => {
      if (avatarUrl && avatarUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarUrl)
      }
    }
  }, [profile.user_id])

  // Download portfolio and certificates on component mount
  useEffect(() => {
    if (portfolioImages.length > 0) {
      downloadPortfolioImages()
    }

    if (certificateDocuments.length > 0) {
      downloadCertificates()
    }

    return () => {
      portfolioImageUrls.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url)
        }
      })
      certificateUrls.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [portfolioImages, certificateDocuments])

  const displayName =
    profile.display_name ||
    userData?.user_metadata?.full_name ||
    userData?.user_metadata?.name ||
    `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
    "Freelancer"

  const occupation =
    profile.occupation === "other"
      ? profile.custom_occupation
      : profile.occupation?.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === portfolioImageUrls.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? portfolioImageUrls.length - 1 : prev - 1))
  }

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return

      if (e.key === "ArrowRight") {
        nextImage()
      } else if (e.key === "ArrowLeft") {
        prevImage()
      } else if (e.key === "Escape") {
        setIsLightboxOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isLightboxOpen, portfolioImageUrls.length])

  const getUserInitials = () => {
    const fullName = userData?.user_metadata?.full_name || userData?.user_metadata?.name
    if (fullName) {
      const names = fullName.split(" ")
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return fullName.slice(0, 2).toUpperCase()
    }
    if (userData?.email) {
      return userData.email.slice(0, 2).toUpperCase()
    }
    return displayName.charAt(0).toUpperCase()
  }

  const handleReviewSubmitted = () => {
    setHasReviewed(true)
    // Refresh the page to show the new review
    window.location.reload()
  }

  const handleContactFreelancer = async () => {
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to login if not authenticated
        window.location.href = '/login'
        return
      }

      // Check if conversation already exists
      const { data: existingConversation, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${profile.user_id}),and(user1_id.eq.${profile.user_id},user2_id.eq.${user.id})`)
        .maybeSingle()

      if (convError && convError.code !== 'PGRST116') {
        console.error('Error checking conversation:', convError)
        return
      }

      let conversationId: string

      if (existingConversation) {
        conversationId = existingConversation.id
      } else {
        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
          .from("conversations")
          .insert([
            {
              user1_id: user.id,
              user2_id: profile.user_id,
            },
          ])
          .select()
          .single()

        if (createError) {
          console.error('Error creating conversation:', createError)
          return
        }

        conversationId = newConversation.id
      }

      // Redirect to messages with conversation ID
      window.location.href = `/messages?conversation=${conversationId}`
    } catch (error) {
      console.error('Error handling contact:', error)
    }
  }

  const reviewStats = calculateReviewStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <Avatar className="w-24 h-24 mx-auto">
                      <AvatarImage src={avatarUrl || ""} alt={displayName} />
                      <AvatarFallback className="text-2xl bg-[#00D37F] text-white">{getUserInitials()}</AvatarFallback>
                    </Avatar>

                    <div>
                      <h1 className="text-2xl font-bold">{displayName}</h1>
                      {occupation && <p className="text-gray-600 mt-1">{occupation}</p>}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(reviewStats.averageRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {reviewStats.averageRating.toFixed(1)} ({reviewStats.totalReviews} review
                        {reviewStats.totalReviews !== 1 ? "s" : ""})
                      </span>
                    </div>

                    {/* Price */}
                    {profile.price && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-center">
                          <span className="text-2xl font-bold text-green-600">
                            {profile.price.toLocaleString()} DZD
                          </span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">Starting price</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {isOwnProfile ? (
                        <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-center">
                          <p className="text-gray-600 text-sm">This is your profile</p>
                        </div>
                      ) : (
                        <Button 
                          className="w-full bg-[#00D37F] hover:bg-[#00c070] text-white"
                          onClick={handleContactFreelancer}
                        >
                          Contact Freelancer
                        </Button>
                      )}

                      {/* Review Button for eligible clients */}
                      {canReview && !isOwnProfile && (
                        <Button
                          onClick={() => setShowReviewForm(true)}
                          className={`w-full ${hasReviewed ? "bg-gray-600 hover:bg-gray-700" : "bg-blue-600 hover:bg-blue-700"} text-white`}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          {hasReviewed ? "Update Your Review" : "Leave a Review"}
                        </Button>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Heart className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Response Time</p>
                      <p className="text-sm text-gray-600">Within 1 hour</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-gray-600">{education?.country || "Algeria"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Languages className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Languages</p>
                      <p className="text-sm text-gray-600">
                        {languages.length > 0
                          ? languages.map((lang) => `${lang.language} (${lang.proficiency_level})`).join(", ")
                          : "Arabic, French"}
                      </p>
                    </div>
                  </div>
                  {paymentInfo && (
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium">Payment Verified</p>
                          <p className="text-sm text-gray-600">{paymentInfo.payment_type.toUpperCase()}</p>
                        </div>
                        {paymentInfo.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Categories */}
              {categories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <Badge key={category.category_id} variant="secondary" className="text-sm">
                          {category.categories.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Portfolio & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Portfolio Gallery - Made Larger */}
              {portfolioImageUrls.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Portfolio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div
                        className="aspect-[16/10] bg-gray-100 rounded-lg overflow-hidden group cursor-pointer"
                        onClick={() => setIsLightboxOpen(true)}
                      >
                        <img
                          src={portfolioImageUrls[currentImageIndex] || "/placeholder.svg?height=600&width=800"}
                          alt={`Portfolio image ${currentImageIndex + 1}`}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=600&width=800"
                          }}
                        />

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                          <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </div>

                      {portfolioImageUrls.length > 1 && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              prevImage()
                            }}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              nextImage()
                            }}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>

                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                            <div className="flex gap-2">
                              {portfolioImageUrls.map((_, index) => (
                                <button
                                  key={index}
                                  className={`w-2 h-2 rounded-full transition-colors ${
                                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setCurrentImageIndex(index)
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {portfolioImageUrls.length > 1 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 text-center">
                          {currentImageIndex + 1} of {portfolioImageUrls.length} images • Click to view fullscreen
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Lightbox Modal */}
              <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
                <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full p-0 bg-black/95 border-none overflow-hidden">
                  <DialogTitle className="sr-only">Portfolio Image View</DialogTitle>

                  {/* Close button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4 z-50 text-white hover:bg-white/20"
                    onClick={() => setIsLightboxOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>

                  {/* Image counter */}
                  {portfolioImageUrls.length > 1 && (
                    <div className="absolute left-4 top-4 z-50 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {portfolioImageUrls.length}
                    </div>
                  )}

                  {/* Main image container */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Padding area for navigation and thumbnails */}
                    <div className="w-full h-full flex items-center justify-center p-16 pb-32">
                      <img
                        src={portfolioImageUrls[currentImageIndex] || "/placeholder.svg?height=800&width=1200"}
                        alt={`Portfolio image ${currentImageIndex + 1}`}
                        className="w-full h-full object-contain"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          width: "auto",
                          height: "auto",
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=800&width=1200"
                        }}
                      />
                    </div>

                    {/* Navigation buttons */}
                    {portfolioImageUrls.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="w-8 h-8" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                          onClick={nextImage}
                        >
                          <ChevronRight className="w-8 h-8" />
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail strip at bottom */}
                  {portfolioImageUrls.length > 1 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4">
                      <div className="flex gap-2 justify-center overflow-x-auto max-w-full pb-2">
                        {portfolioImageUrls.map((url, index) => (
                          <button
                            key={index}
                            className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-all ${
                              index === currentImageIndex
                                ? "border-white opacity-100"
                                : "border-transparent opacity-60 hover:opacity-80"
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                          >
                            <img
                              src={url || "/placeholder.svg?height=80&width=80"}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* About Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About This Freelancer</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.description ? (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.description}</p>
                  ) : (
                    <p className="text-gray-500 italic">No description provided yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Skills Section */}
              {skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Skills & Expertise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {skills.map((skill) => (
                        <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{skill.skill}</span>
                          <Badge
                            variant={
                              skill.level === "expert"
                                ? "default"
                                : skill.level === "intermediate"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {skill.level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Education Section */}
              {education && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {education.title && (
                        <div>
                          <h4 className="font-semibold">{education.title}</h4>
                          {education.major && <p className="text-gray-600">{education.major}</p>}
                        </div>
                      )}
                      {education.university && <p className="text-gray-700">{education.university}</p>}
                      <div className="flex gap-4 text-sm text-gray-500">
                        {education.country && <span>{education.country}</span>}
                        {education.year && <span>{education.year}</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Languages Section */}
              {languages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Languages className="w-5 h-5" />
                      Languages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {languages.map((language) => (
                        <div key={language.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{language.language}</span>
                          <Badge variant="outline">{language.proficiency_level}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Certificates Section - Made Larger */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Certificates & Qualifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Certificate Documents */}
                  {certificateUrls.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-4">Certificate Documents</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {certificateUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                              <img
                                src={url || "/placeholder.svg?height=400&width=500"}
                                alt={`Certificate ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg?height=400&width=500"
                                }}
                              />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg">
                              <Button
                                variant="outline"
                                size="sm"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                                onClick={() => {
                                  window.open(url, "_blank")
                                }}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </div>
                            <p className="text-xs text-center mt-2 text-gray-600">
                              Certificate {index + 1}
                              {certificateDocuments[index]?.verified && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  Verified
                                </Badge>
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certificate Records */}
                  {certificates.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-4">Certifications</h4>
                      <div className="space-y-4">
                        {certificates.map((cert) => (
                          <div key={cert.id} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="font-semibold">{cert.name}</h5>
                                <p className="text-gray-600">{cert.issuer}</p>
                                {cert.year && <p className="text-sm text-gray-500">{cert.year}</p>}
                              </div>
                              <Award className="w-5 h-5 text-yellow-500" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {certificateUrls.length === 0 && certificates.length === 0 && (
                    <div className="text-center py-8">
                      <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No certificates uploaded yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reviews Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-6">
                      {/* Summary Stats with Rating Distribution */}
                      <div className="text-center pb-6 border-b">
                        <div className="flex justify-center mb-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-8 h-8 ${
                                star <= Math.round(reviewStats.averageRating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-gray-200 text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{reviewStats.averageRating.toFixed(1)} out of 5</h3>
                        <p className="text-gray-600 mb-4">
                          Based on {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? "s" : ""}
                        </p>

                        {/* Rating Distribution */}
                        {reviewStats.totalReviews > 1 && (
                          <div className="max-w-md mx-auto space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => (
                              <div key={rating} className="flex items-center gap-2 text-sm">
                                <span className="w-8 text-right">{rating}</span>
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-yellow-400 h-2 rounded-full"
                                    style={{
                                      width: `${(reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution] / reviewStats.totalReviews) * 100}%`,
                                    }}
                                  />
                                </div>
                                <span className="w-8 text-left text-gray-500">
                                  {
                                    reviewStats.ratingDistribution[
                                      rating as keyof typeof reviewStats.ratingDistribution
                                    ]
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Individual Reviews */}
                      <div className="space-y-4">
                        {reviews.map((review) => {
                          const clientName = getClientName(review)

                          return (
                            <div key={review.id} className="border-b pb-4 last:border-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={review.client_avatar_url || ""} alt={clientName} />
                                    <AvatarFallback className="bg-blue-500 text-white text-sm">
                                      {getClientInitials(review)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{clientName}</p>
                                    <div className="flex items-center gap-2">
                                      <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star
                                            key={star}
                                            className={`w-4 h-4 ${
                                              star <= review.rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "fill-gray-200 text-gray-200"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        {new Date(review.created_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Show comment if available */}
                              {review.comment && <p className="text-gray-700 text-sm mb-2 pl-13">{review.comment}</p>}

                              {/* Show project title */}
                              {review.project_title && (
                                <p className="text-xs text-gray-500 pl-13">Project: {review.project_title}</p>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Load More Button if needed */}
                      {reviews.length >= 10 && (
                        <div className="text-center pt-4">
                          <Button variant="outline" size="sm">
                            Load More Reviews
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="flex justify-center mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-8 h-8 fill-gray-200 text-gray-200" />
                        ))}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
                      <p className="text-gray-500">Be the first to review this freelancer!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Dialog */}
      {canReview && eligibleForm && (
        <ReviewForm
          freelancerId={profile.user_id}
          clientId={currentUserId!}
          formId={eligibleForm.id}
          projectTitle={eligibleForm.title}
          freelancerName={displayName}
          open={showReviewForm}
          onOpenChange={setShowReviewForm}
          onSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  )
}