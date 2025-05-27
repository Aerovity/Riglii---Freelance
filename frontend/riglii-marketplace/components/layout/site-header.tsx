"use client"

import Link from "next/link"
import { Search, Heart, ArrowRight, BriefcaseBusiness, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import LanguageSelector from "@/components/language-selector"
import { useLanguage } from "@/app/language-provider"
import NotificationsDropdown from "@/components/notifications-dropdown"
import MessagesDropdown from "@/components/messages-dropdown"
import CategoriesDropdown from "@/components/categories-dropdown"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import FreelancerOnboarding from "@/components/freelancer-onboarding"

export default function SiteHeader() {
  const { t, language } = useLanguage()
  const isRtl = language === "ar"
  const [showOnboarding, setShowOnboarding] = useState(false)
  
  // Replace this with your own authentication logic
  const [isSignedIn, setIsSignedIn] = useState(false)

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-6 flex-1">
            <Link href="/" className="text-[#0F2830] font-bold text-2xl flex items-center shrink-0">
              Riglii
              <ArrowRight className="h-4 w-4 text-[#00D37F] -ml-0.5 transform rotate-45" />
            </Link>
            <div className="relative flex items-center flex-1 max-w-xl">
              <Input
                type="text"
                placeholder={t("search")}
                className="pr-10 border-gray-300 focus:border-[#00D37F] focus:ring-[#00D37F]"
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
            <div className="flex items-center gap-2">
              {isSignedIn ? (
                <>
                  <NotificationsDropdown />
                  <MessagesDropdown />
                  <Button variant="ghost" size="icon" className="text-[#0F2830]">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-[#0F2830] hover:text-[#00D37F] flex items-center gap-1"
                    onClick={() => setShowOnboarding(true)}
                  >
                    <BriefcaseBusiness className="h-4 w-4" />
                    <span>{t("becomeFreelancer") || "Become a Freelancer"}</span>
                  </Button>
                  
                  {/* User Profile Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative w-8 h-8 rounded-full">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem>
                        <Link href="/profile" className="flex items-center w-full">
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/settings" className="flex items-center w-full">
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <button 
                          onClick={() => {
                            // Add your sign out logic here
                            setIsSignedIn(false)
                            // Redirect to home or handle sign out
                            window.location.href = "/"
                          }} 
                          className="flex items-center w-full text-left"
                        >
                          Sign Out
                        </button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-[#00D37F] text-white hover:bg-[#00B86A]">
                      Get Started
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <button 
                        onClick={() => {
                          // Add your login logic here
                          // For now, just toggle the state
                          setIsSignedIn(true)
                        }} 
                        className="flex items-center w-full text-left"
                      >
                        Login
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <button 
                        onClick={() => {
                          // Add your register logic here
                          // For now, just toggle the state
                          setIsSignedIn(true)
                        }} 
                        className="flex items-center w-full text-left"
                      >
                        Register
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
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
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <FreelancerOnboarding onClose={() => setShowOnboarding(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}