import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"

export const useAvatar = (userId: string | null | undefined) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true
    let objectUrl: string | null = null

    const fetchAvatar = async () => {
      // Reset states
      setError(null)
      
      if (!userId) {
        setAvatarUrl(null)
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        // Use the same approach as messages-dropdown.tsx
        // Try multiple file extensions for avatar files
        const possiblePaths = [
          `${userId}/avatar.webp`,
          `${userId}/avatar.jpg`,
          `${userId}/avatar.jpeg`,
          `${userId}/avatar.png`,
          `${userId}/avatar.gif`
        ]
        
        for (const path of possiblePaths) {
          try {
            const { data, error: downloadError } = await supabase.storage
              .from('avatars')
              .download(path)
            
            if (!downloadError && data && isMounted) {
              // Create object URL from blob
              objectUrl = URL.createObjectURL(data)
              setAvatarUrl(objectUrl)
              setLoading(false)
              return
            }
          } catch (err) {
            // Continue to next path
            continue
          }
        }

        // If no avatar found with any extension, set as null
        if (isMounted) {
          setAvatarUrl(null)
          setError('No avatar found')
        }
      } catch (error) {
        console.log('Error fetching avatar:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
        setAvatarUrl(null)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchAvatar()

    // Cleanup function
    return () => {
      isMounted = false
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [userId, supabase])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (avatarUrl && avatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(avatarUrl)
      }
    }
  }, [avatarUrl])

  return { avatarUrl, loading, error }
}