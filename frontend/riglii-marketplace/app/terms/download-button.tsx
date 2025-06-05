'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { termsContent } from "./terms-content"

export function DownloadButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = () => {
    setIsLoading(true)
    
    // Create a link to the static PDF file
    const link = document.createElement('a')
    link.href = '/terms-and-conditions.pdf'
    link.download = 'riglii-terms-and-conditions.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setIsLoading(false)
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isLoading}
      className="bg-primary hover:bg-primary/90 text-white"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Downloading...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </span>
      )}
    </Button>
  )
} 