export const getTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + " years ago"
  
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + " months ago"
  
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + " days ago"
  
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + " hours ago"
  
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + " minutes ago"
  
  return "just now"
}

export const getUserInitials = (name: string): string => {
  if (!name) return '??'
  const names = name.split(' ')
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`
}

export const getFullName = (userData: any): string => {
  if (!userData) return 'Unknown User'
  
  // Try freelancer profile first
  if (userData.freelancer_profiles?.[0]) {
    const profile = userData.freelancer_profiles[0]
    return profile.display_name || 
           `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
           userData.email?.split('@')[0] || 
           'Unknown User'
  }
  
  // Fallback to email
  return userData.email?.split('@')[0] || 'Unknown User'
}