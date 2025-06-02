"use client"

import { Features } from "@/components/features"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import {
  Search,
  MessageSquare,
  CreditCard,
  CheckCircle,
  Star,
  Shield,
  Clock,
  Headphones,
  ArrowRight,
  FileText,
  Users,
  Zap,
} from "lucide-react"
import Link from "next/link"

export default function HowToOrder() {
  const orderSteps = [
    {
      id: 1,
      title: "Browse & Search",
      content:
        "Explore thousands of services or use our smart search to find exactly what you need. Filter by category, price, delivery time, and seller rating to find the perfect match.",
      image: "/placeholder.svg?height=400&width=600",
      icon: <Search className="w-6 h-6 text-blue-600" />,
    },
    {
      id: 2,
      title: "Contact the Seller",
      content:
        "Message the freelancer to discuss your project requirements, timeline, and any specific details. Most sellers respond within a few hours to help clarify your needs.",
      image: "/placeholder.svg?height=400&width=600",
      icon: <MessageSquare className="w-6 h-6 text-green-600" />,
    },
    {
      id: 3,
      title: "Place Your Order",
      content:
        "Choose the right package for your needs and make a secure payment. Your money is held safely in escrow until you're completely satisfied with the delivered work.",
      image: "/placeholder.svg?height=400&width=600",
      icon: <CreditCard className="w-6 h-6 text-purple-600" />,
    },
    {
      id: 4,
      title: "Track Progress",
      content:
        "Stay updated with real-time progress updates from your freelancer. Communicate through our platform and request revisions if needed during the process.",
      image: "/placeholder.svg?height=400&width=600",
      icon: <Clock className="w-6 h-6 text-orange-600" />,
    },
    {
      id: 5,
      title: "Receive & Review",
      content:
        "Get your completed project delivered on time. Review the work, request any final changes, and leave a review to help other buyers make informed decisions.",
      image: "/placeholder.svg?height=400&width=600",
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
    },
  ]

  const protections = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Money-Back Guarantee",
      description: "Get a full refund if you're not satisfied with the delivered work",
    },
    {
      icon: <Clock className="w-8 h-8 text-green-600" />,
      title: "On-Time Delivery",
      description: "Freelancers commit to delivery dates, or you get your money back",
    },
    {
      icon: <Headphones className="w-8 h-8 text-purple-600" />,
      title: "24/7 Support",
      description: "Our customer support team is always here to help resolve any issues",
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-600" />,
      title: "Quality Assurance",
      description: "All freelancers are vetted and rated by previous clients",
    },
  ]

  const tips = [
    {
      title: "Be Clear About Requirements",
      description: "Provide detailed project descriptions and examples to get the best results",
      icon: <FileText className="w-6 h-6 text-blue-600" />,
    },
    {
      title: "Check Seller Reviews",
      description: "Read previous buyer reviews and check the seller's portfolio before ordering",
      icon: <Users className="w-6 h-6 text-green-600" />,
    },
    {
      title: "Communicate Regularly",
      description: "Stay in touch with your freelancer throughout the project for best results",
      icon: <MessageSquare className="w-6 h-6 text-purple-600" />,
    },
    {
      title: "Start Small",
      description: "Begin with a smaller project to test the freelancer before larger commitments",
      icon: <Zap className="w-6 h-6 text-orange-600" />,
    },
  ]

  const stats = [
    { number: "10M+", label: "Orders Completed" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "4.9/5", label: "Average Rating" },
    { number: "< 24h", label: "Average Response Time" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-gradient-to-r from-green-100 to-blue-100 text-green-700 border-0">
              Simple Process
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-blue-800 bg-clip-text text-transparent mb-6">
              How to Order Services
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Getting professional services has never been easier. Follow our simple 5-step process to find, hire, and
              work with top freelancers from around the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Browse Services
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 hover:border-gray-400 px-8 py-3 rounded-xl"
              >
                Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <Features data={orderSteps} collapseDelay={6000} linePosition="left" />

      {/* Buyer Protection Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Order is Protected</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide comprehensive buyer protection to ensure you get exactly what you ordered
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {protections.map((protection, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 p-3 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 w-fit">
                      {protection.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">{protection.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-gray-600">{protection.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Pro Tips for Better Results</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Follow these expert tips to get the most out of your freelancer collaboration
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {tips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200">{tip.icon}</div>
                      <CardTitle className="text-xl font-bold text-gray-900">{tip.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-base">{tip.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Browse thousands of professional services and find the perfect freelancer for your next project. Quality
              work, delivered on time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                Start Browsing
                <Search className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-3 rounded-xl"
              >
                Contact Support
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Help with Your Order?</h3>
          <p className="text-gray-600 mb-8">
            Our support team is available 24/7 to help you with any questions or issues
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/support">
              <Button variant="outline" className="rounded-xl">
                Contact Support
                <Headphones className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/help">
              <Button variant="outline" className="rounded-xl">
                Help Center
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
