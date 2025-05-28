"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import AccountForm from "./account-form"
import FreelancerOnboarding from "@/components/freelancer-onboarding"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Settings, ArrowLeft, Edit, Eye } from "lucide-react"

export default function AccountDashboard({ user }: { user: any }) {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [isFreelancer, setIsFreelancer] = useState(false)
  const [freelancerStats, setFreelancerStats] = useState({
    activeGigs: 0,
    totalOrders: 0,
    totalReviews: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Check if user is a freelancer
  useEffect(() => {
    async function checkFreelancerStatus() {
      if (!user?.id) return

      try {
        setLoading(true)

        // First check user metadata
        if (user?.user_metadata?.is_freelancer === true) {
          setIsFreelancer(true)
        } else {
          // Check users table
          const { data: userData } = await supabase
            .from('users')
            .select('is_freelancer')
            .eq('id', user.id)
            .single()
          
          if (userData?.is_freelancer === true) {
            setIsFreelancer(true)
          } else {
            // Check if they have a freelancer profile
            const { data: profileData } = await supabase
              .from('freelancer_profiles')
              .select('user_id')
              .eq('user_id', user.id)
              .single()
            
            if (profileData) {
              setIsFreelancer(true)
            }
          }
        }

        // If they are a freelancer, get some basic stats
        if (isFreelancer) {
          // You can implement these queries based on your gigs/orders tables
          // For now, keeping them as 0
          setFreelancerStats({
            activeGigs: 0,
            totalOrders: 0,
            totalReviews: 0
          })
        }
      } catch (error) {
        console.error('Error checking freelancer status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkFreelancerStatus()
  }, [user?.id, supabase, isFreelancer])

  // Redirect if no user
  if (!user) {
    router.push("/login")
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D37F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
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
            <p className="text-gray-600">
              {isFreelancer ? "Manage your freelancer profile and account" : "Choose how you'd like to get started"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Show freelancer onboarding only if not a freelancer */}
            {!isFreelancer && (
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
            )}

            {/* Show freelancer edit option only if is a freelancer */}
            {isFreelancer && (
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push("/account/freelancer-edit")}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-[#00D37F] p-3 rounded-lg">
                      <Edit className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>Edit Freelancer Profile</CardTitle>
                      <CardDescription>Update your professional profile and services</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Update your rates, description, portfolio images, and other profile information that clients see.
                  </p>
                  <Button className="w-full bg-[#00D37F] hover:bg-[#00c070] text-white">
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Show freelancer profile preview if is a freelancer */}
            {isFreelancer && (
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push(`/freelancer/${user.id}`)}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-500 p-3 rounded-lg">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>View Public Profile</CardTitle>
                      <CardDescription>See how clients view your profile</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Preview your public freelancer profile as clients see it.
                  </p>
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            )}

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
            <h3 className="font-semibold mb-4">
              {isFreelancer ? "Freelancer Stats" : "Quick Stats"}
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[#00D37F]">
                  {isFreelancer ? freelancerStats.activeGigs : 0}
                </div>
                <div className="text-sm text-gray-600">
                  {isFreelancer ? "Active Gigs" : "Active Gigs"}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500">
                  {isFreelancer ? freelancerStats.totalOrders : 0}
                </div>
                <div className="text-sm text-gray-600">Orders</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-500">
                  {isFreelancer ? freelancerStats.totalReviews : 0}
                </div>
                <div className="text-sm text-gray-600">Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}