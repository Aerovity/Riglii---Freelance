"use client"

import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, Star, Heart } from 'lucide-react'
import { useLanguage } from "@/app/language-provider"

export default function CategoryPage() {
  const params = useParams()
  const { t } = useLanguage()
  const category = (params.category as string).replace(/-/g, " ")

  // Logo styles for the horizontal scroll
  const logoStyles = [
    { id: 1, name: "Minimalist", icon: "🎯" },
    { id: 2, name: "Hand-drawn", icon: "✏️" },
    { id: 3, name: "Vintage", icon: "🎨" },
    { id: 4, name: "Cartoon", icon: "🎭" },
    { id: 5, name: "3D", icon: "💫" },
    { id: 6, name: "Lettering", icon: "📝" },
    { id: 7, name: "Geometric", icon: "⬡" },
    { id: 8, name: "Signature", icon: "✍️" },
  ]

  // Sample gigs data
  const gigs = Array(8).fill(null).map((_, i) => ({
    id: i + 1,
    title: `I will create a professional ${category.toLowerCase()} design`,
    seller: {
      name: `Seller ${i + 1}`,
      level: Math.floor(Math.random() * 3) + 1,
      rating: (4 + Math.random()).toFixed(1),
      reviews: Math.floor(Math.random() * 1000) + 100,
    },
    price: Math.floor(Math.random() * 5000) + 1000,
  }))

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center text-sm">
            <Link href="/" className="text-gray-500 hover:text-[#00D37F]">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
            <span className="text-[#0F2830] font-medium capitalize">{category}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F2830] mb-2 capitalize">{category}</h1>
          <p className="text-gray-600">Stand out from the crowd with a design that fits your brand personality.</p>
        </div>

        {/* Service Options */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Button
            variant="outline"
            className="h-auto p-6 flex items-center gap-4 hover:border-[#00D37F]"
          >
            <div className="h-12 w-12 rounded-full bg-[#AFF8C8] flex items-center justify-center text-[#014751]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-[#0F2830] mb-1">Custom services</h3>
              <p className="text-sm text-gray-600">Find a professional designer</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-6 flex items-center gap-4 hover:border-[#00D37F]"
          >
            <div className="h-12 w-12 rounded-full bg-[#AFF8C8] flex items-center justify-center text-[#014751]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-[#0F2830] mb-1">AI Designer</h3>
              <p className="text-sm text-gray-600">Customize pre-made designs</p>
            </div>
          </Button>
        </div>

        {/* Style Categories */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[#0F2830] mb-4">Select style</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {logoStyles.map((style) => (
              <Button
                key={style.id}
                variant="outline"
                className="flex-shrink-0 h-auto py-6 px-8 flex flex-col items-center gap-2 hover:border-[#00D37F]"
              >
                <span className="text-2xl">{style.icon}</span>
                <span className="text-sm font-medium">{style.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button variant="outline" className="text-[#0F2830]">
            Service options
            <ChevronRight className="h-4 w-4 ml-2 rotate-90" />
          </Button>
          <Button variant="outline" className="text-[#0F2830]">
            Seller details
            <ChevronRight className="h-4 w-4 ml-2 rotate-90" />
          </Button>
          <Button variant="outline" className="text-[#0F2830]">
            Budget
            <ChevronRight className="h-4 w-4 ml-2 rotate-90" />
          </Button>
          <Button variant="outline" className="text-[#0F2830]">
            Delivery time
            <ChevronRight className="h-4 w-4 ml-2 rotate-90" />
          </Button>
        </div>

        {/* Results */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">{gigs.length.toLocaleString()}+ services available</p>
          <select className="border rounded-md px-3 py-2 text-sm text-[#0F2830] focus:outline-none focus:ring-2 focus:ring-[#00D37F]">
            <option>Best selling</option>
            <option>Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>

        {/* Gigs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {gigs.map((gig) => (
            <div key={gig.id} className="group relative rounded-lg overflow-hidden border border-gray-200 bg-white">
              <div className="absolute top-3 right-3 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/80 backdrop-blur-sm rounded-full h-8 w-8 text-gray-700 hover:text-[#00D37F]"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <div className="relative h-48 w-full">
                <Image
                  src={`/placeholder.svg?height=200&width=300&text=Gig${gig.id}`}
                  alt="Gig preview"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#AFF8C8] flex items-center justify-center text-[#014751] font-medium">
                    {gig.seller.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{gig.seller.name}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      Level {gig.seller.level} <span className="mx-1">•</span> Top Rated
                    </div>
                  </div>
                </div>

                <h3 className="font-medium text-[#0F2830] mb-3 line-clamp-2">{gig.title}</h3>

                <div className="flex items-center text-sm text-amber-500 mb-3">
                  <Star className="h-4 w-4 fill-amber-500 stroke-amber-500" />
                  <span className="ml-1 font-medium">{gig.seller.rating}</span>
                  <span className="text-gray-400 ml-1">({gig.seller.reviews})</span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">{t("from")}</p>
                  <p className="font-bold text-[#0F2830]">
                    {new Intl.NumberFormat("fr-DZ", {
                      style: "currency",
                      currency: "DZD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(gig.price)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}