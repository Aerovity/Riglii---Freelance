"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Language = "fr" | "en" | "ar"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  fr: {
    explore: "Explorer",
    business: "Entreprise",
    upgrade: "Passer à Pro",
    getStarted: "Commencer",
    search: "Quel service recherchez-vous aujourd'hui?",
    meetRiglii: "Découvrez Riglii Go",
    meetRigliiDesc:
      "Générez instantanément ce dont vous avez besoin avec le modèle IA personnel d'un freelance. Le freelance est toujours là pour vous aider à le perfectionner.",
    startGenerating: "Commencer à générer",
    postProject: "Publiez un brief de projet",
    getTailored: "Obtenez des offres adaptées à vos besoins.",
    tailorRiglii: "Adaptez Riglii à vos besoins",
    tellUs: "Parlez-nous un peu de votre entreprise.",
    addInfo: "Ajouter vos infos",
    exploreCategories: "Explorez les catégories populaires sur Riglii",
    showAll: "Afficher tout",
    getInspired: "Inspirez-vous des travaux réalisés sur Riglii",
    from: "À partir de",
    categories: "Catégories",
    about: "À propos",
    support: "Support",
    community: "Communauté",
    rigliiBusiness: "Riglii Entreprise",
    businessDesc: "Connectez-vous avec des freelances talentueux pour vos besoins professionnels.",
    exploreSolutions: "Explorer les solutions d'entreprise",
  },
  en: {
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
  },
  ar: {
    explore: "استكشف",
    business: "الأعمال",
    upgrade: "الترقية إلى برو",
    getStarted: "ابدأ الآن",
    search: "ما هي الخدمة التي تبحث عنها اليوم؟",
    meetRiglii: "تعرف على ريجلي جو",
    meetRigliiDesc:
      "قم بإنشاء ما تحتاجه على الفور باستخدام نموذج الذكاء الاصطناعي الشخصي للمستقل. المستقل موجود دائمًا لمساعدتك على إتقانه.",
    startGenerating: "ابدأ الإنشاء",
    postProject: "انشر موجز المشروع",
    getTailored: "احصل على عروض مخصصة لاحتياجاتك.",
    tailorRiglii: "تخصيص ريجلي لاحتياجاتك",
    tellUs: "أخبرنا قليلاً عن عملك.",
    addInfo: "أضف معلوماتك",
    exploreCategories: "استكشف الفئات الشائعة على ريجلي",
    showAll: "عرض الكل",
    getInspired: "استلهم من الأعمال المنجزة على ريجلي",
    from: "من",
    categories: "الفئات",
    about: "حول",
    support: "الدعم",
    community: "المجتمع",
    rigliiBusiness: "ريجلي للأعمال",
    businessDesc: "تواصل مع المستقلين الموهوبين لتلبية احتياجات عملك.",
    exploreSolutions: "استكشف حلول الأعمال",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr")

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.fr] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

