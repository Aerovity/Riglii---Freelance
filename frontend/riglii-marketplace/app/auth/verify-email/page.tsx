'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function VerifyEmailPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const email = searchParams?.get('email') || ''
    const [isResending, setIsResending] = useState(false)
    const [resendSuccess, setResendSuccess] = useState(false)
    const [resendError, setResendError] = useState('')
    const [emailVerificationEnabled, setEmailVerificationEnabled] = useState(true)

    useEffect(() => {
        // If no email parameter, redirect to login
        if (!email) {
            router.push('/login')
        }
    }, [email, router])

    const handleResendEmail = async () => {
        setIsResending(true)
        setResendError('')
        setResendSuccess(false)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/confirm`,
                }
            })

            if (error) {
                // Check if email verification is disabled
                if (error.message?.includes('Email link is invalid') || 
                    error.message?.includes('Email sending is not enabled')) {
                    setEmailVerificationEnabled(false)
                    setResendError('Email verification is currently disabled. You can sign in directly.')
                } else {
                    setResendError('Failed to resend email. Please try again later.')
                }
            } else {
                setResendSuccess(true)
            }
        } catch (err) {
            setResendError('An error occurred. Please try again.')
        } finally {
            setIsResending(false)
        }
    }

    const handleSignIn = () => {
        router.push('/login')
    }

    // If email verification is disabled, show a different message
    if (!emailVerificationEnabled) {
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
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg 
                                    className="w-8 h-8 text-green-600" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor">
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M5 13l4 4L19 7" 
                                    />
                                </svg>
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Account Created Successfully!
                        </h1>
                        
                        <p className="text-gray-600 mb-6">
                            Your account has been created. You can now sign in with your credentials.
                        </p>

                        <Button
                            onClick={handleSignIn}
                            className="w-full bg-[#00D37F] hover:bg-[#00B86A] text-white">
                            Sign In Now
                        </Button>
                    </div>
                </div>
            </div>
        )
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
                        <div className="w-16 h-16 bg-[#00D37F] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg 
                                className="w-8 h-8 text-[#00D37F]" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor">
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                                />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Check your email
                    </h1>
                    
                    <p className="text-gray-600 mb-6">
                        {email ? (
                            <>
                                We've sent a verification email to<br />
                                <span className="font-medium text-gray-900">{email}</span>
                            </>
                        ) : (
                            'Please check your email for verification instructions.'
                        )}
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-600">
                        Please click the link in the email to verify your account. 
                        The link will expire in 24 hours.
                    </div>

                    {resendSuccess && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm text-green-600">
                                Verification email sent successfully!
                            </p>
                        </div>
                    )}

                    {resendError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{resendError}</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {email && (
                            <Button
                                onClick={handleResendEmail}
                                disabled={isResending}
                                variant="outline"
                                className="w-full">
                                {isResending ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Resending...
                                    </div>
                                ) : (
                                    'Resend verification email'
                                )}
                            </Button>
                        )}

                        <Link href="/login">
                            <Button
                                className="w-full bg-[#00D37F] hover:bg-[#00B86A] text-white">
                                Back to sign in
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-6 text-sm text-gray-500">
                        <p className="mb-2">
                            Can't find the email? Check your spam folder.
                        </p>
                        <p className="mb-2">
                            Already verified your email? 
                            <Link 
                                href="/login" 
                                className="text-[#00D37F] hover:text-[#00B86A] ml-1">
                                Sign in to your account
                            </Link>
                        </p>
                        <p>
                            Wrong email? 
                            <Link 
                                href="/login?mode=signup" 
                                className="text-[#00D37F] hover:text-[#00B86A] ml-1">
                                Sign up again
                            </Link>
                        </p>
                    </div>

                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-xs text-amber-800">
                            <strong>Note:</strong> Email verification is limited. If you're not receiving emails, 
                            email verification may be disabled and you can sign in directly.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}