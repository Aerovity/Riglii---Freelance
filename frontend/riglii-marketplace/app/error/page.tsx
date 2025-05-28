'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function ErrorPage() {
  const router = useRouter()

  const handleGoHome = () => {
    router.push('/')
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-8 text-center">
          <Link
            href="/"
            className="inline-block mb-6">
            <Image
              src="/Riglii_logo.png"
              alt="Riglii Logo"
              width={200}
              height={67}
              className="h-14 w-auto mx-auto"
            />
          </Link>

          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg 
                className="w-8 h-8 text-red-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h1>
          
          <p className="text-gray-600 mb-6">
            We encountered an unexpected error. Don't worry, we're on it!
          </p>

          <div className="space-y-3">
            <Button
              onClick={handleGoHome}
              className="w-full bg-[#00D37F] hover:bg-[#00B86A] text-white">
              Go to Homepage
            </Button>

            <Button
              onClick={handleGoBack}
              variant="outline"
              className="w-full">
              Go Back
            </Button>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>
              If this problem persists, please{' '}
              <Link 
                href="/contact" 
                className="text-[#00D37F] hover:text-[#00B86A]">
                contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}