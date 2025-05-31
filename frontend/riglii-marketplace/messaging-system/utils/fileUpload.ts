// utils/fileUpload.ts
import { createClient } from '@/utils/supabase/client'

interface UploadProjectFileParams {
  file: File
  formId: string
  userId: string
}

interface ProjectFile {
  id: string
  form_id: string
  file_name: string
  file_path: string
  file_size: number
  file_type: string
  uploaded_at: string
}

export async function uploadProjectFile({ 
  file, 
  formId, 
  userId 
}: UploadProjectFileParams): Promise<ProjectFile | null> {
  const supabase = createClient()
  
  try {
    // Generate unique file name
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `${formId}_${timestamp}_${file.name}`
    const filePath = `${userId}/${fileName}`
    
    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project_submissions')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      console.error('Upload error:', uploadError)
      return null
    }
    
    // Insert record into project_files table
    const { data: fileRecord, error: dbError } = await supabase
      .from('project_files')
      .insert({
        form_id: formId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type || 'application/octet-stream'
      })
      .select()
      .single()
    
    if (dbError) {
      console.error('Database error:', dbError)
      // Clean up uploaded file
      await supabase.storage
        .from('project_submissions')
        .remove([filePath])
      return null
    }
    
    return fileRecord
  } catch (error) {
    console.error('Upload failed:', error)
    return null
  }
}

export async function getProjectFiles(formId: string): Promise<ProjectFile[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('project_files')
    .select('*')
    .eq('form_id', formId)
    .order('uploaded_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching project files:', error)
    return []
  }
  
  return data || []
}

export async function downloadProjectFile(file: ProjectFile) {
  const supabase = createClient()
  
  try {
    // Try to get a signed URL first (more reliable)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('project_submissions')
      .createSignedUrl(file.file_path, 300) // 5 minutes
    
    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError)
      
      // Fallback to direct download
      const { data, error } = await supabase.storage
        .from('project_submissions')
        .download(file.file_path)
      
      if (error) {
        throw error
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
    } else if (signedUrlData?.signedUrl) {
      // Open signed URL in new tab or download
      const a = document.createElement('a')
      a.href = signedUrlData.signedUrl
      a.download = file.file_name
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  } catch (error) {
    console.error('Download failed:', error)
    throw error
  }
}

// Helper to update the forms table with file information
export async function updateFormWithFiles(formId: string, files: ProjectFile[]) {
  const supabase = createClient()
  
  const fileData = files.map(f => ({
    file_name: f.file_name,
    file_path: f.file_path,
    file_size: f.file_size,
    file_type: f.file_type
  }))
  
  const { error } = await supabase
    .from('forms')
    .update({
      project_files: fileData,
      project_submitted: true,
      project_submitted_at: new Date().toISOString()
    })
    .eq('id', formId)
  
  if (error) {
    console.error('Error updating form:', error)
    throw error
  }
}