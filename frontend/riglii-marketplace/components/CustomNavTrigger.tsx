"use client"

import * as React from "react"
import { cn } from "@/lib/utils" // or your own className merge utility

// Some of these classes are from the shadcn/ui default style for triggers.
// Adjust them as you wish to match your original button appearance.
const baseTriggerClasses = `
  inline-flex items-center justify-center
  rounded-md text-sm font-medium
  transition-colors focus:outline-none
  disabled:opacity-50 disabled:pointer-events-none
  bg-transparent hover:bg-gray-100
  h-10 py-2 px-4 group w-max
`

interface CustomNavTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // optional additional props
}

export function CustomNavTrigger({
  className,
  children,
  ...props
}: CustomNavTriggerProps) {
  return (
    <button
      className={cn(baseTriggerClasses, "text-[#0F2830] hover:text-[#00D37F]", className)}
      {...props}
    >
      {children}
    </button>
  )
}
