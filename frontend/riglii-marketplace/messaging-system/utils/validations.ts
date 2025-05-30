import { MAX_FILE_SIZE } from "../constants"

export const validateFormData = (formData: {
  title: string
  description: string
  price: string
  timeEstimate: string
}): { isValid: boolean; error?: string } => {
  if (!formData.title.trim()) {
    return { isValid: false, error: "Title is required" }
  }
  
  if (!formData.description.trim()) {
    return { isValid: false, error: "Description is required" }
  }
  
  if (!formData.price) {
    return { isValid: false, error: "Price is required" }
  }
  
  const price = Number.parseFloat(formData.price)
  if (isNaN(price) || price <= 0) {
    return { isValid: false, error: "Please enter a valid price" }
  }
  
  if (!formData.timeEstimate.trim()) {
    return { isValid: false, error: "Time estimate is required" }
  }
  
  return { isValid: true }
}

export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: `File too large. Please select a file smaller than ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
    }
  }
  
  return { isValid: true }
}