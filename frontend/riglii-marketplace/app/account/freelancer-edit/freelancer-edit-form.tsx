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
import { ArrowLeft, Upload, X, Plus, Image as ImageIcon } from 'lucide-react'

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

export default function FreelancerEditForm({ user }: { user: User | null }) {
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [profile, setProfile] = useState<Partial<FreelancerProfile>>({
    first_name: null,
    last_name: null,
    display_name: null,
    description: null,
    occupation: null,
    custom_occupation: null,
    profile_picture_url: null,
    price: null
  })
  const [portfolioDocuments, setPortfolioDocuments] = useState<FreelancerDocument[]>([])

  const getProfile = useCallback(async () => {
    try {
      setLoading(true)

      if (!user?.id) return

      // Get freelancer profile
      const { data: profileData, error: profileError } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      if (profileData) {
        setProfile(profileData)

        // Get portfolio documents
        const { data: documentsData, error: documentsError } = await supabase
          .from('freelancer_documents')
          .select('*')
          .eq('freelancer_id', profileData.id)
          .eq('document_type', 'portfolio')
          .order('created_at', { ascending: false })

        if (documentsError) {
          console.error('Error loading documents:', documentsError)
        } else {
          setPortfolioDocuments(documentsData || [])
        }
      }
    } catch (error) {
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
      const filePath = `${user.id}/${fileName}`

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
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
      return null
    }
  }

  const handlePortfolioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      if (!profile.id) {
        toast({
          title: "Error",
          description: "Please save your profile first before uploading portfolio images",
          variant: "destructive",
        })
        return
      }

      if (portfolioDocuments.length >= 6) {
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
        // Create document record
        const { data, error } = await supabase
          .from('freelancer_documents')
          .insert({
            freelancer_id: profile.id,
            document_type: 'portfolio',
            document_url: filePath,
            verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) {
          throw error
        }

        if (data) {
          setPortfolioDocuments(prev => [data, ...prev])
          toast({
            title: "Success",
            description: "Portfolio image uploaded successfully!",
          })
        }
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

  const removePortfolioImage = async (document: FreelancerDocument) => {
    try {
      // Remove from storage
      const { error: storageError } = await supabase.storage
        .from('portfolio')
        .remove([document.document_url])

      if (storageError) {
        console.error('Error removing image from storage:', storageError)
      }

      // Remove from database
      const { error: dbError } = await supabase
        .from('freelancer_documents')
        .delete()
        .eq('id', document.id)

      if (dbError) {
        throw dbError
      }

      // Remove from state
      setPortfolioDocuments(prev => prev.filter(doc => doc.id !== document.id))

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

      if (!user?.id) {
        throw new Error("User not authenticated")
      }

      // First check if profile exists
      const { data: existingProfile } = await supabase
        .from('freelancer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      let result
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('freelancer_profiles')
          .update({
            first_name: profile.first_name,
            last_name: profile.last_name,
            display_name: profile.display_name,
            description: profile.description,
            occupation: profile.occupation,
            custom_occupation: profile.custom_occupation,
            profile_picture_url: profile.profile_picture_url,
            price: profile.price,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .select()
          .single()
      } else {
        // Insert new profile
        result = await supabase
          .from('freelancer_profiles')
          .insert({
            user_id: user.id,
            first_name: profile.first_name,
            last_name: profile.last_name,
            display_name: profile.display_name,
            description: profile.description,
            occupation: profile.occupation,
            custom_occupation: profile.custom_occupation,
            profile_picture_url: profile.profile_picture_url,
            price: profile.price,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()
      }

      const { data, error } = result

      if (error) throw error

      if (data) {
        setProfile(data)
      }

      toast({
        title: "Success",
        description: "Freelancer profile updated successfully!",
      })
      
      router.push("/account")
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error updating profile!",
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
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={profile.display_name || ""}
                  onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="Enter your display name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (DZD)</Label>
                <Input
                  id="price"
                  type="number"
                  min="1"
                  step="1"
                  value={profile.price || ""}
                  onChange={(e) => setProfile(prev => ({ ...prev, price: parseFloat(e.target.value) || null }))}
                  placeholder="Enter your price in DZD"
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
                  <div>
                    <Label>Portfolio Images</Label>
                    <p className="text-sm text-muted-foreground">
                      {portfolioDocuments.length} of 6 images uploaded
                    </p>
                  </div>
                  {profile.id ? (
                    <div className="relative">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading || portfolioDocuments.length >= 6}
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
                        disabled={uploading || portfolioDocuments.length >= 6}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Save profile first to upload images</p>
                  )}
                </div>

                {portfolioDocuments.length === 0 ? (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 mb-2">No portfolio images uploaded yet</p>
                    <p className="text-sm text-gray-500">
                      {profile.id 
                        ? "Click 'Add Image' to upload your work samples" 
                        : "Save your profile first, then add portfolio images"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {portfolioDocuments.map((document, index) => (
                      <div key={document.id} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                          <img
                            src={`${supabase.storage.from('portfolio').getPublicUrl(document.document_url).data.publicUrl}`}
                            alt={`Portfolio image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removePortfolioImage(document)}
                          >
                            <X className="h-4 w-4" />
                            <span className="ml-1">Remove</span>
                          </Button>
                        </div>
                        <p className="text-xs text-center mt-2 text-gray-600">
                          Image {index + 1}
                        </p>
                      </div>
                    ))}
                    
                    {/* Placeholder slots to show remaining capacity */}
                    {Array.from({ length: Math.max(0, 6 - portfolioDocuments.length) }).map((_, index) => (
                      <div key={`placeholder-${index}`} className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Empty slot</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {portfolioDocuments.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Upload high-quality images that showcase your best work. 
                      {6 - portfolioDocuments.length > 0 && ` You can add ${6 - portfolioDocuments.length} more image${6 - portfolioDocuments.length === 1 ? '' : 's'}.`}
                    </p>
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