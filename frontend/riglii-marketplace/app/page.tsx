"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronDown, ArrowRight, Star, Heart, Briefcase, Code, Palette, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "./language-provider"
import { useEffect, useRef, useState } from "react"
import { createClient } from "@/utils/supabase/client"
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

export default function Home() {
  const { t } = useLanguage()
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const [randomFreelancers, setRandomFreelancers] = useState<FreelancerData[]>([])
  const [loadingFreelancers, setLoadingFreelancers] = useState(true)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const supabase = createClient()

  // Function to format price in DZD
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Fetch random freelancers with is_freelancer filtering
  const fetchRandomFreelancers = async () => {
    setLoadingFreelancers(true)
    try {
      // Get random freelancers from the public view
      const { data: freelancerData, error: freelancerError } = await supabase
        .from("public_freelancer_profiles")
        .select("*")
        .limit(6)
        .order("created_at", { ascending: false })

      if (freelancerError) {
        console.error("Error fetching freelancers:", freelancerError)
        return
      }

      if (!freelancerData || freelancerData.length === 0) {
        setRandomFreelancers([])
        return
      }

      // Get user data and filter by is_freelancer = true
      const userIds = freelancerData.map((f) => f.user_id)
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, email, is_freelancer")
        .in("id", userIds)
        .eq("is_freelancer", true) // Only get users where is_freelancer is true

      if (userError) {
        console.error("Error fetching user data:", userError)
        setRandomFreelancers([])
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

      setRandomFreelancers(combinedData)
    } catch (error) {
      console.error("Error:", error)
      setRandomFreelancers([])
    } finally {
      setLoadingFreelancers(false)
    }
  }

  // Intersection Observer for smooth animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id))
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      },
    )

    const sections = document.querySelectorAll("[data-animate]")
    sections.forEach((section) => {
      if (observerRef.current) {
        observerRef.current.observe(section)
      }
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // Fetch random freelancers on component mount
  useEffect(() => {
    fetchRandomFreelancers()
  }, [])

  const categories = [
    {
      id: 1,
      title: "Web Development",
      description: "Professional websites and web applications",
      icon: Code,
      image: "/web-development-tools.jpg",
      slug: "web-development",
    },
    {
      id: 2,
      title: "Graphic Design",
      description: "Creative designs for your brand",
      icon: Palette,
      image: "/Adobe-Photoshop.jpg",
      slug: "graphic-design",
    },
    {
      id: 3,
      title: "Digital Marketing",
      description: "Grow your business online",
      icon: Briefcase,
      image: "/marketing.jpg",
      slug: "digital-marketing",
    },
    {
      id: 4,
      title: "Photography",
      description: "Capture your special moments",
      icon: Camera,
      image: "/camera.jpg",
      slug: "photography",
    },
  ]

  return (
    <div>
      {/* Hero Section with Background */}
      <section
        id="hero"
        data-animate
        className={`relative bg-gradient-to-r from-[#014751] to-[#0F2830] text-white overflow-hidden transition-all duration-1000 ${
          visibleSections.has("hero") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
        style={{
          backgroundImage: "url('/artic-image.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#014751]/90 to-[#0F2830]/30"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center relative z-10">
          <div
            className={`md:w-1/2 mb-8 md:mb-0 md:pr-8 transition-all duration-1000 delay-300 ${
              visibleSections.has("hero") ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("meetRiglii")}</h1>
            <p className="text-lg mb-6">{t("meetRigliiDesc")}</p>
            <Link href="/login">
              <Button className="bg-[#00D37F] hover:bg-[#00c070] text-white rounded-full px-6 py-2 flex items-center gap-2 transform hover:scale-105 transition-all duration-300">
                {t("startGenerating")} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div
            className={`md:w-1/2 transition-all duration-1000 delay-500 ${
              visibleSections.has("hero") ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <div className="relative h-[300px] md:h-[400px] w-full rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="/hero-image.png"
                alt="Riglii Go"
                fill
                className="object-cover transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations Section */}
      <section
        id="recommendations"
        data-animate
        className={`py-12 bg-[#AFF8C8]/10 transition-all duration-1000 delay-200 ${
          visibleSections.has("recommendations") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div
              className={`bg-white p-6 rounded-lg border border-gray-200 flex items-start gap-4 transform hover:scale-105 transition-all duration-300 hover:shadow-lg ${
                visibleSections.has("recommendations") ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <div className="p-3 bg-[#AFF8C8] rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#014751"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-file-text"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" x2="8" y1="13" y2="13" />
                  <line x1="16" x2="8" y1="17" y2="17" />
                  <line x1="10" x2="8" y1="9" y2="9" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-[#0F2830]">{t("postProject")}</h3>
                    <span className="inline-block bg-[#00D37F]/20 text-[#00D37F] text-xs font-medium px-2 py-0.5 rounded">
                      NEW
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="text-[#014751] border-[#014751] hover:bg-[#014751] hover:text-white"
                  >
                    {t("getStarted")}
                  </Button>
                </div>
                <p className="text-sm text-gray-600">{t("getTailored")}</p>
              </div>
            </div>

            <div
              className={`bg-white p-6 rounded-lg border border-gray-200 flex items-start gap-4 transform hover:scale-105 transition-all duration-300 hover:shadow-lg ${
                visibleSections.has("recommendations") ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
              }`}
              style={{ transitionDelay: "600ms" }}
            >
              <div className="p-3 bg-[#AFF8C8] rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#014751"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-briefcase"
                >
                  <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-[#0F2830]">{t("tailorRiglii")}</h3>
                  </div>
                  <Button
                    variant="outline"
                    className="text-[#014751] border-[#014751] hover:bg-[#014751] hover:text-white"
                  >
                    {t("addInfo")}
                  </Button>
                </div>
                <p className="text-sm text-gray-600">{t("tellUs")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section
        id="categories"
        data-animate
        className={`py-12 transition-all duration-1000 ${
          visibleSections.has("categories") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto px-4">
          <div
            className={`flex justify-between items-center mb-6 transition-all duration-1000 delay-200 ${
              visibleSections.has("categories") ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
            }`}
          >
            <h2 className="text-2xl font-bold text-[#0F2830]">{t("exploreCategories")}</h2>
            <div className="flex items-center gap-2">
              <Link href="/categories" className="text-[#00D37F] font-medium text-sm hover:underline">
                {t("showAll")}
              </Link>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-[#00D37F] hover:text-white transition-colors"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-[#00D37F] hover:text-white transition-colors"
                >
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const IconComponent = category.icon
              return (
                <Link
                  key={category.id}
                  href={`/${category.slug}`}
                  className={`group relative rounded-lg overflow-hidden border border-gray-200 bg-white transform hover:scale-105 hover:shadow-xl transition-all duration-500 cursor-pointer ${
                    visibleSections.has("categories") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                >
                  <div className="absolute top-3 right-3 z-10">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/80 backdrop-blur-sm rounded-full h-8 w-8 text-gray-700 hover:text-[#00D37F] hover:bg-white transition-all duration-300"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#AFF8C8] flex items-center justify-center text-[#014751]">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <h3 className="font-semibold text-[#0F2830] group-hover:text-[#00D37F] transition-colors duration-300">
                        {category.title}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{category.description}</p>

                    <div className="flex items-center justify-center pt-3 border-t border-gray-100">
                      <span className="text-[#00D37F] font-medium text-sm group-hover:underline">
                        {t("exploreCategory") || "Explore Category"}
                      </span>
                      <ArrowRight className="h-4 w-4 ml-2 text-[#00D37F] group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Freelancers Section */}
      <section
        id="freelancers"
        data-animate
        className={`py-12 bg-[#AFF8C8]/10 transition-all duration-1000 ${
          visibleSections.has("freelancers") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto px-4">
          <div
            className={`flex justify-between items-center mb-8 transition-all duration-1000 delay-200 ${
              visibleSections.has("freelancers") ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
            }`}
          >
            <div>
              <h2 className="text-2xl font-bold text-[#0F2830] mb-2">{t("getInspired") || "Featured Freelancers"}</h2>
              <p className="text-gray-600">Discover talented professionals ready to bring your projects to life</p>
            </div>
            <Link href="/browse" className="text-[#00D37F] font-medium text-sm hover:underline">
              View All Freelancers
            </Link>
          </div>

          {loadingFreelancers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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
          ) : randomFreelancers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {randomFreelancers.map((freelancer, index) => (
                <div
                  key={freelancer.id}
                  className={`transition-all duration-1000 ${
                    visibleSections.has("freelancers") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                >
                  <FreelancerCard
                    freelancer={{
                      ...freelancer,
                      email: freelancer.users?.email,
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No freelancers available</h3>
              <p className="text-gray-500">Check back later for featured freelancers!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}