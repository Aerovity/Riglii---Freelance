"use client"
import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Upload, X, Plus } from 'lucide-react'
import Avatar from "../avatar"

interface FreelancerProfile {
  first_name: string | null
  last_name: string | null
  display_name: string | null
  description: string | null
  occupation: string | null
  custom_occupation: string | null
  profile_picture_url: string | null
  price: number | null  // Changed from hourly_rate to price
  portfolio_images: string[]
}

export default function FreelancerEditForm({ user }: { user: User | null }) {
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [profile, setProfile] = useState<FreelancerProfile>({
  first_name: null,
  last_name: null,
  display_name: null,
  description: null,
  occupation: null,
  custom_occupation: null,
  profile_picture_url: null,
  price: null,  // Changed from hourly_rate to price
  portfolio_images: []
})

  const getProfile = useCallback(async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

    if (data) {
        setProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        display_name: data.display_name,
        description: data.description,
        occupation: data.occupation,
        custom_occupation: data.custom_occupation,
        profile_picture_url: data.profile_picture_url,
        price: data.price,  // Changed from hourly_rate to price
        portfolio_images: data.portfolio_images || []
    })
    }} catch (error) {
      console.error('Error loading profile:', error)
      toast({
        title: "Error",
        description: "Error loading freelancer profile!",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [user?.id, supabase, toast])

  useEffect(() => {
    if (user?.id) {
      getProfile()
    }
  }, [user?.id, getProfile])

  const uploadPortfolioImage = async (file: File): Promise<string | null> => {
    try {
      if (!user?.id) return null

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/portfolio/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      return filePath
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  const handlePortfolioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      if (profile.portfolio_images.length >= 6) {
        toast({
          title: "Limit reached",
          description: "You can upload maximum 6 portfolio images",
          variant: "destructive",
        })
        return
      }

      const file = event.target.files[0]
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size must be less than 5MB")
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        throw new Error("File type not supported. Please upload a JPG, PNG, GIF, or WebP image.")
      }

      const filePath = await uploadPortfolioImage(file)
      
      if (filePath) {
        setProfile(prev => ({
          ...prev,
          portfolio_images: [...prev.portfolio_images, filePath]
        }))

        toast({
          title: "Success",
          description: "Portfolio image uploaded successfully!",
        })
      }

      // Clear the input
      event.target.value = ""

    } catch (error) {
      console.error("Portfolio upload error:", error)
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      }
    } finally {
      setUploading(false)
    }
  }

  const removePortfolioImage = async (imageUrl: string, index: number) => {
    try {
      // Remove from storage
      const { error } = await supabase.storage
        .from('portfolio')
        .remove([imageUrl])

      if (error) {
        console.error('Error removing image from storage:', error)
      }

      // Remove from state
      setProfile(prev => ({
        ...prev,
        portfolio_images: prev.portfolio_images.filter((_, i) => i !== index)
      }))

      toast({
        title: "Success",
        description: "Portfolio image removed successfully!",
      })
    } catch (error) {
      console.error('Error removing image:', error)
      toast({
        title: "Error",
        description: "Error removing image",
        variant: "destructive",
      })
    }
  }

  const updateProfile = async () => {
    try {
      setLoading(true)

      const updates = {
        user_id: user?.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        display_name: profile.display_name,
        description: profile.description,
        occupation: profile.occupation,
        custom_occupation: profile.custom_occupation,
        profile_picture_url: profile.profile_picture_url,
        hourly_rate: profile.price,
        portfolio_images: profile.portfolio_images,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('freelancer_profiles')
        .upsert(updates, { onConflict: 'user_id' })

      if (error) throw error

      toast({
        title: "Success",
        description: "Freelancer profile updated successfully!",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Error updating profile!",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading && !profile.first_name) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D37F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/account")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Edit Freelancer Profile</CardTitle>
              <CardDescription>
                Update your professional profile that clients will see
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex justify-center">
                <Avatar
                  uid={user?.id ?? null}
                  url={profile.profile_picture_url}
                  size={120}
                  onUpload={(url) => {
                    setProfile(prev => ({ ...prev, profile_picture_url: url }))
                  }}
                />
              </div>

              <Separator />

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.first_name || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Enter your first name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.last_name || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

            <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
                id="price"
                type="number"
                min="1"
                step="0.01"
                value={profile.price || ""}
                onChange={(e) => setProfile(prev => ({ ...prev, price: parseFloat(e.target.value) || null }))}
                placeholder="Enter your price"
            />
            </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Select
                  value={profile.occupation || ""}
                  onValueChange={(value) => setProfile(prev => ({ ...prev, occupation: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your occupation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web-developer">Web Developer</SelectItem>
                    <SelectItem value="graphic-designer">Graphic Designer</SelectItem>
                    <SelectItem value="content-writer">Content Writer</SelectItem>
                    <SelectItem value="digital-marketer">Digital Marketer</SelectItem>
                    <SelectItem value="photographer">Photographer</SelectItem>
                    <SelectItem value="video-editor">Video Editor</SelectItem>
                    <SelectItem value="translator">Translator</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {profile.occupation === "other" && (
                <div className="space-y-2">
                  <Label htmlFor="customOccupation">Custom Occupation</Label>
                  <Input
                    id="customOccupation"
                    value={profile.custom_occupation || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, custom_occupation: e.target.value }))}
                    placeholder="Enter your custom occupation"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="1"
                  step="0.01"
                  value={profile.price || ""}
                  onChange={(e) => setProfile(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || null }))}
                  placeholder="Enter your hourly rate"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={profile.description || ""}
                  onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your services, experience, and what makes you unique..."
                  className="min-h-[120px]"
                />
              </div>

              <Separator />

              {/* Portfolio Images */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Portfolio Images (Max 6)</Label>
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading || profile.portfolio_images.length >= 6}
                      className="relative"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Image
                        </>
                      )}
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePortfolioUpload}
                      disabled={uploading || profile.portfolio_images.length >= 6}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {profile.portfolio_images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {profile.portfolio_images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={`${supabase.storage.from('portfolio').getPublicUrl(imageUrl).data.publicUrl}`}
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          onClick={() => removePortfolioImage(imageUrl, index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex gap-4">
                <Button
                  onClick={updateProfile}
                  disabled={loading}
                  className="flex-1 bg-[#00D37F] hover:bg-[#00c070]"
                >
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/account")}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
