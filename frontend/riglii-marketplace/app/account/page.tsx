"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Globe, Phone, MapPin } from "lucide-react"

export default function AccountPage() {
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    username: "johndoe",
    bio: "Software developer passionate about creating amazing user experiences.",
    website: "https://johndoe.dev",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    avatar: "/placeholder.svg?height=100&width=100",
  })

  const handleInputChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleUpdateProfile = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)
    // Show success message or handle response
    console.log("Profile updated:", profile)
  }

  const handleSignOut = () => {
    // Handle sign out logic
    console.log("Signing out...")
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and profile information.</p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal information and profile details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                <AvatarFallback className="text-lg">
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" size="sm">
                  Change Avatar
                </Button>
                <p className="text-sm text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
              </div>
            </div>

            <Separator />

            {/* Form Fields */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profile.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="Enter your username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website
                </Label>
                <Input
                  id="website"
                  value={profile.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="Enter your website URL"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Enter your location"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about yourself"
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your account settings and preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleUpdateProfile} disabled={loading} className="flex-1">
                {loading ? "Updating..." : "Update Profile"}
              </Button>
              <Button variant="outline" onClick={handleSignOut} className="flex-1">
                Sign Out
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
              <p className="text-xs text-muted-foreground">
                This action cannot be undone. This will permanently delete your account.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
