"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/app/language-provider"

export default function SiteFooter() {
  const { t } = useLanguage()

  return (
    <footer className="bg-[#0F2830] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div>
            <h3 className="font-bold mb-4">{t("categories")}</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/category/graphics-design" className="hover:text-[#00D37F]">
                  Graphics & Design
                </Link>
              </li>
              <li>
                <Link href="/category/digital-marketing" className="hover:text-[#00D37F]">
                  Digital Marketing
                </Link>
              </li>
              <li>
                <Link href="/category/writing-translation" className="hover:text-[#00D37F]">
                  Writing & Translation
                </Link>
              </li>
              <li>
                <Link href="/category/video-animation" className="hover:text-[#00D37F]">
                  Video & Animation
                </Link>
              </li>
              <li>
                <Link href="/category/music-audio" className="hover:text-[#00D37F]">
                  Music & Audio
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">{t("about")}</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/terms" className="hover:text-[#00D37F]">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#00D37F]">
                  Press & News
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#00D37F]">
                  Partnerships
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#00D37F]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#00D37F]">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">{t("support")}</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/contact-support" className="hover:text-[#00D37F]">
                  Help & Support
                </Link>
              </li>
              <li>
                <Link href="/contact-support" className="hover:text-[#00D37F]">
                  Trust & Safety
                </Link>
              </li>
              <li>
                <Link href="/contact-support" className="hover:text-[#00D37F]">
                  Selling on Riglii
                </Link>
              </li>
              <li>
                <Link href="/contact-support" className="hover:text-[#00D37F]">
                  Buying on Riglii
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">{t("community")}</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="https://www.instagram.com/riglii.dz" className="hover:text-[#00D37F]">
                  Events
                </Link>
              </li>
              <li>
                <Link href="https://www.instagram.com/riglii.dz" className="hover:text-[#00D37F]">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="https://www.instagram.com/riglii.dz" className="hover:text-[#00D37F]">
                  Forum
                </Link>
              </li>
              <li>
                <Link href="https://www.instagram.com/riglii.dz" className="hover:text-[#00D37F]">
                  Affiliates
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h3 className="font-bold mb-4">{t("rigliiBusiness")}</h3>
            <p className="text-sm text-gray-300 mb-4">{t("businessDesc")}</p>
            <Button className="bg-[#00D37F] hover:bg-[#00c070] text-white w-full">{t("exploreSolutions")}</Button>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/Riglii_logo.png"
                alt="Riglii Logo"
                width={100}
                height={32}
                className="h-8 w-auto"
              />
              <ArrowRight className="h-4 w-4 text-[#00D37F] ml-1 transform rotate-45" />
            </Link>
            <p className="text-sm text-gray-400">© 2025 Riglii Inc.</p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="https://www.instagram.com/riglii.dz" className="text-gray-400 hover:text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-twitter"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </Link>
            <Link href="https://www.instagram.com/riglii.dz" className="text-gray-400 hover:text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-facebook"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </Link>
            <Link href="https://www.instagram.com/riglii.dz" className="text-gray-400 hover:text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-linkedin"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </Link>
            <Link href="https://www.instagram.com/riglii.dz" className="text-gray-400 hover:text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-instagram"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}