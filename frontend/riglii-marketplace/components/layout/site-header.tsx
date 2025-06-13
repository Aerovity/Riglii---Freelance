"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Search, UserIcon, Settings, LogOut, Menu, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useLanguage } from "@/app/language-provider"
import CategoriesDropdown from "@/components/categories-dropdown"
import MessagesDropdown from "@/components/messages-dropdown"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import FreelancerOnboarding from "@/components/freelancer-onboarding"
import { cn } from "@/lib/utils"
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion"

interface ScrollProgressProps {
  className?: string
}

function ScrollProgress({ className }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 40,
    restDelta: 0.001,
  })

  return (
    <motion.div
      className={cn("fixed inset-x-0 top-0 z-[1000] h-1 origin-left", className)}
      style={{
        scaleX,
        background: "linear-gradient(90deg, #00D37F 0%, #00B86A 50%, #00D37F 100%)",
      }}
    />
  )
}

export default function SiteHeader() {
  const { t, language } = useLanguage()
  const isRtl = language === "ar"
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // Handle scroll for effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Function to download avatar image from Supabase storage
  const downloadAvatar = async (path: string) => {
    try {
      const { data, error } = await supabase.storage.from("avatars").download(path)
      if (error) {
        throw error
      }
      const url = URL.createObjectURL(data)
      setAvatarUrl(url)
    } catch (error) {
      console.log("Error downloading avatar image: ", error)
      setAvatarUrl(null)
    }
  }

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)

      // Download avatar if user has one
      if (user?.user_metadata?.avatar_url) {
        downloadAvatar(user.user_metadata.avatar_url)
      }
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)

      // Download avatar for new user or clear avatar if user logged out
      if (session?.user?.user_metadata?.avatar_url) {
        downloadAvatar(session.user.user_metadata.avatar_url)
      } else {
        // Clean up old avatar URL
        if (avatarUrl) {
          URL.revokeObjectURL(avatarUrl)
        }
        setAvatarUrl(null)
      }
    })

    // Cleanup function
    return () => {
      subscription.unsubscribe()
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl)
      }
    }
  }, [supabase.auth])

  // Listen for user metadata changes (like avatar updates)
  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      // Clean up previous avatar URL
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl)
      }
      downloadAvatar(user.user_metadata.avatar_url)
    } else {
      // Clean up avatar URL if no avatar
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl)
      }
      setAvatarUrl(null)
    }
  }, [user?.user_metadata?.avatar_url])

  const handleSignOut = async () => {
    // Clean up avatar URL before signing out
    if (avatarUrl) {
      URL.revokeObjectURL(avatarUrl)
      setAvatarUrl(null)
    }
    await supabase.auth.signOut()
    // Redirect to home page after sign out
    router.push("/")
  }

  const getUserInitials = (user: User) => {
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name
    if (fullName) {
      const names = fullName.split(" ")
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return fullName.slice(0, 2).toUpperCase()
    }
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return "U"
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Replace spaces with hyphens for URL-friendly format
      const urlFriendlyQuery = searchQuery.trim().toLowerCase().replace(/\s+/g, "-")
      router.push(`/category/${urlFriendlyQuery}`)
    }
  }

  return (
    <>
      {/* Scroll Progress Bar */}
      <ScrollProgress />

      {/* Header Container */}
      <div className="fixed top-0 left-0 right-0 z-50 w-full">
        {/* Beta Banner */}
        <div className="bg-gradient-to-r from-[#00D37F] to-[#00B86A] text-white py-2 px-4 z-[60]">
          <div className="container mx-auto">
            <div className="flex items-center justify-center text-center">
              <p className="text-sm font-medium">
                Welcome to the beta version of Riglii, Thanks for your understanding for any problem{" "}
                <Link
                  href="/contact-support"
                  className="underline hover:no-underline font-semibold transition-all duration-200"
                >
                  contact support
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div
          className={cn(
            "transition-all duration-300",
            isScrolled ? "bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-200/50" : "bg-white",
          )}
        >
          <header className="relative">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between h-20">
                {/* Left Section: Logo & Search */}
                <div className="flex items-center gap-8 flex-1">
                  <div>
                    <Link href="/" className="flex items-center shrink-0">
                      <div className="relative">
                        <Image
                          src="/Riglii_logo.png"
                          alt="Riglii Logo"
                          width={140}
                          height={45}
                          className="h-12 w-auto"
                          priority
                        />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00D37F] rounded-full animate-pulse" />
                      </div>
                    </Link>
                  </div>

                  <form onSubmit={handleSearch} className="relative flex-1 max-w-2xl hidden lg:flex">
                    <div
                      className={cn(
                        "relative w-full transition-all duration-300",
                        searchFocused && "transform scale-[1.02]",
                      )}
                    >
                      <Input
                        type="text"
                        placeholder={t("search") || "Search for services..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        className={cn(
                          "w-full h-12 pr-14 pl-6 text-base rounded-2xl border-2 transition-all duration-300",
                          searchFocused
                            ? "border-[#00D37F] shadow-lg shadow-green-100"
                            : "border-gray-200 hover:border-gray-300",
                        )}
                        dir={isRtl ? "rtl" : "ltr"}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        className="absolute right-1 top-1 h-10 w-10 bg-[#00D37F] hover:bg-[#00B86A] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <Search className="h-5 w-5" />
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Right Section: Navigation */}
                <nav className="flex items-center gap-6">
                  <div className="hidden lg:flex items-center gap-6">
                    <Link
                      href="/how-to-become-freelancer"
                      className="relative group text-[#0F2830] hover:text-[#00D37F] text-sm font-semibold transition-all duration-300"
                    >
                      How to Become a Freelancer
                      <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00D37F] group-hover:w-full transition-all duration-300" />
                    </Link>
                    <Link
                      href="/how-to-order"
                      className="relative group text-[#0F2830] hover:text-[#00D37F] text-sm font-semibold transition-all duration-300"
                    >
                      How to Order
                      <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00D37F] group-hover:w-full transition-all duration-300" />
                    </Link>
                  </div>

                  {/* Show messages when user is logged in */}
                  {user && (
                    <div className="hidden md:flex items-center gap-3">
                      <MessagesDropdown />
                    </div>
                  )}

                  {loading ? (
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl animate-pulse" />
                  ) : user ? (
                    // User Menu
                    <div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="relative h-10 w-10 rounded-xl p-0 hover:scale-105 transition-all duration-300"
                          >
                            <Avatar className="h-10 w-10 ring-2 ring-[#00D37F] ring-offset-2">
                              {avatarUrl && <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="Profile" />}
                              <AvatarFallback className="bg-[#00D37F] text-white text-sm font-bold">
                                {getUserInitials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00D37F] rounded-full border-2 border-white" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-64 p-2 rounded-2xl shadow-2xl border-0 bg-white/95 backdrop-blur-xl"
                          align="end"
                          forceMount
                        >
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#AFF8C8]/10 mb-2">
                            <Avatar className="h-12 w-12">
                              {avatarUrl && <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="Profile" />}
                              <AvatarFallback className="bg-[#00D37F] text-white font-bold">
                                {getUserInitials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 truncate">
                                {user.user_metadata?.full_name || user.user_metadata?.name || "User"}
                              </p>
                              <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            </div>
                          </div>
                          <DropdownMenuSeparator className="my-2" />
                          <DropdownMenuItem asChild>
                            <Link
                              href="/account"
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200"
                            >
                              <div className="p-2 rounded-lg bg-[#AFF8C8]/20 text-[#00D37F]">
                                <UserIcon className="h-4 w-4" />
                              </div>
                              <span className="font-medium">{t("dashboard") || "Dashboard"}</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/account"
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200"
                            >
                              <div className="p-2 rounded-lg bg-[#AFF8C8]/20 text-[#00D37F]">
                                <Settings className="h-4 w-4" />
                              </div>
                              <span className="font-medium">{t("settings") || "Settings"}</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-2" />
                          <DropdownMenuItem
                            onClick={handleSignOut}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 cursor-pointer transition-all duration-200"
                          >
                            <div className="p-2 rounded-lg bg-red-100 text-red-600">
                              <LogOut className="h-4 w-4" />
                            </div>
                            <span className="font-medium">{t("signOut") || "Sign Out"}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    // Get Started Menu
                    <div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="bg-[#00D37F] text-white hover:bg-[#00B86A] rounded-xl px-6 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            {t("getStarted") || "Get Started"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 p-2 rounded-2xl shadow-2xl border-0 bg-white/95 backdrop-blur-xl"
                        >
                          <DropdownMenuItem asChild>
                            <Link
                              href="/login"
                              className="flex items-center w-full p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 font-medium"
                            >
                              {t("login") || "Login"}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/login?mode=signup"
                              className="flex items-center w-full p-3 rounded-xl hover:bg-[#AFF8C8]/10 cursor-pointer transition-all duration-200 font-medium"
                            >
                              {t("register") || "Register"}
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}

                  {/* Mobile Menu Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-10 w-10 rounded-xl hover:bg-gray-100 transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  >
                    <AnimatePresence mode="wait">
                      {isMobileMenuOpen ? (
                        <motion.div
                          key="close"
                          initial={{ rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <X className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="menu"
                          initial={{ rotate: 90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: -90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Menu className="h-5 w-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </nav>
              </div>
            </div>

            {/* Categories Navigation */}
            <div className="border-t border-gray-100 bg-white/80 backdrop-blur-sm">
              <div className="container mx-auto px-4 py-3">
                <CategoriesDropdown />
              </div>
            </div>

            {/* Mobile Search Bar */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="lg:hidden border-t border-gray-100 bg-white p-4"
                >
                  <form onSubmit={handleSearch} className="relative">
                    <Input
                      type="text"
                      placeholder={t("search") || "Search for services..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-12 pr-14 pl-6 rounded-2xl border-2 border-gray-200 focus:border-[#00D37F]"
                      dir={isRtl ? "rtl" : "ltr"}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="absolute right-1 top-1 h-10 w-10 bg-[#00D37F] hover:bg-[#00B86A] text-white rounded-xl"
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </header>
        </div>
      </div>

      {/* Simple fixed spacer with 50px height */}
      <div style={{ height: "50px" }} aria-hidden="true" />

      {/* Freelancer Onboarding Dialog */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-0 shadow-2xl">
          <DialogTitle className="sr-only">Freelancer Onboarding</DialogTitle>
          <FreelancerOnboarding onClose={() => setShowOnboarding(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
