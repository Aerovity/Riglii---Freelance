import { Metadata } from "next"
import { DownloadButton } from "./download-button"
import { termsContent } from "./terms-content"

export const metadata: Metadata = {
  title: "Terms and Conditions | Riglii",
  description: "Terms and conditions for using Riglii marketplace platform",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{termsContent.title}</h1>
              <p className="text-gray-600 mt-2">Last updated: {termsContent.lastUpdated}</p>
            </div>
            <DownloadButton />
          </div>
        </div>
        
        {/* Content Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="space-y-8">
            {termsContent.sections.map((section, index) => (
              <section 
                key={section.title}
                className={index < termsContent.sections.length - 1 ? "border-b border-gray-200 pb-6" : ""}
              >
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">{section.title}</h2>
                {Array.isArray(section.content) ? (
                  <ul className="list-disc pl-6 space-y-3 text-gray-700">
                    {section.content.map((item, i) => (
                      <li key={i} className="leading-relaxed">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700 leading-relaxed">{section.content}</p>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 