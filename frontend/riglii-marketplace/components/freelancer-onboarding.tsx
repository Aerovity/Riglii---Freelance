"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Check, Upload, X } from 'lucide-react'
import { DialogTitle } from "@/components/ui/dialog"
import { useUser } from "@clerk/nextjs"

interface FreelancerOnboardingProps {
  onClose: () => void
}

export default function FreelancerOnboarding({ onClose }: FreelancerOnboardingProps) {
  const { user } = useUser()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    displayName: user?.username || "",
    description: "",
    languages: [{ language: "English", level: "Basic" }],
    categories: [] as string[],
    occupation: "",
    skills: [] as { skill: string; level: string }[],
    education: {
      country: "",
      university: "",
      title: "",
      major: "",
      year: "",
    },
    idCard: null as File | null,
    ccpDetails: {
      rib: "",
      name: "",
    },
  })

  const categories = [
    "Logo & Brand Identity",
    "Web & App Design",
    "Visual Design",
    "Art & Illustration",
    "Digital Marketing",
    "Writing & Translation",
    "Video & Animation",
    "Music & Audio",
    "Programming & Tech",
    "Business",
    "Data",
    "Photography",
  ]

  const handleCategoryToggle = (category: string) => {
    if (formData.categories.includes(category)) {
      setFormData({
        ...formData,
        categories: formData.categories.filter((c) => c !== category),
      })
    } else {
      if (formData.categories.length < 5) {
        setFormData({
          ...formData,
          categories: [...formData.categories, category],
        })
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'idCard') => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        [field]: e.target.files[0],
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    setFormData({
      ...formData,
      [field]: e.target.value,
    })
  }

  const handleNestedInputChange = (e: React.ChangeEvent<HTMLInputElement>, parent: keyof typeof formData, field: string) => {
    setFormData({
      ...formData,
      [parent]: {
        ...(formData[parent] as Record<string, any>),
        [field]: e.target.value,
      },
    })
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="p-6">
            <DialogTitle className="text-2xl font-bold mb-6">Personal Info</DialogTitle>
            <p className="text-gray-600 mb-6">
              Tell us a bit about yourself. This information will appear on your public profile, so that potential buyers can get to know you better.
            </p>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="block mb-2">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange(e, "firstName")}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="block mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange(e, "lastName")}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="displayName" className="block mb-2">
                  Display Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange(e, "displayName")}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="block mb-2">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Share a bit about your work experience, cool projects you've completed, and your area of expertise."
                  className="h-32"
                  value={formData.description}
                  onChange={(e) => handleInputChange(e, "description")}
                  required
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {formData.description.length} / 600
                </div>
              </div>

              <div>
                <Label className="block mb-2">
                  Languages <span className="text-red-500">*</span>
                </Label>
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">Language</div>
                    <div className="font-medium">Level</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>English</div>
                    <div>Basic</div>
                  </div>
                  <Button variant="outline" className="w-full mt-4 text-[#00D37F]">
                    + Add New
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="p-6">
            <DialogTitle className="text-2xl font-bold mb-6">Professional Info</DialogTitle>
            <p className="text-gray-600 mb-6">
              This is your time to shine. Let potential buyers know what you do best and how you gained your skills, certifications and experience.
            </p>
            <div className="space-y-6">
              <div>
                <Label className="block mb-2">
                  Your Categories <span className="text-red-500">*</span> (Choose up to 5)
                </Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      type="button"
                      variant={formData.categories.includes(category) ? "default" : "outline"}
                      className={`justify-start h-auto py-3 px-4 ${
                        formData.categories.includes(category) 
                          ? "bg-[#00D37F] text-white" 
                          : "hover:border-[#00D37F] hover:text-[#00D37F]"
                      }`}
                      onClick={() => handleCategoryToggle(category)}
                    >
                      {formData.categories.includes(category) && (
                        <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                      )}
                      <span className="text-sm">{category}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="occupation" className="block mb-2">
                  Your Occupation <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <select
                    id="occupation"
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00D37F]"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  >
                    <option value="" disabled>Select Occupation</option>
                    <option value="Web Developer">Web Developer</option>
                    <option value="Graphic Designer">Graphic Designer</option>
                    <option value="Content Writer">Content Writer</option>
                    <option value="Digital Marketer">Digital Marketer</option>
                    <option value="Video Editor">Video Editor</option>
                    <option value="Translator">Translator</option>
                  </select>
                </div>
                <Button variant="link" className="text-[#00D37F] p-0 h-auto mt-2">
                  + Add New
                </Button>
              </div>

              <div>
                <Label className="block mb-2">
                  Skills <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <select
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00D37F]"
                    >
                      <option value="">Add Skill (e.g. Voice Talent)</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <select
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00D37F]"
                    >
                      <option value="">Experience Level</option>
                    </select>
                  </div>
                  <Button variant="secondary" className="flex-shrink-0">
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="p-6">
            <DialogTitle className="text-2xl font-bold mb-6">Account Security</DialogTitle>
            <p className="text-gray-600 mb-6">
              To ensure the security of your account and facilitate payments, please provide the following information.
            </p>
            <div className="space-y-6">
              <div>
                <Label className="block mb-2">
                  Algerian ID Card <span className="text-red-500">*</span>
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {formData.idCard ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-[#AFF8C8] p-2 rounded-md mr-3">
                          <Check className="h-5 w-5 text-[#014751]" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{formData.idCard.name}</p>
                          <p className="text-sm text-gray-500">
                            {(formData.idCard.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData({ ...formData, idCard: null })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500 mb-2">
                        Drag and drop your ID card image, or click to browse
                      </p>
                      <Button variant="outline" className="mx-auto" asChild>
                        <label>
                          Browse Files
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'idCard')}
                          />
                        </label>
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Please upload a clear photo of your Algerian ID card. This information is kept secure and is only used for verification purposes.
                </p>
              </div>

              <div>
                <Label className="block mb-4">
                  CCP Poste Details <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ccpRib" className="block mb-2 text-sm">
                      RIB Number
                    </Label>
                    <Input
                      id="ccpRib"
                      placeholder="Enter your CCP RIB number"
                      value={formData.ccpDetails.rib}
                      onChange={(e) => handleNestedInputChange(e, "ccpDetails", "rib")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ccpName" className="block mb-2 text-sm">
                      Account Holder Name
                    </Label>
                    <Input
                      id="ccpName"
                      placeholder="Enter the name on your CCP account"
                      value={formData.ccpDetails.name}
                      onChange={(e) => handleNestedInputChange(e, "ccpDetails", "name")}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Your payment information is kept secure and will only be used to process payments for your services.
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    console.log("Form submitted:", formData)
    onClose()
    // You might want to show a success message or redirect
  }

  return (
    <div className="flex flex-col h-[80vh]">
      {/* Progress indicator */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? "bg-[#00D37F] text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              1
            </div>
            <div className="h-1 w-12 bg-gray-200">
              <div
                className="h-full bg-[#00D37F]"
                style={{ width: step > 1 ? "100%" : "0%" }}
              ></div>
            </div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? "bg-[#00D37F] text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              2
            </div>
            <div className="h-1 w-12 bg-gray-200">
              <div
                className="h-full bg-[#00D37F]"
                style={{ width: step > 2 ? "100%" : "0%" }}
              ></div>
            </div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3 ? "bg-[#00D37F] text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              3
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Form content */}
      <div className="flex-1 overflow-y-auto">
        {renderStep()}
      </div>

      {/* Footer with navigation buttons */}
      <div className="bg-gray-50 px-6 py-4 border-t flex justify-between">
        <Button
          variant="outline"
          onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
        >
          {step > 1 ? "Back" : "Cancel"}
        </Button>
        <Button
          onClick={() => {
            if (step < 3) {
              setStep(step + 1)
            } else {
              handleSubmit()
            }
          }}
        >
          {step < 3 ? "Continue" : "Submit"}
        </Button>
      </div>
    </div>
  )
}