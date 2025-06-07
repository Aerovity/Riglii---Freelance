import { useState, useCallback, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import type { PublicUser } from "../types"

export const useUserSearch = (currentUserId: string, isCurrentUserFreelancer: boolean | null) => {
  const [searchResults, setSearchResults] = useState<PublicUser[]>([])
  const [searching, setSearching] = useState(false)
  const supabase = createClient()
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchRecommendedUsers = useCallback(async () => {
    if (isCurrentUserFreelancer === null || !currentUserId) {
      console.log('Missing user info for recommendations')
      return
    }

    try {
      setSearching(true)
      
      // Fetch opposite type users (clients for freelancers, freelancers for clients)
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

      if (error) {
        console.error('Error fetching recommended users:', error)
        throw error
      }

      // Process users
      const results: PublicUser[] = (users || []).map(userData => {
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

      console.log(`Found ${results.length} recommended users`)
      setSearchResults(results)
    } catch (error) {
      console.error('Error fetching users:', error)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [currentUserId, isCurrentUserFreelancer, supabase])

  const searchUsers = useCallback(async (query: string) => {
    if (isCurrentUserFreelancer === null || !currentUserId) {
      console.log('Missing user info for search')
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

    // Debounce the search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setSearching(true)
        
        const targetType = !isCurrentUserFreelancer
        
        // Build the query
        let queryBuilder = supabase
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
          .neq('id', currentUserId)
          .limit(20)

        // For email search
        const { data: emailResults, error: emailError } = await queryBuilder
          .ilike('email', `%${query}%`)

        if (emailError) {
          console.error('Email search error:', emailError)
          throw emailError
        }

        let combinedResults = [...(emailResults || [])]
        
        // If searching for freelancers, also search in profiles
        if (targetType === true) {
          // Search in freelancer profiles separately
          const { data: profileResults } = await supabase
            .from('freelancer_profiles')
            .select(`
              user_id,
              display_name,
              occupation,
              first_name,
              last_name,
              profile_picture_url
            `)
            .or(`display_name.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
            .limit(20)

          if (profileResults) {
            // Get user data for these profiles
            const userIds = profileResults.map(p => p.user_id).filter(id => id !== currentUserId)
            if (userIds.length > 0) {
              const { data: usersFromProfiles } = await supabase
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
                .in('id', userIds)
                .eq('is_freelancer', true)

              if (usersFromProfiles) {
                // Merge without duplicates
                const existingIds = new Set(combinedResults.map(u => u.id))
                usersFromProfiles.forEach(user => {
                  if (!existingIds.has(user.id)) {
                    combinedResults.push(user)
                  }
                })
              }
            }
          }
        }

        // Process results
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

        console.log(`Search found ${results.length} users`)
        setSearchResults(results)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300) // 300ms debounce
  }, [currentUserId, isCurrentUserFreelancer, fetchRecommendedUsers, supabase])

  return {
    searchResults,
    searching,
    searchUsers,
    fetchRecommendedUsers
  }
}