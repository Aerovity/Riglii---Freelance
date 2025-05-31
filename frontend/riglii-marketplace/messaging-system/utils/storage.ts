// utils/storage.ts
import { createClient } from '@/utils/supabase/client'

// Existing function for message attachments
export async function uploadAttachment(file: File, userId: string) {
  const supabase = createClient()
  
  try {
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${timestamp}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('message-attachments')
      .upload(fileName, file)
    
    if (error) {
      console.error('Upload error:', error)
      return { error: error.message, url: null, type: null }
    }
    
    const type = file.type.startsWith('image/') ? 'image' : 'file'
    
    return {
      error: null,
      url: fileName,
      type
    }
  } catch (error) {
    console.error('Upload failed:', error)
    return { error: 'Upload failed', url: null, type: null }
  }
}

// New function for project file downloads
export async function downloadProjectFile(file: any) {
  const supabase = createClient()
  
  try {
    console.log('Attempting to download:', file.file_path)
    
    // First try to get a signed URL (most reliable)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('project_submissions')
      .createSignedUrl(file.file_path, 300) // 5 minutes
    
    if (!signedUrlError && signedUrlData?.signedUrl) {
      // Open signed URL in new tab
      const a = document.createElement('a')
      a.href = signedUrlData.signedUrl
      a.download = file.file_name
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      return { success: true }
    }
    
    // If signed URL fails, try direct download
    const { data, error } = await supabase.storage
      .from('project_submissions')
      .download(file.file_path)
    
    if (error) {
      console.error('Direct download error:', error)
      
      // Last resort: try public URL
      const { data: publicUrlData } = supabase.storage
        .from('project_submissions')
        .getPublicUrl(file.file_path)
      
      if (publicUrlData?.publicUrl) {
        window.open(publicUrlData.publicUrl, '_blank')
        return { success: true }
      }
      
      throw new Error('Unable to download file')
    }
    
    // Create blob and download
    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = file.file_name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    return { success: true }
  } catch (error) {
    console.error('Download failed:', error)
    return { success: false, error: error.message }
  }
}

// Function to fetch project files from storage
export async function fetchProjectFilesFromStorage(formId: string, possibleFolders: string[]) {
  const supabase = createClient()
  const foundFiles: any[] = []
  
  for (const folderId of possibleFolders) {
    try {
      const { data: filesInFolder, error } = await supabase.storage
        .from('project_submissions')
        .list(folderId, {
          limit: 100,
          offset: 0
        })
      
      if (!error && filesInFolder?.length) {
        // Filter files that belong to this form
        const formFiles = filesInFolder.filter(file => 
          file.name.includes(formId)
        )
        
        if (formFiles.length > 0) {
          const transformedFiles = formFiles.map(file => {
            // Extract clean filename from format: formId_timestamp_originalFilename
            const nameParts = file.name.split('_')
            const cleanName = nameParts.length >= 3 
              ? nameParts.slice(2).join('_') 
              : file.name
            
            return {
              file_name: cleanName,
              file_path: `${folderId}/${file.name}`,
              file_size: file.metadata?.size || 0,
              file_type: file.metadata?.mimetype || 'application/octet-stream',
              full_name: file.name
            }
          })
          
          foundFiles.push(...transformedFiles)
        }
      }
    } catch (err) {
      console.error(`Error checking folder ${folderId}:`, err)
      continue
    }
  }
  
  return foundFiles
}

// Function to upload project files (for ProjectSubmission component)
export async function uploadProjectFiles(files: File[], formId: string, userId: string) {
  const supabase = createClient()
  const uploadedFiles: any[] = []
  const errors: string[] = []
  
  for (const file of files) {
    try {
      const timestamp = Date.now()
      const fileName = `${formId}_${timestamp}_${file.name}`
      const filePath = `${userId}/${fileName}`
      
      const { data, error } = await supabase.storage
        .from('project_submissions')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (error) {
        errors.push(`Failed to upload ${file.name}: ${error.message}`)
        continue
      }
      
      uploadedFiles.push({
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type || 'application/octet-stream'
      })
    } catch (err) {
      errors.push(`Failed to upload ${file.name}: ${err.message}`)
    }
  }
  
  return { uploadedFiles, errors }
}