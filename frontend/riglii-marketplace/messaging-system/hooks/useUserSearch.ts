import { useState, useCallback, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import type { PublicUser } from "../types"

export const useUserSearch = (currentUserId: string, isCurrentUserFreelancer: boolean | null) => {
  const [searchResults, setSearchResults] = useState<PublicUser[]>([])
  const [searching, setSearching] = useState(false)
  const supabase = createClient()
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Helper to get avatar URL without fetching
  const getAvatarUrl = (userId: string): string | undefined => {
    // Instead of fetching, construct the public URL
    // This avoids 400 errors for missing avatars
    return undefined // We'll skip avatars for now to make it smooth
  }

  const fetchRecommendedUsers = useCallback(async () => {
    if (isCurrentUserFreelancer === null || searching) {
      return
    }

    try {
      setSearching(true)
      
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          is_freelancer,
          freelancer_profiles (
            display_name,
            occupation,
            first_name,
            last_name,
            profile_picture_url
          )
        `)
        .eq('is_freelancer', !isCurrentUserFreelancer)
        .neq('id', currentUserId)
        .limit(10)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Process users without fetching avatars
      const results: PublicUser[] = (users || []).map(userData => {
        let fullName = userData.email.split('@')[0]
        let avatarUrl = undefined
        
        if (userData.is_freelancer && userData.freelancer_profiles?.[0]) {
          const profile = userData.freelancer_profiles[0]
          fullName = profile.display_name || 
                    `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
                    fullName
          // Use profile picture URL if available
          avatarUrl = profile.profile_picture_url
        }

        return {
          id: userData.id,
          email: userData.email,
          full_name: fullName,
          avatar_url: avatarUrl,
          is_freelancer: userData.is_freelancer
        }
      })

      setSearchResults(results)
    } catch (error) {
      console.error('Error fetching users:', error)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [currentUserId, isCurrentUserFreelancer, searching])

  const searchUsers = useCallback(async (query: string) => {
    if (isCurrentUserFreelancer === null) {
      return
    }

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!query.trim()) {
      fetchRecommendedUsers()
      return
    }

    // Debounce the search to make it smoother
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setSearching(true)
        
        const targetType = !isCurrentUserFreelancer
        
        // Search in users table
        const { data: users, error } = await supabase
          .from('users')
          .select(`
            id,
            email,
            is_freelancer,
            freelancer_profiles (
              display_name,
              occupation,
              first_name,
              last_name,
              profile_picture_url
            )
          `)
          .eq('is_freelancer', targetType)
          .ilike('email', `%${query}%`)
          .neq('id', currentUserId)
          .limit(20)

        if (error) throw error

        let combinedResults = [...(users || [])]
        
        // If searching for freelancers, also search in profiles
        if (targetType === true) {
          const { data: profileSearchResults } = await supabase
            .from('users')
            .select(`
              id,
              email,
              is_freelancer,
              freelancer_profiles!inner (
                display_name,
                occupation,
                first_name,
                last_name,
                profile_picture_url
              )
            `)
            .eq('is_freelancer', true)
            .neq('id', currentUserId)
            .or(`freelancer_profiles.display_name.ilike.%${query}%,freelancer_profiles.first_name.ilike.%${query}%,freelancer_profiles.last_name.ilike.%${query}%`, { foreignTable: 'freelancer_profiles' })
            .limit(20)

          if (profileSearchResults) {
            // Merge without duplicates
            const existingIds = new Set(combinedResults.map(u => u.id))
            profileSearchResults.forEach(user => {
              if (!existingIds.has(user.id)) {
                combinedResults.push(user)
              }
            })
          }
        }

        // Process results without fetching avatars
        const results: PublicUser[] = combinedResults.map(userData => {
          let fullName = userData.email.split('@')[0]
          let avatarUrl = undefined
          
          if (userData.is_freelancer && userData.freelancer_profiles?.[0]) {
            const profile = userData.freelancer_profiles[0]
            fullName = profile.display_name || 
                      `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
                      fullName
            avatarUrl = profile.profile_picture_url
          }

          return {
            id: userData.id,
            email: userData.email,
            full_name: fullName,
            avatar_url: avatarUrl,
            is_freelancer: userData.is_freelancer
          }
        })

        setSearchResults(results)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300) // 300ms debounce
  }, [currentUserId, isCurrentUserFreelancer, fetchRecommendedUsers])

  return {
    searchResults,
    searching,
    searchUsers,
    fetchRecommendedUsers
  }
}