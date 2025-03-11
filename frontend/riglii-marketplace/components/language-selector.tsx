"use client"

import { useLanguage } from "@/app/language-provider"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  const languages = [
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-[#0F2830] hover:text-[#00D37F] text-sm font-medium flex items-center gap-1"
        >
          {language.toUpperCase()} <ChevronDown className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Select Language</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant="outline"
              className={`flex items-center justify-start gap-3 p-4 h-auto text-base ${
                language === lang.code ? "border-[#00D37F] bg-[#AFF8C8]/10 text-[#014751]" : ""
              }`}
              onClick={() => {
                setLanguage(lang.code as "fr" | "en" | "ar")
                document.querySelector('[data-state="open"]')?.setAttribute("data-state", "closed")
              }}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className={lang.code === "ar" ? "font-arabic" : ""}>{lang.name}</span>
              {language === lang.code && <div className="ml-auto w-3 h-3 rounded-full bg-[#00D37F]"></div>}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

