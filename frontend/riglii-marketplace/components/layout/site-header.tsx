"use client"

import Link from "next/link"
import Image from "next/image"
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
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import FreelancerOnboarding from "@/components/freelancer-onboarding"

export default function SiteHeader() {
  const { t, language } = useLanguage()
  const isRtl = language === "ar"
  const [showOnboarding, setShowOnboarding] = useState(false)
  const router = useRouter()

  const handleLogin = () => {
    // Open sign-in page in a new tab
    window.open('/auth/signin', '_blank')
  }

  const handleRegister = () => {
    // Open sign-in page in sign-up mode in a new tab
    window.open('/auth/signin?mode=signup', '_blank')
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-6 flex-1">
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/Riglii_logo.png"
                alt="Riglii Logo"
                width={360}
                height={120}
                className="h-20 w-auto"
              />
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-[#00D37F] text-white hover:bg-[#00B86A]">
                    Get Started
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <button 
                      onClick={handleLogin} 
                      className="flex items-center w-full text-left"
                    >
                      Login
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <button 
                      onClick={handleRegister} 
                      className="flex items-center w-full text-left"
                    >
                      Register
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
    </>
  )
}