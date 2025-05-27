"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Upload, User } from "lucide-react"

export default function Avatar({
  uid,
  url,
  size,
  onUpload,
}: {
  uid: string | null
  url: string | null
  size: number
  onUpload: (url: string) => void
}) {
  const supabase = createClient()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(url)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function downloadImage(path: string) {
      try {
        const { data, error } = await supabase.storage.from("avatars").download(path)
        if (error) {
          throw error
        }

        const url = URL.createObjectURL(data)
        setAvatarUrl(url)
      } catch (error) {
        console.log("Error downloading image: ", error)
      }
    }

    if (url) downloadImage(url)
  }, [url, supabase])

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.")
      }

      const file = event.target.files[0]
      const fileExt = file.name.split(".").pop()
      const filePath = `${uid}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      onUpload(filePath)
    } catch (error) {
      alert("Error uploading avatar!")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        {avatarUrl ? (
          <Image
            width={size}
            height={size}
            src={avatarUrl || "/placeholder.svg"}
            alt="Avatar"
            className="rounded-full object-cover border-4 border-border"
            style={{ height: size, width: size }}
          />
        ) : (
          <div
            className="rounded-full bg-muted flex items-center justify-center border-4 border-border"
            style={{ height: size, width: size }}
          >
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center">
        <Button variant="outline" size="sm" disabled={uploading} className="relative overflow-hidden" asChild>
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Avatar"}
          </label>
        </Button>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="sr-only"
        />
      </div>
    </div>
  )
}
