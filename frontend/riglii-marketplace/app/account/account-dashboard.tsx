"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import AccountForm from "./account-form"
import FreelancerOnboarding from "@/components/freelancer-onboarding"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Settings, ArrowLeft } from "lucide-react"

export default function AccountDashboard({ user }: { user: any }) {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showAccountForm, setShowAccountForm] = useState(false)
  const router = useRouter()

  // Redirect if no user
  if (!user) {
    router.push("/login")
    return null
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowOnboarding(false)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <div className="bg-white rounded-lg shadow-sm">
            <FreelancerOnboarding onClose={() => setShowOnboarding(false)} user={user} />
          </div>
        </div>
      </div>
    )
  }

  if (showAccountForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowAccountForm(false)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <AccountForm user={user} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0]}!
            </h1>
            <p className="text-gray-600">Choose how you'd like to get started</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowOnboarding(true)}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-[#00D37F] p-3 rounded-lg">
                    <UserPlus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Become a Freelancer</CardTitle>
                    <CardDescription>Complete your freelancer profile and start offering services</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Set up your professional profile, showcase your skills, and start earning by offering your services to
                  clients.
                </p>
                <Button className="w-full bg-[#00D37F] hover:bg-[#00c070] text-white">
                  Start Freelancer Onboarding
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowAccountForm(true)}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your profile and account preferences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Update your personal information, change your avatar, and manage your account settings.
                </p>
                <Button variant="outline" className="w-full">
                  Manage Account
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold mb-4">Quick Stats</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[#00D37F]">0</div>
                <div className="text-sm text-gray-600">Active Gigs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500">0</div>
                <div className="text-sm text-gray-600">Orders</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-500">0</div>
                <div className="text-sm text-gray-600">Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
