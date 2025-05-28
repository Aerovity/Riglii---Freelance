"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Heart } from "lucide-react"

interface FreelancerCardProps {
  id: string
  user_id: string
  display_name: string | null
  first_name: string | null
  last_name: string | null
  description: string | null
  occupation: string | null
  custom_occupation: string | null
  price: number | null
}

export default function FreelancerCard({ freelancer }: { freelancer: FreelancerCardProps }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [portfolioUrl, setPortfolioUrl] = useState<string | null>(null)
  const supabase = createClient()

  const displayName =
    freelancer.display_name || `${freelancer.first_name || ""} ${freelancer.last_name || ""}`.trim() || "Freelancer"

  const occupation =
    freelancer.occupation === "other"
      ? freelancer.custom_occupation
      : freelancer.occupation?.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())

  // Truncate description to fit card
  const truncatedDescription = freelancer.description
    ? freelancer.description.length > 100
      ? freelancer.description.substring(0, 100) + "..."
      : freelancer.description
    : occupation || "Professional freelancer"

  const getUserInitials = () => {
    if (displayName && displayName !== "Freelancer") {
      const names = displayName.split(" ")
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return displayName.slice(0, 2).toUpperCase()
    }
    return "FL"
  }

  // Download avatar from avatars bucket
  const downloadAvatar = async (userId: string) => {
    try {
      const possiblePaths = [
        `${userId}/avatar.webp`,
        `${userId}/avatar.jpg`,
        `${userId}/avatar.jpeg`,
        `${userId}/avatar.png`,
        `${userId}.webp`,
        `${userId}.jpg`,
        `${userId}.jpeg`,
        `${userId}.png`,
      ]

      for (const path of possiblePaths) {
        try {
          const { data, error } = await supabase.storage.from("avatars").download(path)
          if (!error && data) {
            const url = URL.createObjectURL(data)
            setAvatarUrl(url)
            return
          }
        } catch (err) {
          continue
        }
      }
    } catch (error) {
      console.log("Error downloading avatar:", error)
    }
  }

  // Get first portfolio image
  const getPortfolioImage = async () => {
    try {
      const { data: documents, error } = await supabase
        .from("freelancer_documents")
        .select("document_url")
        .eq("freelancer_id", freelancer.id)
        .eq("document_type", "portfolio")
        .limit(1)

      if (!error && documents && documents.length > 0) {
        const { data, error: downloadError } = await supabase.storage
          .from("portfolio")
          .download(documents[0].document_url)

        if (!downloadError && data) {
          const url = URL.createObjectURL(data)
          setPortfolioUrl(url)
        }
      }
    } catch (error) {
      console.log("Error downloading portfolio image:", error)
    }
  }

  useEffect(() => {
    if (freelancer.user_id) {
      downloadAvatar(freelancer.user_id)
    }
    getPortfolioImage()

    return () => {
      if (avatarUrl && avatarUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarUrl)
      }
      if (portfolioUrl && portfolioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(portfolioUrl)
      }
    }
  }, [freelancer.user_id, freelancer.id])

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on the heart button
    if ((e.target as HTMLElement).closest("button")) {
      e.preventDefault()
      return
    }
  }

  return (
    <Link href={`/freelancer/${freelancer.user_id}`} onClick={handleCardClick}>
      <Card className="group relative rounded-xl overflow-hidden border border-gray-200 bg-white hover:shadow-lg transition-all duration-300 cursor-pointer">
        <div className="absolute top-3 right-3 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/80 backdrop-blur-sm rounded-full h-8 w-8 text-gray-700 hover:text-[#00D37F] opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              // Handle favorite functionality
              console.log("Added to favorites:", freelancer.id)
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={portfolioUrl || "/placeholder.svg?height=200&width=300"}
            alt={`${displayName}'s work`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=200&width=300"
            }}
          />
        </div>

        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={avatarUrl || ""} alt={displayName} />
              <AvatarFallback className="text-sm bg-[#00D37F] text-white">{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0F2830] truncate">{displayName}</p>
              <p className="text-xs text-gray-500">Level 2 • Top Rated</p>
            </div>
          </div>

          <h3 className="font-medium text-[#0F2830] mb-3 line-clamp-2 text-sm leading-relaxed">
            {truncatedDescription}
          </h3>

          <div className="flex items-center text-sm text-amber-500 mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-3 w-3 fill-amber-500 stroke-amber-500" />
              ))}
            </div>
            <span className="ml-1 font-medium">5.0</span>
            <span className="text-gray-400 ml-1">(0)</span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Starting from</p>
            <p className="font-bold text-[#0F2830]">
              {freelancer.price
                ? new Intl.NumberFormat("fr-DZ", {
                    style: "currency",
                    currency: "DZD",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(freelancer.price)
                : "Contact for price"}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
