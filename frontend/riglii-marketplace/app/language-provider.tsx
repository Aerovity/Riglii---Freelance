"use client"

import { createContext, useContext, type ReactNode } from "react"

interface LanguageContextType {
  t: (key: string) => string
}

const translations = {
  explore: "Explore",
  business: "Business",
  upgrade: "Upgrade to Pro",
  getStarted: "Get Started",
  search: "What service are you looking for today?",
  meetRiglii: "Meet Riglii Go",
  meetRigliiDesc:
    "Instantly generate whatever you need with a freelancer's personal AI model. The freelancer is always there to help you perfect it.",
  startGenerating: "Start generating",
  postProject: "Post a project brief",
  getTailored: "Get tailored offers for your needs.",
  tailorRiglii: "Tailor Riglii to your needs",
  tellUs: "Tell us a bit about your business.",
  addInfo: "Add your info",
  exploreCategories: "Explore popular categories on Riglii",
  showAll: "Show All",
  getInspired: "Get inspired by work done on Riglii",
  from: "From",
  categories: "Categories",
  about: "About",
  support: "Support",
  community: "Community",
  rigliiBusiness: "Riglii Business",
  businessDesc: "Connect with talented freelancers for your business needs.",
  exploreSolutions: "Explore Business Solutions",
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const t = (key: string): string => {
    return translations[key as keyof typeof translations] || key
  }

  return <LanguageContext.Provider value={{ t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}