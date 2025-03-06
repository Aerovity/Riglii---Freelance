"use client"

import { useLanguage } from "@/app/language-provider"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const languageNames = {
    fr: "Français",
    en: "English",
    ar: "العربية",
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="text-[#0F2830] hover:text-[#00D37F] text-sm font-medium flex items-center gap-1"
        >
          {language.toUpperCase()} <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="cursor-pointer" onClick={() => setLanguage("fr")}>
          {languageNames.fr}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => setLanguage("en")}>
          {languageNames.en}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => setLanguage("ar")} dir="rtl">
          {languageNames.ar}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

