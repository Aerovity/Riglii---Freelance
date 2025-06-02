"use client"

import { Features } from "@/components/features"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import {
  UserCheck,
  FileText,
  Star,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
  DollarSign,
  Users,
  Award,
} from "lucide-react"
import Link from "next/link"

export default function HowToBecomeFreelancer() {
  const freelancerSteps = [
    {
      id: 1,
      title: "Create Your Profile",
      content:
        "Set up a compelling profile that showcases your skills, experience, and portfolio. Add a professional photo and write a captivating bio that highlights your expertise.",
      image: "/placeholder.svg?height=400&width=600",
      icon: <UserCheck className="w-6 h-6 text-[#00D37F]" />,
    },
    {
      id: 2,
      title: "Build Your Portfolio",
      content:
        "Upload your best work samples and case studies. Show potential clients what you can deliver by displaying high-quality examples of your previous projects.",
      image: "/placeholder.svg?height=400&width=600",
      icon: <FileText className="w-6 h-6 text-[#00D37F]" />,
    },
    {
      id: 3,
      title: "Set Your Rates",
      content:
        "Research market rates and set competitive pricing for your services. Start with competitive rates to build your reputation, then increase as you gain more reviews.",
      image: "/placeholder.svg?height=400&width=600",
      icon: <DollarSign className="w-6 h-6 text-[#00D37F]" />,
    },
    {
      id: 4,
      title: "Get Your First Reviews",
      content:
        "Deliver exceptional work to your first clients to earn 5-star reviews. Great reviews are crucial for attracting more clients and building your reputation on the platform.",
      image: "/placeholder.svg?height=400&width=600",
      icon: <Star className="w-6 h-6 text-[#00D37F]" />,
    },
    {
      id: 5,
      title: "Scale Your Business",
      content:
        "As you gain experience and positive reviews, you can increase your rates, take on bigger projects, and build long-term relationships with clients.",
      image: "/placeholder.svg?height=400&width=600",
      icon: <TrendingUp className="w-6 h-6 text-[#00D37F]" />,
    },
  ]

  const benefits = [
    {
      icon: <Shield className="w-8 h-8 text-[#00D37F]" />,
      title: "Secure Payments",
      description: "Get paid safely with our escrow system and payment protection",
    },
    {
      icon: <Zap className="w-8 h-8 text-[#00D37F]" />,
      title: "Quick Setup",
      description: "Start earning in minutes with our streamlined onboarding process",
    },
    {
      icon: <Users className="w-8 h-8 text-[#00D37F]" />,
      title: "Global Clients",
      description: "Access millions of clients from around the world",
    },
    {
      icon: <Award className="w-8 h-8 text-[#00D37F]" />,
      title: "Build Reputation",
      description: "Grow your professional reputation with our review system",
    },
  ]

  const stats = [
    { number: "2M+", label: "Active Freelancers" },
    { number: "$1B+", label: "Paid to Freelancers" },
    { number: "95%", label: "Client Satisfaction" },
    { number: "24/7", label: "Support Available" },
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
            <Badge className="mb-4 bg-[#AFF8C8]/50 text-[#00D37F] border-0">Start Your Journey</Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-[#0F2830] mb-6">How to Become a Freelancer</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Join millions of freelancers who are building successful careers on our platform. Follow our step-by-step
              guide to start earning money with your skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-[#00D37F] hover:bg-[#00B86A] text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Freelancing Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 hover:border-gray-400 px-8 py-3 rounded-xl"
              >
                Watch Tutorial
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
                <div className="text-3xl md:text-4xl font-bold text-[#00D37F] mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <Features data={freelancerSteps} collapseDelay={6000} linePosition="left" />

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#0F2830] mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide everything you need to build a successful freelancing career
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 p-3 rounded-2xl bg-[#AFF8C8]/20 w-fit">{benefit.icon}</div>
                    <CardTitle className="text-xl font-bold text-[#0F2830]">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-gray-600">{benefit.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#00D37F]">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Start Your Freelancing Journey?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of successful freelancers who are already earning money with their skills. It takes less
              than 5 minutes to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-[#00D37F] hover:bg-gray-100 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                Create Your Profile
                <CheckCircle className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-[#00D37F] px-8 py-3 rounded-xl"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-2xl font-bold text-[#0F2830] mb-4">Have Questions?</h3>
          <p className="text-gray-600 mb-8">Check out our comprehensive FAQ section or contact our support team</p>
          <Link href="/faq">
            <Button variant="outline" className="rounded-xl">
              View FAQ
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
