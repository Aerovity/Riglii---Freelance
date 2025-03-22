"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Check, Upload, X, Plus, Trash2 } from 'lucide-react'
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
    languages: [] as { language: string; level: string }[],
    categories: [] as string[],
    occupation: "",
    customOccupation: "",
    skills: [] as { skill: string; level: string }[],
    education: {
      country: "",
      university: "",
      title: "",
      major: "",
      year: "",
    },
    certificates: [] as { name: string; issuer: string; year: string }[],
    idCard: null as File | null,
    ccpDetails: {
      rib: "",
      name: "",
    },
  })

  // New state for form inputs
  const [newLanguage, setNewLanguage] = useState({ language: "", level: "Basic" })
  const [newSkill, setNewSkill] = useState({ skill: "", level: "Beginner" })
  const [newCertificate, setNewCertificate] = useState({ name: "", issuer: "", year: "" })
  const [showCustomOccupation, setShowCustomOccupation] = useState(false)

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

  const occupations = [
    "Web Developer",
    "Graphic Designer",
    "Content Writer",
    "Digital Marketer",
    "Video Editor",
    "Translator",
    "UI/UX Designer",
    "Mobile App Developer",
    "Data Scientist",
    "SEO Specialist",
    "Social Media Manager",
    "Photographer",
    "Illustrator",
    "Voice Over Artist",
    "Music Producer",
    "Business Consultant",
    "Virtual Assistant",
    "Accountant",
    "Legal Consultant",
    "Other"
  ]

  const proficiencyLevels = [
    "Basic",
    "Intermediate",
    "Fluent",
    "Bilingual/Native"
  ]

  const skillLevels = [
    "Beginner",
    "Intermediate",
    "Advanced",
    "Expert"
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

  const addLanguage = () => {
    if (newLanguage.language.trim() !== "") {
      setFormData({
        ...formData,
        languages: [...formData.languages, { ...newLanguage }]
      })
      setNewLanguage({ language: "", level: "Basic" })
    }
  }

  const removeLanguage = (index: number) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter((_, i) => i !== index)
    })
  }

  const addSkill = () => {
    if (newSkill.skill.trim() !== "") {
      setFormData({
        ...formData,
        skills: [...formData.skills, { ...newSkill }]
      })
      setNewSkill({ skill: "", level: "Beginner" })
    }
  }

  const removeSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index)
    })
  }

  const addCertificate = () => {
    if (newCertificate.name.trim() !== "" && newCertificate.issuer.trim() !== "") {
      setFormData({
        ...formData,
        certificates: [...formData.certificates, { ...newCertificate }]
      })
      setNewCertificate({ name: "", issuer: "", year: "" })
    }
  }

  const removeCertificate = (index: number) => {
    setFormData({
      ...formData,
      certificates: formData.certificates.filter((_, i) => i !== index)
    })
  }

  const handleOccupationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value === "Other") {
      setShowCustomOccupation(true)
      setFormData({
        ...formData,
        occupation: "Other"
      })
    } else {
      setShowCustomOccupation(false)
      setFormData({
        ...formData,
        occupation: value
      })
    }
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
                  {formData.languages.length > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">Language</div>
                        <div className="font-medium">Level</div>
                        <div></div>
                      </div>
                      {formData.languages.map((lang, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                          <div>{lang.language}</div>
                          <div>{lang.level}</div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeLanguage(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label htmlFor="language" className="block mb-2 text-sm">
                        Language
                      </Label>
                      <Input
                        id="language"
                        value={newLanguage.language}
                        onChange={(e) => setNewLanguage({ ...newLanguage, language: e.target.value })}
                        placeholder="e.g. English, French, Arabic"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="languageLevel" className="block mb-2 text-sm">
                        Proficiency
                      </Label>
                      <select
                        id="languageLevel"
                        className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00D37F]"
                        value={newLanguage.level}
                        onChange={(e) => setNewLanguage({ ...newLanguage, level: e.target.value })}
                      >
                        {proficiencyLevels.map((level) => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                    <Button 
                      onClick={addLanguage} 
                      disabled={!newLanguage.language.trim()}
                      className="bg-[#00D37F] hover:bg-[#00c070] text-white"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
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
                    onChange={handleOccupationChange}
                  >
                    <option value="" disabled>Select Occupation</option>
                    {occupations.map((occupation) => (
                      <option key={occupation} value={occupation}>{occupation}</option>
                    ))}
                  </select>
                </div>
                
                {showCustomOccupation && (
                  <div className="mt-3">
                    <Label htmlFor="customOccupation" className="block mb-2 text-sm">
                      Specify Your Occupation
                    </Label>
                    <Input
                      id="customOccupation"
                      value={formData.customOccupation}
                      onChange={(e) => handleInputChange(e, "customOccupation")}
                      placeholder="Enter your occupation"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="block mb-2">
                  Skills <span className="text-red-500">*</span>
                </Label>
                
                {formData.skills.length > 0 && (
                  <div className="mb-4 border rounded-md p-3">
                    {formData.skills.map((skill, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div className="font-medium">{skill.skill}</div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-3">{skill.level}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeSkill(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Add Skill (e.g. JavaScript, Photoshop)"
                      value={newSkill.skill}
                      onChange={(e) => setNewSkill({ ...newSkill, skill: e.target.value })}
                    />
                  </div>
                  <div className="flex-1">
                    <select
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00D37F]"
                      value={newSkill.level}
                      onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                    >
                      {skillLevels.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  <Button 
                    onClick={addSkill} 
                    disabled={!newSkill.skill.trim()}
                    className="bg-[#00D37F] hover:bg-[#00c070] text-white"
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <Label className="block mb-2">
                  Certifications
                </Label>
                
                {formData.certificates.length > 0 && (
                  <div className="mb-4 border rounded-md p-3">
                    {formData.certificates.map((cert, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <div className="font-medium">{cert.name}</div>
                          <div className="text-sm text-gray-600">
                            {cert.issuer} {cert.year && `• ${cert.year}`}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeCertificate(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <Input
                    placeholder="Certificate Name"
                    value={newCertificate.name}
                    onChange={(e) => setNewCertificate({ ...newCertificate, name: e.target.value })}
                  />
                  <Input
                    placeholder="Issuing Organization"
                    value={newCertificate.issuer}
                    onChange={(e) => setNewCertificate({ ...newCertificate, issuer: e.target.value })}
                  />
                  <Input
                    placeholder="Year (optional)"
                    value={newCertificate.year}
                    onChange={(e) => setNewCertificate({ ...newCertificate, year: e.target.value })}
                  />
                </div>
                <Button 
                  variant="outline"
                  onClick={addCertificate} 
                  disabled={!newCertificate.name.trim() || !newCertificate.issuer.trim()}
                  className="w-full text-[#00D37F] border-[#00D37F]"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Certificate
                </Button>
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
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-5 w-5" />
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
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
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
          className="bg-[#00D37F] hover:bg-[#00c070] text-white"
        >
          {step < 3 ? "Continue" : "Submit"}
        </Button>
      </div>
    </div>
  )
}