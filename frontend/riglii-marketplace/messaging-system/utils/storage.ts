import { createClient } from "@/utils/supabase/client"
import { AVATAR_EXTENSIONS } from "../constants"

export const fetchUserAvatar = async (userId: string): Promise<string | null> => {
  const supabase = createClient()
  
  try {
    const possiblePaths = AVATAR_EXTENSIONS.map(ext => `${userId}/avatar.${ext}`)
    
    for (const path of possiblePaths) {
      const { data } = await supabase.storage.from('avatars').download(path)
      if (data) {
        return URL.createObjectURL(data)
      }
    }
  } catch (err) {
    // No avatar found
  }
  
  return null
}

export const uploadAttachment = async (file: File, userId: string): Promise<{
  url: string | null
  type: string | null
  error?: Error
}> => {
  const supabase = createClient()
  
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}_${Date.now()}.${fileExt}`
    const filePath = `message-attachments/${fileName}`

    const { error } = await supabase.storage
      .from('message-attachments')
      .upload(filePath, file)

    if (error) throw error

    return {
      url: filePath,
      type: file.type.startsWith('image/') ? 'image' : 'file'
    }
  } catch (error) {
    return {
      url: null,
      type: null,
      error: error as Error
    }
  }
}