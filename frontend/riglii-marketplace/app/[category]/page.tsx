"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { useLanguage } from "@/app/language-provider"
import FreelancerCard from "@/components/freelancer-card"

interface FreelancerData {
  id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
  description: string | null
  occupation: string | null
  custom_occupation: string | null
  price: number | null
  users?: {
    email: string
  }
}

type SortOption = "default" | "price_low_high" | "price_high_low"

export default function CategoryPage() {
  const params = useParams()
  const { t } = useLanguage()
  const category = ((params?.category as string) || "").replace(/-/g, " ")

  const [freelancers, setFreelancers] = useState<FreelancerData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [sortBy, setSortBy] = useState<SortOption>("default")

  const itemsPerPage = 8
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const supabase = createClient()

  const fetchFreelancers = async (page: number, sort: SortOption) => {
    setLoading(true)
    try {
      // First, get freelancer profiles with category search
      let query = supabase.from("public_freelancer_profiles").select(`*`)

      const searchTerm = category.toLowerCase()

      // Use a simpler or condition without complex formatting
      query = query.or(
        `occupation.ilike.%${searchTerm}%,` +
          `custom_occupation.ilike.%${searchTerm}%,` +
          `description.ilike.%${searchTerm}%,` +
          `display_name.ilike.%${searchTerm}%,` +
          `first_name.ilike.%${searchTerm}%,` +
          `last_name.ilike.%${searchTerm}%`,
      )

      // Apply sorting
      switch (sort) {
        case "price_low_high":
          query = query.order("price", { ascending: true, nullsLast: true })
          break
        case "price_high_low":
          query = query.order("price", { ascending: false, nullsFirst: true })
          break
        default:
          query = query.order("created_at", { ascending: false })
      }

      // Apply pagination
      const from = (page - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      const { data: freelancerData, error: freelancerError } = await query

      if (freelancerError) {
        console.error("Error fetching freelancers:", freelancerError)
        return
      }

      if (!freelancerData || freelancerData.length === 0) {
        setFreelancers([])
        setTotalCount(0)
        return
      }

      // Get user data and filter by is_freelancer = true
      const userIds = freelancerData.map((f) => f.user_id)
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, email, is_freelancer") // Removed user_metadata
        .in("id", userIds)
        .eq("is_freelancer", true) // Only get users where is_freelancer is true

      if (userError) {
        console.error("Error fetching user data:", userError)
        setFreelancers([])
        setTotalCount(0)
        return
      }

      // Only include freelancers whose users have is_freelancer = true
      const validUserIds = userData?.map(u => u.id) || []
      const filteredFreelancerData = freelancerData.filter(f => validUserIds.includes(f.user_id))

      // Combine freelancer and user data
      const combinedData = filteredFreelancerData.map((freelancer) => {
        const user = userData?.find((u) => u.id === freelancer.user_id)
        return {
          ...freelancer,
          users: user
            ? {
                email: user.email,
              }
            : undefined,
        }
      })

      setFreelancers(combinedData)

      // Get total count for pagination with the same filters including is_freelancer check
      // We need to do a join to count only freelancers with is_freelancer = true
      const { data: countData, error: countError } = await supabase
        .from("freelancer_profiles")
        .select(`
          id,
          user_id,
          occupation,
          custom_occupation,
          description,
          display_name,
          first_name,
          last_name,
          users!inner(is_freelancer)
        `)
        .eq("users.is_freelancer", true)
        .or(
          `occupation.ilike.%${searchTerm}%,` +
            `custom_occupation.ilike.%${searchTerm}%,` +
            `description.ilike.%${searchTerm}%,` +
            `display_name.ilike.%${searchTerm}%,` +
            `first_name.ilike.%${searchTerm}%,` +
            `last_name.ilike.%${searchTerm}%`,
        )

      if (countError) {
        console.error("Error getting count:", countError)
        setTotalCount(combinedData.length) // Fallback to current page count
      } else {
        setTotalCount(countData?.length || 0)
      }
    } catch (error) {
      console.error("Error:", error)
      setFreelancers([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFreelancers(currentPage, sortBy)
  }, [category, currentPage, sortBy])

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    setCurrentPage(1) // Reset to first page when sorting changes
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {startPage > 1 && (
          <>
            <Button variant="outline" size="sm" onClick={() => handlePageChange(1)}>
              1
            </Button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}

        {pages.map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(page)}
            className={currentPage === page ? "bg-[#00D37F] hover:bg-[#00c070]" : ""}
          >
            {page}
          </Button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <Button variant="outline" size="sm" onClick={() => handlePageChange(totalPages)}>
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center text-sm">
            <Link href="/" className="text-gray-500 hover:text-[#00D37F]">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
            <span className="text-[#0F2830] font-medium capitalize">{category}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F2830] mb-2 capitalize">{category}</h1>
          <p className="text-gray-600">Find talented freelancers specializing in {category}.</p>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap gap-4 mb-8 items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="text-[#0F2830]">
              Service options
              <ChevronRight className="h-4 w-4 ml-2 rotate-90" />
            </Button>
            <Button variant="outline" className="text-[#0F2830]">
              Seller details
              <ChevronRight className="h-4 w-4 ml-2 rotate-90" />
            </Button>
            <Button variant="outline" className="text-[#0F2830]">
              Budget
              <ChevronRight className="h-4 w-4 ml-2 rotate-90" />
            </Button>
            <Button variant="outline" className="text-[#0F2830]">
              Delivery time
              <ChevronRight className="h-4 w-4 ml-2 rotate-90" />
            </Button>
          </div>

          <select
            className="border rounded-md px-3 py-2 text-sm text-[#0F2830] focus:outline-none focus:ring-2 focus:ring-[#00D37F]"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
          >
            <option value="default">Best Match</option>
            <option value="price_low_high">Price: Low to High</option>
            <option value="price_high_low">Price: High to Low</option>
          </select>
        </div>

        {/* Results */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            {loading ? "Loading..." : `${totalCount.toLocaleString()} freelancer${totalCount !== 1 ? "s" : ""} found`}
          </p>
          {totalPages > 1 && (
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>

        {/* Freelancers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-t-xl"></div>
                <div className="p-4 bg-white rounded-b-xl border border-t-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : freelancers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {freelancers.map((freelancer) => (
                <FreelancerCard
                  key={freelancer.id}
                  freelancer={{
                    ...freelancer,
                    email: freelancer.users?.email,
                  }}
                />
              ))}
            </div>
            {renderPagination()}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No freelancers found</h3>
            <p className="text-gray-500 mb-4">
              We couldn't find any freelancers matching "{category}". Try a different category or search term.
            </p>
            <Link href="/">
              <Button className="bg-[#00D37F] hover:bg-[#00c070] text-white">Browse All Categories</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}