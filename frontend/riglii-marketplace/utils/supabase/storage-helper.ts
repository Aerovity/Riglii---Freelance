import { createClient } from "@/utils/supabase/client"

/**
 * Get a signed URL for a document stored in private storage
 * @param documentPath - The path to the document in storage
 * @param expiresIn - How long the URL should be valid (in seconds), default 1 hour
 * @returns The signed URL or null if error
 */
export async function getSignedDocumentUrl(documentPath: string, expiresIn: number = 3600) {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from('freelancer-documents')
    .createSignedUrl(documentPath, expiresIn)
    
  if (error) {
    console.error('Error creating signed URL:', error)
    return null
  }
  
  return data.signedUrl
}

/**
 * Download a document from private storage
 * @param documentPath - The path to the document in storage
 * @returns Blob data or null if error
 */
export async function downloadDocument(documentPath: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from('freelancer-documents')
    .download(documentPath)
    
  if (error) {
    console.error('Error downloading document:', error)
    return null
  }
  
  return data
}

/**
 * Delete a document from storage
 * @param documentPath - The path to the document in storage
 * @returns true if successful, false otherwise
 */
export async function deleteDocument(documentPath: string) {
  const supabase = createClient()
  
  const { error } = await supabase.storage
    .from('freelancer-documents')
    .remove([documentPath])
    
  if (error) {
    console.error('Error deleting document:', error)
    return false
  }
  
  return true
}