"use client"

import Link from "next/link"
import Image from "next/image"
import { Search, UserIcon, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import type { User } from "@supabase/supabase-js"
import LanguageSelector from "@/components/language-selector"
import { useLanguage } from "@/app/language-provider"
import NotificationsDropdown from "@/components/notifications-dropdown"
import MessagesDropdown from "@/components/messages-dropdown"
import CategoriesDropdown from "@/components/categories-dropdown"
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

export default function SiteHeader() {
  const { t, language } = useLanguage()
  const isRtl = language === "ar"
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const getUserInitials = (user: User) => {
    const fullName = user.user_metadata?.full_name || user.email
    if (fullName) {
      const names = fullName.split(" ")
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return fullName.slice(0, 2).toUpperCase()
    }
    return "U"
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-6 flex-1">
            <Link href="/" className="flex items-center shrink-0">
              <Image src="/Riglii_logo.png" alt="Riglii Logo" width={360} height={120} className="h-20 w-auto" />
            </Link>
            <div className="relative flex items-center flex-1 max-w-xl">
              <Input
                type="text"
                placeholder={t("search")}
                className="pr-10 border-gray-300 focus:border-[#00D37F] focus:ring-[#00D37F]"
                dir={isRtl ? "rtl" : "ltr"}
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-0 bg-[#00D37F] text-white rounded-l-none h-full"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-4">
            <Link href="/explore" className="text-[#0F2830] hover:text-[#00D37F] text-sm font-medium">
              {t("explore")}
            </Link>
            <Link href="/business" className="text-[#0F2830] hover:text-[#00D37F] text-sm font-medium">
              {t("business")}
            </Link>
            <LanguageSelector />

            {/* Show notifications and messages when user is logged in */}
            {user && (
              <>
                <NotificationsDropdown />
                <MessagesDropdown />
              </>
            )}

            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              // Show user profile when logged in
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} alt="Profile" />
                      <AvatarFallback className="bg-[#00D37F] text-white text-sm font-medium">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.user_metadata?.full_name || "User"}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>{t("dashboard")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t("settings")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowOnboarding(true)} className="flex items-center">
                    <span>{t("becomeFreelancer")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("signOut")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Show Get Started button when not logged in
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-[#00D37F] text-white hover:bg-[#00B86A]">{t("getStarted")}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="flex items-center w-full">
                      {t("login")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/login?mode=signup" className="flex items-center w-full">
                      {t("register")}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          <Button variant="outline" size="icon" className="md:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-menu"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </div>
      </header>

      {/* Categories Navigation */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4">
          <CategoriesDropdown />
        </div>
      </div>

      {/* Freelancer Onboarding Dialog */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Freelancer Onboarding</DialogTitle>
          <FreelancerOnboarding onClose={() => setShowOnboarding(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}