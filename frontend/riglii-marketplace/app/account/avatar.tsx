"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar as UIAvatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AvatarProps {
  uid: string | null
  url: string | null
  size: number
  onUpload: (url: string) => void
}

export default function Avatar({ uid, url, size, onUpload }: AvatarProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function downloadImage(path: string) {
      try {
        const { data, error } = await supabase.storage.from('avatars').download(path)
        if (error) {
          throw error
        }
        const url = URL.createObjectURL(data)
        setAvatarUrl(url)
      } catch (error) {
        console.log('Error downloading image: ', error)
        setAvatarUrl(null)
      }
    }
    if (url) downloadImage(url)

    // Cleanup function to revoke object URL when component unmounts or URL changes
    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl)
      }
    }
  }, [url, supabase])

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      if (!uid) {
        throw new Error("User ID is required")
      }

      const file = event.target.files[0]
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error("Image size must be less than 2MB")
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        throw new Error("File type not supported. Please upload a JPG, PNG, GIF, or WebP image.")
      }

      // Better file path structure: userId/avatar.extension
      const fileExt = file.name.split('.').pop()
      const filePath = `${uid}/avatar.${fileExt}`

      // Remove existing avatar first (optional - helps with caching)
      try {
        await supabase.storage.from('avatars').remove([filePath])
      } catch (removeError) {
        // Ignore error if file doesn't exist
        console.log('No existing file to remove')
      }

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // This allows overwriting existing files
      })

      if (uploadError) {
        throw uploadError
      }

      onUpload(filePath)

      toast({
        title: "Success",
        description: "Avatar uploaded successfully!",
      })

      // Clear the input
      event.target.value = ""

    } catch (error) {
      console.error("Avatar upload error:", error)
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Error uploading avatar!",
          variant: "destructive",
        })
      }
    } finally {
      setUploading(false)
    }
  }

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!uid) return "?"
    return uid.substring(0, 2).toUpperCase()
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <UIAvatar
          className="h-[120px] w-[120px] border-4 border-background shadow-md"
          style={{ width: size, height: size }}
        >
          <AvatarImage src={avatarUrl || ""} alt="Profile picture" />
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">{getInitials()}</AvatarFallback>
        </UIAvatar>

        <div className="absolute bottom-0 right-0">
          <div className="relative">
            <Button 
              size="sm" 
              variant="secondary" 
              className="rounded-full h-9 w-9 p-0 shadow-md" 
              disabled={uploading}
              type="button"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span className="sr-only">Upload avatar</span>
            </Button>
            <input
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              type="file"
              id={`avatar-upload-${uid}`}
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
              aria-label="Upload avatar"
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-1">
        {uploading ? "Uploading..." : "Click the button to upload"}
      </p>
    </div>
  )
}