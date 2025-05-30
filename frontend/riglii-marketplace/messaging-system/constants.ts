export const POLLING_INTERVAL = 500 // 0.5 seconds

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const AVATAR_EXTENSIONS = ['webp', 'jpg', 'jpeg', 'png', 'gif']

export const ACCEPTED_FILE_TYPES = "image/*,.pdf,.doc,.docx,.txt"

export const COLORS = {
  primary: '#00D37F',
  primaryHover: '#00c070',
  success: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  error: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200'
  },
  warning: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  neutral: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  }
} as const