"use client"

import { usePathname } from 'next/navigation'
import SiteHeader from "@/components/layout/site-header"
import SiteFooter from "@/components/layout/site-footer"

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Routes that should not show header/footer
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
  const isAuthRoute = authRoutes.some(route => pathname?.startsWith(route) ?? false)
  
  if (isAuthRoute) {
    // For auth pages, render children directly without header/footer
    return <>{children}</>
  }
  
  // For all other pages, show the standard layout with header and footer
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      {/* Main content with padding to account for fixed header */}
      <main className="flex-grow relative z-10 pt-[120px]">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}