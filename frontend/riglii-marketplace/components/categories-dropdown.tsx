"use client"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import Link from "next/link"

export default function CategoriesDropdown() {
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
    <NavigationMenu>
      <NavigationMenuList>
        {Object.entries(categories).map(([category, subcategories]) => (
          <NavigationMenuItem key={category}>
            <NavigationMenuTrigger className="text-[#0F2830] hover:text-[#00D37F] font-medium">
              {category}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid gap-3 p-6 w-[400px]">
                <div className="grid grid-cols-2 gap-4">
                  {subcategories.map((subcategory) => (
                    <Link
                      key={subcategory}
                      href={`/${subcategory.toLowerCase().replace(/\s+/g, "-")}`}
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-[#AFF8C8]/10 hover:text-[#00D37F]"
                    >
                      {subcategory}
                    </Link>
                  ))}
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

