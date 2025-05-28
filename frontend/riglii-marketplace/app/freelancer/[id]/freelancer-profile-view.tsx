"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Star,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  MessageCircle,
  Heart,
  Share2,
  Award,
  Download,
  X,
  Maximize2,
} from "lucide-react"

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

interface UserData {
  id: string
  email: string
  user_metadata?: {
    avatar_url?: string
    full_name?: string
    name?: string
  }
}

export default function FreelancerProfileView({
  profile,
  userData,
  portfolioImages,
  certificates,
}: {
  profile: FreelancerProfile
  userData: UserData | null
  portfolioImages: FreelancerDocument[]
  certificates: FreelancerDocument[]
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [portfolioImageUrls, setPortfolioImageUrls] = useState<string[]>([])
  const [certificateUrls, setCertificateUrls] = useState<string[]>([])
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const supabase = createClient()

  // Get the Supabase project URL for constructing direct URLs
  const getSupabaseUrl = () => {
    // This gets the URL from your Supabase client configuration
    const { url } = supabase.storage.from("avatars")
    return url || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  }

  // Function to download avatar image from Supabase storage using user ID
  // This avatar is stored in the "avatars" bucket and cannot be changed or replaced
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
        `${userId}.gif`
      ]

      for (const path of possiblePaths) {
        try {
          const { data, error } = await supabase.storage.from('avatars').download(path)
          if (!error && data) {
            const url = URL.createObjectURL(data)
            setAvatarUrl(url)
            console.log(`Avatar found at path: ${path}`)
            return
          }
        } catch (err) {
          // Continue to next path
          continue
        }
      }

      // If no avatar found with any path
      console.log("No avatar found for user:", userId)
      setAvatarUrl(null)
    } catch (error) {
      console.log('Error downloading avatar image: ', error)
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
            console.error("Error downloading portfolio image:", error)
            const publicUrl = supabase.storage.from("portfolio").getPublicUrl(image.document_url).data.publicUrl
            urls.push(publicUrl)
          } else {
            const url = URL.createObjectURL(data)
            urls.push(url)
          }
        } catch (err) {
          console.error("Error processing portfolio image:", err)
          urls.push("/placeholder.svg?height=400&width=600")
        }
      }

      setPortfolioImageUrls(urls)
    } catch (error) {
      console.error("Error downloading portfolio images:", error)
    }
  }

  // Function to download certificate images
  const downloadCertificates = async () => {
    try {
      const urls: string[] = []

      for (const cert of certificates) {
        try {
          const { data, error } = await supabase.storage.from("certificates").download(cert.document_url)
          if (error) {
            console.error("Error downloading certificate:", error)
            const publicUrl = supabase.storage.from("certificates").getPublicUrl(cert.document_url).data.publicUrl
            urls.push(publicUrl)
          } else {
            const url = URL.createObjectURL(data)
            urls.push(url)
          }
        } catch (err) {
          console.error("Error processing certificate:", err)
          urls.push("/placeholder.svg?height=300&width=400")
        }
      }

      setCertificateUrls(urls)
    } catch (error) {
      console.error("Error downloading certificates:", error)
    }
  }

  // Download avatar on component mount or when user_id changes
  useEffect(() => {
    // Download avatar using user ID - this is immutable and from the avatars bucket
    if (profile.user_id) {
      downloadAvatar(profile.user_id)
    }

    // Cleanup function to revoke object URL when component unmounts
    return () => {
      if (avatarUrl && avatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(avatarUrl)
      }
    }
  }, [profile.user_id])

  // Download portfolio and certificates on component mount
  useEffect(() => {
    if (portfolioImages.length > 0) {
      downloadPortfolioImages()
    }

    if (certificates.length > 0) {
      downloadCertificates()
    }

    // Cleanup function for portfolio and certificate URLs only
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
  }, [portfolioImages, certificates])

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <Avatar className="w-24 h-24 mx-auto">
                      <AvatarImage 
                        src={avatarUrl || ""} 
                        alt={displayName}
                        onError={(e) => {
                          console.error("Avatar image failed to load, trying fallback")
                          // Don't hide the image, let the fallback show
                        }}
                      />
                      <AvatarFallback className="text-2xl bg-[#00D37F] text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h1 className="text-2xl font-bold">{displayName}</h1>
                      {occupation && <p className="text-gray-600 mt-1">{occupation}</p>}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">5.0 (0 reviews)</span>
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
                      <Button className="w-full bg-[#00D37F] hover:bg-[#00c070] text-white">Contact Freelancer</Button>
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
                      <p className="text-sm text-gray-600">Algeria</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Languages</p>
                      <p className="text-sm text-gray-600">Arabic, French</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Portfolio & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Portfolio Gallery */}
              {portfolioImageUrls.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Portfolio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden group cursor-pointer"
                           onClick={() => setIsLightboxOpen(true)}>
                        <img
                          src={portfolioImageUrls[currentImageIndex] || "/placeholder.svg?height=400&width=600"}
                          alt={`Portfolio image ${currentImageIndex + 1}`}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          onError={(e) => {
                            console.error("Error loading portfolio image at index:", currentImageIndex)
                            e.currentTarget.src = "/placeholder.svg?height=400&width=600"
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
                          maxWidth: '100%',
                          maxHeight: '100%',
                          width: 'auto',
                          height: 'auto'
                        }}
                        onError={(e) => {
                          console.error("Error loading fullscreen portfolio image")
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

              {/* Certificates Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Certificates & Qualifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {certificateUrls.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {certificateUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                            <img
                              src={url || "/placeholder.svg?height=300&width=400"}
                              alt={`Certificate ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error("Error loading certificate at index:", index)
                                e.currentTarget.src = "/placeholder.svg?height=300&width=400"
                              }}
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg">
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                              onClick={() => {
                                // Open certificate in new tab for viewing
                                window.open(url, "_blank")
                              }}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                          <p className="text-xs text-center mt-2 text-gray-600">
                            Certificate {index + 1}
                            {certificates[index]?.verified && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Verified
                              </Badge>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No certificates uploaded yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Skills/Occupation */}
              {occupation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Skills & Expertise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="text-sm">
                      {occupation}
                    </Badge>
                  </CardContent>
                </Card>
              )}

              {/* Reviews Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="flex justify-center mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">5.0 out of 5</h3>
                    <p className="text-gray-600 mb-4">Based on 0 reviews</p>
                    <p className="text-gray-500">No reviews yet. Be the first to review this freelancer!</p>
                  </div>
                </CardContent>
              </Card>

              {/* Comments Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No comments yet.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}