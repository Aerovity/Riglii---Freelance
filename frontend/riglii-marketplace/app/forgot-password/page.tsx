"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { requestPasswordReset } from "./action"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("email", email)

      const result = await requestPasswordReset(formData)

      if (result && "error" in result) {
        setError(result.error)
      } else {
        setSuccessMessage("Password reset email sent! Please check your inbox and follow the instructions.")
        setEmail("") // Clear the form
      }
    } catch (err) {
      console.error("Password reset error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <Image src="/Riglii_logo.png" alt="Riglii Logo" width={200} height={67} className="h-14 w-auto mx-auto" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
            <p className="text-gray-600 mt-2">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                className="mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#00D37F] hover:bg-[#00B86A] text-white"
              size="lg"
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending Reset Email...
                </div>
              ) : (
                "Send Reset Email"
              )}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <Link href="/auth/signin" className="text-sm text-[#00D37F] hover:text-[#00B86A]">
              ← Back to sign in
            </Link>
          </div>
        </form>

        <p className="mt-8 text-center text-xs text-gray-500">
          Remember your password?{" "}
          <Link href="/auth/signin" className="underline text-[#00D37F]">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}
