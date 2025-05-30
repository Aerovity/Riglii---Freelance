import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { SearchResult } from "../types"
import { fetchUserAvatar } from "../utils/storage"
import { getFullName } from "../utils/formatters"

export const useUserSearch = (currentUserId: string, isCurrentUserFreelancer: boolean | null) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const fetchRecommendedUsers = async () => {
    if (isCurrentUserFreelancer === null) return

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
            last_name
          )
        `)
        .eq('is_freelancer', !isCurrentUserFreelancer)
        .neq('id', currentUserId)
        .limit(30)
        .order('created_at', { ascending: false })

      if (error) throw error

      const results = await processUserResults(users || [])
      setSearchResults(results)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setSearching(false)
    }
  }

  const searchUsers = async (query: string) => {
    if (isCurrentUserFreelancer === null) return

    if (!query.trim()) {
      fetchRecommendedUsers()
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
            last_name
          )
        `)
        .eq('is_freelancer', !isCurrentUserFreelancer)
        .or(`email.ilike.%${query}%`)
        .neq('id', currentUserId)
        .limit(20)

      if (error) throw error

      let combinedResults = [...(users || [])]
      
      if (!isCurrentUserFreelancer) {
        const { data: freelancerProfiles } = await supabase
          .from('freelancer_profiles')
          .select(`
            user_id,
            display_name,
            occupation,
            first_name,
            last_name
          `)
          .or(`display_name.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%,occupation.ilike.%${query}%`)
          .neq('user_id', currentUserId)
          .limit(20)

        if (freelancerProfiles && freelancerProfiles.length > 0) {
          const freelancerUserIds = freelancerProfiles.map(p => p.user_id)
          const { data: freelancerUsers } = await supabase
            .from('users')
            .select(`
              id,
              email,
              is_freelancer,
              freelancer_profiles (
                display_name,
                occupation,
                first_name,
                last_name
              )
            `)
            .in('id', freelancerUserIds)
            .eq('is_freelancer', true)

          if (freelancerUsers) {
            const existingIds = new Set(combinedResults.map(u => u.id))
            freelancerUsers.forEach(fu => {
              if (!existingIds.has(fu.id)) {
                combinedResults.push(fu)
              }
            })
          }
        }
      }

      const results = await processUserResults(combinedResults)
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching users:', error)
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      })
    } finally {
      setSearching(false)
    }
  }

  const processUserResults = async (users: any[]): Promise<SearchResult[]> => {
    return Promise.all(
      users.map(async (userData) => {
        const avatarUrl = await fetchUserAvatar(userData.id)
        const fullName = getFullName(userData)

        return {
          id: userData.id,
          email: userData.email,
          full_name: fullName,
          avatar_url: avatarUrl,
          is_freelancer: userData.is_freelancer,
          freelancer_profile: userData.freelancer_profiles?.[0] || null
        }
      })
    )
  }

  return {
    searchResults,
    searching,
    searchUsers,
    fetchRecommendedUsers
  }
}