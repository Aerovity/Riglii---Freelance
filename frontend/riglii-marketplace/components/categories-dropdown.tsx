"use client"

import { useState } from "react"
import Link from "next/link"
import { CustomNavTrigger } from "./CustomNavTrigger"

export default function CategoriesDropdown() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const categories = {
    "Logo & Brand Identity": [
      "Logo Design",
      "Brand Style Guides",
      "Business Cards & Stationery",
      "Fonts & Typography",
      "Brand Voice & Tone",
      "Logo Animation",
    ],
    "Web & App Design": [
      "Website Design",
      "App Design",
      "UX Design",
      "Landing Page Design",
      "Icon Design",
      "Wireframing",
      "Prototyping",
      "Mobile UI Design",
    ],
    "Visual Design": [
      "Image Editing",
      "AI Image Editing",
      "Presentation Design",
      "Background Removal",
      "Infographic Design",
      "Vector Tracing",
      "Photo Retouching",
      "3D Product Visualization",
    ],
    "Art & Illustration": [
      "Illustration",
      "AI Artists",
      "Pattern Design",
      "Portraits & Caricatures",
      "Cartoons & Comics",
      "Children's Book Illustration",
      "Tattoo Design",
      "Storyboards",
    ],
    "Digital Marketing": [
      "Social Media Marketing",
      "SEO Services",
      "Email Marketing",
      "Content Marketing",
      "PPC Advertising",
      "Influencer Marketing",
      "Marketing Strategy",
      "Web Analytics",
    ],
    "Writing & Translation": [
      "Content Writing",
      "Copywriting",
      "Translation",
      "Proofreading & Editing",
      "Resume Writing",
      "Technical Writing",
      "Creative Writing",
      "Scriptwriting",
    ],
    "Video & Animation": [
      "Video Editing",
      "Animation",
      "Motion Graphics",
      "Whiteboard & Explainer Videos",
      "3D Animation",
      "Intro & Outro Videos",
      "Visual Effects",
      "Subtitles & Captions",
    ],
    "Music & Audio": [
      "Voice Over",
      "Music Production",
      "Audio Editing",
      "Podcast Production",
      "Sound Design",
      "Mixing & Mastering",
      "Jingles & Intros",
      "Audio Ads Production",
    ],
  }

  return (
    <div className="flex space-x-4 border-b border-gray-100 py-1 px-2 text-sm">
  {Object.entries(categories).map(([category, subcategories]) => (
    <div key={category} className="relative">
      <CustomNavTrigger
        onClick={() =>
          setActiveCategory(activeCategory === category ? null : category)
        }
      >
        {category}
      </CustomNavTrigger>

      {activeCategory === category && (
        <div className="absolute left-0 top-full mt-2 z-50 w-[300px] bg-white text-[#0F2830] shadow-md rounded-md p-2">
          <div className="grid grid-cols-2 gap-4">
            {subcategories.map((subcategory) => (
              <Link
                key={subcategory}
                href={`/${subcategory.toLowerCase().replace(/\s+/g, "-")}`}
                className="block rounded-md p-2 no-underline transition-colors hover:bg-[#AFF8C8]/10 hover:text-[#00D37F]"
                onClick={() => setActiveCategory(null)}
              >
                {subcategory}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  ))}
</div>
  )
}
