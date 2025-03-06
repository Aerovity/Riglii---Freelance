"use client"

import Image from "next/image"
import Link from "next/link"
import { Search, Bell, Mail, Heart, ChevronDown, ArrowRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import LanguageSwitcher from "@/components/language-switcher"
import { useLanguage } from "./language-provider"

export default function Home() {
  const { t, language } = useLanguage()

  const isRtl = language === "ar"

  return (
    <div className={`min-h-screen bg-white ${isRtl ? "rtl" : "ltr"}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-[#0F2830] font-bold text-2xl flex items-center">
              Riglii
              <ArrowRight className="h-4 w-4 text-[#00D37F] ml-1" />
            </Link>
            <div className="relative hidden md:flex items-center flex-1 max-w-md">
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
            <Link href="/upgrade" className="text-[#0F2830] hover:text-[#00D37F] text-sm font-medium">
              {t("upgrade")}
            </Link>
            <LanguageSwitcher />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-[#0F2830]">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-[#0F2830]">
                <Mail className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-[#0F2830]">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-[#0F2830]">
                <div className="w-8 h-8 rounded-full bg-[#AFF8C8] flex items-center justify-center text-[#014751] font-medium">
                  Z
                </div>
              </Button>
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
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="container mx-auto px-4">
          <div className="flex space-x-6 py-3 text-sm whitespace-nowrap">
            <Link href="/graphics-design" className="text-[#0F2830] hover:text-[#00D37F] font-medium">
              Graphics & Design
            </Link>
            <Link href="/programming" className="text-[#0F2830] hover:text-[#00D37F] font-medium">
              Programming & Tech
            </Link>
            <Link href="/digital-marketing" className="text-[#0F2830] hover:text-[#00D37F] font-medium">
              Digital Marketing
            </Link>
            <Link href="/video-animation" className="text-[#0F2830] hover:text-[#00D37F] font-medium">
              Video & Animation
            </Link>
            <Link href="/writing" className="text-[#0F2830] hover:text-[#00D37F] font-medium">
              Writing & Translation
            </Link>
            <Link href="/music" className="text-[#0F2830] hover:text-[#00D37F] font-medium">
              Music & Audio
            </Link>
            <Link href="/business" className="text-[#0F2830] hover:text-[#00D37F] font-medium">
              Business
            </Link>
            <Link href="/ai-services" className="text-[#0F2830] hover:text-[#00D37F] font-medium">
              AI Services
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#014751] to-[#0F2830] text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("meetRiglii")}</h1>
            <p className="text-lg mb-6">{t("meetRigliiDesc")}</p>
            <Button className="bg-[#00D37F] hover:bg-[#00c070] text-white rounded-full px-6 py-2 flex items-center gap-2">
              {t("startGenerating")} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="md:w-1/2">
            <div className="relative h-[300px] md:h-[400px] w-full rounded-lg overflow-hidden">
              <Image src="/placeholder.svg?height=400&width=600" alt="Riglii Go" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations Section */}
      <section className="py-12 bg-[#AFF8C8]/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-start gap-4">
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

            <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-start gap-4">
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
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#0F2830]">{t("exploreCategories")}</h2>
            <div className="flex items-center gap-2">
              <Link href="/categories" className="text-[#00D37F] font-medium text-sm">
                {t("showAll")}
              </Link>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category Cards */}
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="group relative rounded-lg overflow-hidden border border-gray-200 bg-white">
                <div className="absolute top-3 right-3 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-white/80 backdrop-blur-sm rounded-full h-8 w-8 text-gray-700 hover:text-[#00D37F]"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                <div className="relative h-48 w-full">
                  <Image
                    src={`/placeholder.svg?height=200&width=300&text=Service${item}`}
                    alt="Service image"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#AFF8C8] flex items-center justify-center text-[#014751] font-medium">
                      S
                    </div>
                    <div>
                      <p className="text-sm font-medium">Seller Name</p>
                      <div className="flex items-center text-xs text-gray-500">
                        Level {item} <span className="mx-1">•</span> Top Rated
                      </div>
                    </div>
                  </div>

                  <h3 className="font-medium text-[#0F2830] mb-3 line-clamp-2">
                    I will create professional{" "}
                    {item === 1
                      ? "logo designs"
                      : item === 2
                        ? "website development"
                        : item === 3
                          ? "social media content"
                          : "video animations"}
                  </h3>

                  <div className="flex items-center text-sm text-amber-500 mb-3">
                    <Star className="h-4 w-4 fill-amber-500 stroke-amber-500" />
                    <span className="ml-1 font-medium">5.0</span>
                    <span className="text-gray-400 ml-1">(120)</span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">{t("from")}</p>
                    <p className="font-bold text-[#0F2830]">${50 + item * 25}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get Inspired Section */}
      <section className="py-12 bg-[#AFF8C8]/10">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#0F2830] mb-8">{t("getInspired")}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="group relative rounded-lg overflow-hidden bg-white">
                <div className="relative h-64 w-full">
                  <Image
                    src={`/placeholder.svg?height=300&width=400&text=Project${item}`}
                    alt="Project image"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-4 text-white">
                      <h3 className="font-medium mb-1">Amazing Project Title</h3>
                      <p className="text-sm">by Talented Freelancer</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F2830] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div>
              <h3 className="font-bold mb-4">{t("categories")}</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="#" className="hover:text-[#00D37F]">
                    Graphics & Design
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#00D37F]">
                    Digital Marketing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#00D37F]">
                    Writing & Translation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#00D37F]">
                    Video & Animation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#00D37F]">
                    Music & Audio
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">{t("about")}</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="#" className="hover:text-[#00D37F]">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#00D37F]">
                    Press & News
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#00D37F]">
                    Partnerships
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#00D37F]">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#00D37F]">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">{t("support")}</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="#" className="hover:text-[#00D37F]">
                    Help & Support
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#00D37F]">
                    Trust & Safety
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#00D37F]">
                    Selling on Riglii
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#00D37F]">
                    Buying on Riglii
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">{t("community")}</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="#" className="hover:text-[#00D37F]">
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#00D37F]">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#00D37F]">
                    Forum
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#00D37F]">
                    Podcast
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#00D37F]">
                    Affiliates
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <h3 className="font-bold mb-4">{t("rigliiBusiness")}</h3>
              <p className="text-sm text-gray-300 mb-4">{t("businessDesc")}</p>
              <Button className="bg-[#00D37F] hover:bg-[#00c070] text-white w-full">{t("exploreSolutions")}</Button>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Link href="/" className="text-white font-bold text-xl flex items-center">
                Riglii
                <ArrowRight className="h-4 w-4 text-[#00D37F] ml-1" />
              </Link>
              <p className="text-sm text-gray-400">© 2025 Riglii Inc.</p>
            </div>

            <div className="flex items-center gap-4">
              <Link href="#" className="text-gray-400 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-twitter"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-facebook"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-linkedin"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-instagram"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

