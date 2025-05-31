"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import AccountForm from "./account-form"
import FreelancerOnboarding from "@/components/freelancer-onboarding"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, Clock, FileText, Upload, Eye } from "lucide-react"
import { UserPlus, Settings, ArrowLeft, Edit } from "lucide-react"

export default function AccountDashboard({ user }: { user: any }) {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [isFreelancer, setIsFreelancer] = useState(false)
  const [freelancerStats, setFreelancerStats] = useState({
    activeGigs: 0,
    totalOrders: 0,
    totalReviews: 0,
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
          const { data: userData } = await supabase.from("users").select("is_freelancer").eq("id", user.id).single()

          if (userData?.is_freelancer === true) {
            setIsFreelancer(true)
          } else {
            // Check if they have a freelancer profile
            const { data: profileData } = await supabase
              .from("freelancer_profiles")
              .select("user_id")
              .eq("user_id", user.id)
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
            totalReviews: 0,
          })
        }
      } catch (error) {
        console.error("Error checking freelancer status:", error)
      } finally {
        setLoading(false)
      }
    }

    checkFreelancerStatus()
  }, [user?.id, supabase, isFreelancer])

  const [projects, setProjects] = useState([])
  const [projectsLoading, setProjectsLoading] = useState(true)

  // Fetch accepted projects
  useEffect(() => {
    async function fetchProjects() {
      if (!user?.id) return

      try {
        setProjectsLoading(true)

        // Get accepted forms where user is either sender or receiver - ONLY COMMERCIAL FORMS
        const { data: formsData, error } = await supabase
          .from("forms")
          .select("*")
          .eq("status", "accepted")
          .eq("form_type", "commercial") // Add this filter for commercial forms only
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching projects:", error)
          throw error
        }

        // Get user details for each form
        const projectsWithUsers = await Promise.all(
          (formsData || []).map(async (form) => {
            // Get sender details
            const { data: senderData } = await supabase
              .from("users")
              .select("id, email")
              .eq("id", form.sender_id)
              .single()

            // Get receiver details
            const { data: receiverData } = await supabase
              .from("users")
              .select("id, email")
              .eq("id", form.receiver_id)
              .single()

            return {
              ...form,
              sender: senderData,
              receiver: receiverData,
            }
          }),
        )

        console.log("Fetched projects:", projectsWithUsers)
        setProjects(projectsWithUsers || [])
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setProjectsLoading(false)
      }
    }

    fetchProjects()
  }, [user?.id, supabase])

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

  const handleProjectClick = (project) => {
    // Navigate to messages and focus on the conversation
    router.push(`/messages?conversation=${project.conversation_id}`)
  }

  const handleSubmitProject = (project: any) => {
    // For freelancers, navigate to messages and trigger project submission
    router.push(`/messages?conversation=${project.conversation_id}&form=${project.id}&action=submit`)
  }

  const getProjectStatus = (project: any) => {
    if (project.project_submitted) {
      return { label: "Done", color: "bg-green-100 text-green-800" }
    }
    return { label: "In Progress", color: "bg-blue-100 text-blue-800" }
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
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setShowOnboarding(true)}
              >
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
                    Set up your professional profile, showcase your skills, and start earning by offering your services
                    to clients.
                  </p>
                  <Button className="w-full bg-[#00D37F] hover:bg-[#00c070] text-white">
                    Start Freelancer Onboarding
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Show freelancer edit option only if is a freelancer */}
            {isFreelancer && (
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push("/account/freelancer-edit")}
              >
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
                  <Button className="w-full bg-[#00D37F] hover:bg-[#00c070] text-white">Edit Profile</Button>
                </CardContent>
              </Card>
            )}

            {/* Show freelancer profile preview if is a freelancer */}
            {isFreelancer && (
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/freelancer/${user.id}`)}
              >
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

          {/* Projects Dashboard Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Projects Dashboard</h2>
              <Button variant="outline" onClick={() => router.push("/messages")} className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View All Messages
              </Button>
            </div>

            {projectsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D37F] mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Commercial Projects Yet</h3>
                  <p className="text-gray-600">
                    {isFreelancer
                      ? "You haven't received any accepted commercial projects yet."
                      : "You haven't had any commercial projects accepted yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="max-h-96 overflow-y-auto pr-2">
                <div className="grid gap-4">
                  {projects.map((project: any) => {
                    const isFreelancerProject = project.receiver_id === user.id && isFreelancer
                    const isClientProject = project.sender_id === user.id && !isFreelancer
                    const status = getProjectStatus(project)

                    return (
                      <Card key={project.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-1">{project.title}</CardTitle>
                              <CardDescription className="text-sm">Commercial Project</CardDescription>
                            </div>
                            <Badge className={status.color}>{status.label}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <DollarSign className="h-4 w-4" />
                              <span>{project.price.toLocaleString()} DZD</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>{project.time_estimate}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(project.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="font-medium">{isFreelancerProject ? "Client:" : "Freelancer:"}</span>
                              <span>
                                {isFreelancerProject
                                  ? project.sender?.email?.split("@")[0]
                                  : project.receiver?.email?.split("@")[0]}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => handleProjectClick(project)} className="flex-1">
                              <Eye className="h-4 w-4 mr-2" />
                              View Discussion
                            </Button>

                            {/* Show Submit Project button for freelancers on commercial forms that aren't submitted */}
                            {isFreelancerProject && !project.project_submitted && (
                              <Button
                                onClick={() => handleSubmitProject(project)}
                                className="bg-[#00D37F] hover:bg-[#00c070] text-white"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Submit Project
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold mb-4">{isFreelancer ? "Freelancer Stats" : "Quick Stats"}</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[#00D37F]">{isFreelancer ? freelancerStats.activeGigs : 0}</div>
                <div className="text-sm text-gray-600">{isFreelancer ? "Active Gigs" : "Active Gigs"}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500">{isFreelancer ? freelancerStats.totalOrders : 0}</div>
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
