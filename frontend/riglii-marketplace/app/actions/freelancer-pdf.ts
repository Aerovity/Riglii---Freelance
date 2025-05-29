"use server"

import puppeteer from "puppeteer"
import { Resend } from "resend"

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY)

interface FreelancerData {
  firstName: string
  lastName: string
  displayName: string
  description: string
  languages: { language: string; proficiency_level: string }[]
  categories: string[]
  occupation: string
  customOccupation: string
  skills: { skill: string; level: string }[]
  education: {
    country: string
    university: string
    title: string
    major: string
    year: string
  }
  certificates: { name: string; issuer: string; year: string }[]
  ccpDetails: {
    rib: string
    name: string
  }
  email: string
  submissionDate: string
  userEmail?: string // The actual freelancer's email
}

function generateHTMLTemplate(data: FreelancerData): string {
  const submissionDate = new Date(data.submissionDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Freelancer Profile - ${data.firstName} ${data.lastName}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                background: #f8f9fa;
                padding: 20px;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #00D37F, #00c070);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }
            
            .header h1 {
                font-size: 2.5em;
                margin-bottom: 10px;
                font-weight: 300;
            }
            
            .header .subtitle {
                font-size: 1.2em;
                opacity: 0.9;
            }
            
            .content {
                padding: 30px;
            }
            
            .section {
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid #eee;
            }
            
            .section:last-child {
                border-bottom: none;
            }
            
            .section-title {
                color: #00D37F;
                font-size: 1.4em;
                margin-bottom: 15px;
                font-weight: 600;
                display: flex;
                align-items: center;
            }
            
            .section-title::before {
                content: '';
                width: 4px;
                height: 20px;
                background: #00D37F;
                margin-right: 10px;
                border-radius: 2px;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .info-item {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                border-left: 3px solid #00D37F;
            }
            
            .info-label {
                font-weight: 600;
                color: #555;
                margin-bottom: 5px;
            }
            
            .info-value {
                color: #333;
            }
            
            .description {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #00D37F;
                font-style: italic;
                line-height: 1.8;
            }
            
            .list-container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
            }
            
            .list-item {
                background: #f8f9fa;
                padding: 12px 15px;
                border-radius: 6px;
                border-left: 3px solid #00D37F;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .list-item-name {
                font-weight: 500;
            }
            
            .list-item-level {
                background: #00D37F;
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.8em;
                font-weight: 500;
            }
            
            .categories-container {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .category-tag {
                background: #00D37F;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.9em;
                font-weight: 500;
            }
            
            .certificate-item {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                border-left: 3px solid #00D37F;
                margin-bottom: 10px;
            }
            
            .certificate-name {
                font-weight: 600;
                color: #333;
                margin-bottom: 5px;
            }
            
            .certificate-details {
                color: #666;
                font-size: 0.9em;
            }
            
            .footer {
                background: #f8f9fa;
                padding: 20px 30px;
                text-align: center;
                color: #666;
                font-size: 0.9em;
            }
            
            .submission-date {
                color: #00D37F;
                font-weight: 600;
            }
            
            @media print {
                body {
                    background: white;
                    padding: 0;
                }
                
                .container {
                    box-shadow: none;
                    border-radius: 0;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${data.firstName} ${data.lastName}</h1>
                <div class="subtitle">${data.displayName} • ${data.occupation === "Other" ? data.customOccupation : data.occupation}</div>
            </div>
            
            <div class="content">
                <div class="section">
                    <h2 class="section-title">Personal Information</h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Full Name</div>
                            <div class="info-value">${data.firstName} ${data.lastName}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Display Name</div>
                            <div class="info-value">${data.displayName}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Email</div>
                            <div class="info-value">${data.userEmail || data.email}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Occupation</div>
                            <div class="info-value">${data.occupation === "Other" ? data.customOccupation : data.occupation}</div>
                        </div>
                    </div>
                    <div class="description">
                        <strong>Professional Description:</strong><br>
                        ${data.description}
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">Languages</h2>
                    <div class="list-container">
                        ${data.languages
                          .map(
                            (lang) => `
                            <div class="list-item">
                                <span class="list-item-name">${lang.language}</span>
                                <span class="list-item-level">${lang.proficiency_level}</span>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">Categories</h2>
                    <div class="categories-container">
                        ${data.categories
                          .map(
                            (category) => `
                            <span class="category-tag">${category}</span>
                        `,
                          )
                          .join("")}
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">Skills</h2>
                    <div class="list-container">
                        ${data.skills
                          .map(
                            (skill) => `
                            <div class="list-item">
                                <span class="list-item-name">${skill.skill}</span>
                                <span class="list-item-level">${skill.level}</span>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>

                ${
                  data.education.country || data.education.university
                    ? `
                <div class="section">
                    <h2 class="section-title">Education</h2>
                    <div class="info-grid">
                        ${
                          data.education.country
                            ? `
                        <div class="info-item">
                            <div class="info-label">Country</div>
                            <div class="info-value">${data.education.country}</div>
                        </div>
                        `
                            : ""
                        }
                        ${
                          data.education.university
                            ? `
                        <div class="info-item">
                            <div class="info-label">University</div>
                            <div class="info-value">${data.education.university}</div>
                        </div>
                        `
                            : ""
                        }
                        ${
                          data.education.title
                            ? `
                        <div class="info-item">
                            <div class="info-label">Degree Title</div>
                            <div class="info-value">${data.education.title}</div>
                        </div>
                        `
                            : ""
                        }
                        ${
                          data.education.major
                            ? `
                        <div class="info-item">
                            <div class="info-label">Major</div>
                            <div class="info-value">${data.education.major}</div>
                        </div>
                        `
                            : ""
                        }
                        ${
                          data.education.year
                            ? `
                        <div class="info-item">
                            <div class="info-label">Graduation Year</div>
                            <div class="info-value">${data.education.year}</div>
                        </div>
                        `
                            : ""
                        }
                    </div>
                </div>
                `
                    : ""
                }

                ${
                  data.certificates.length > 0
                    ? `
                <div class="section">
                    <h2 class="section-title">Certifications</h2>
                    ${data.certificates
                      .map(
                        (cert) => `
                        <div class="certificate-item">
                            <div class="certificate-name">${cert.name}</div>
                            <div class="certificate-details">
                                Issued by: ${cert.issuer}${cert.year ? ` • Year: ${cert.year}` : ""}
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
                `
                    : ""
                }

                <div class="section">
                    <h2 class="section-title">Payment Information</h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">CCP RIB Number</div>
                            <div class="info-value">${data.ccpDetails.rib}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Account Holder Name</div>
                            <div class="info-value">${data.ccpDetails.name}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p>Freelancer Profile Generated on <span class="submission-date">${submissionDate}</span></p>
                <p>This document contains confidential information and should be handled securely.</p>
            </div>
        </div>
    </body>
    </html>
  `
}

export async function generateAndSendFreelancerPDF(data: FreelancerData) {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured")
      throw new Error("RESEND_API_KEY is not configured in environment variables")
    }

    console.log("Starting PDF generation for:", data.firstName, data.lastName)
    console.log("Sending to email:", data.email)

    // Generate HTML template
    const htmlContent = generateHTMLTemplate(data)

    // Launch Puppeteer with optimized settings for server environments
    const browser = await puppeteer.launch({
      headless: "new", // Use new headless mode
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Overcome limited resource problems
        "--disable-gpu", // Disable GPU hardware acceleration
      ],
    })

    try {
      const page = await browser.newPage()

      // Set content and generate PDF
      await page.setContent(htmlContent, { waitUntil: "networkidle0" })

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20px",
          right: "20px",
          bottom: "20px",
          left: "20px",
        },
      })

      // Important: Always close the browser
      await browser.close()

      // Send email with PDF attachment using Resend
      const emailResult = await resend.emails.send({
        from: "Freelancer Platform <onboarding@resend.dev>", // Use resend.dev for testing or your verified domain
        to: [data.email], // This will be HR email
        subject: `New Freelancer Application - ${data.firstName} ${data.lastName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #00D37F, #00c070); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">New Freelancer Application</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Application Submitted on ${new Date(data.submissionDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Dear HR Team,
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                A new freelancer has submitted their application through the platform. Please find the complete profile information attached as a PDF document.
              </p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00D37F;">
                <h3 style="margin: 0 0 10px 0; color: #00D37F;">Applicant Summary:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555; line-height: 1.8;">
                  <li><strong>Name:</strong> ${data.firstName} ${data.lastName}</li>
                  <li><strong>Display Name:</strong> ${data.displayName}</li>
                  <li><strong>Email:</strong> ${data.userEmail || 'Not provided'}</li>
                  <li><strong>Occupation:</strong> ${data.occupation === "Other" ? data.customOccupation : data.occupation}</li>
                  <li><strong>Categories:</strong> ${data.categories.join(", ")}</li>
                  <li><strong>Languages:</strong> ${data.languages.map((l) => `${l.language} (${l.proficiency_level})`).join(", ")}</li>
                  <li><strong>Skills Count:</strong> ${data.skills.length} skills listed</li>
                  <li><strong>Certificates:</strong> ${data.certificates.length > 0 ? `${data.certificates.length} certificates` : 'None listed'}</li>
                </ul>
              </div>

              <div style="background: #e8f7f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #00D37F;">Document Status:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555; line-height: 1.8;">
                  <li>✅ ID Card uploaded</li>
                  <li>✅ CCP Payment details provided</li>
                  <li>✅ Profile information complete</li>
                </ul>
              </div>

              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>Action Required:</strong> Please review the attached PDF document containing the complete freelancer profile and verify all information. The applicant's ID card and payment details have been included for verification purposes.
                </p>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                The complete profile information, including all documents and certifications, is available in the attached PDF file.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                  <tr>
                    <td style="background: #00D37F; padding: 12px 30px; border-radius: 6px;">
                      <a href="#" style="color: white; text-decoration: none; font-weight: 600; display: inline-block;">
                        Review Application
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 14px; color: #666; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                This is an automated message from the Freelancer Platform. The applicant has been notified that their application has been submitted for review.
              </p>

              <p style="font-size: 14px; color: #666; margin-top: 20px;">
                Best regards,<br>
                <strong>Freelancer Platform System</strong>
              </p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: `freelancer-application-${data.firstName.toLowerCase()}-${data.lastName.toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`,
            content: pdfBuffer.toString("base64"), // Convert Buffer to base64 string
          },
        ],
      })

      if (emailResult.error) {
        console.error("Resend error details:", emailResult.error)
        throw new Error(`Email sending failed: ${emailResult.error.message}`)
      }

      console.log("Email sent successfully:", emailResult.data?.id)

      return { 
        success: true, 
        emailId: emailResult.data?.id,
        message: "Profile created and email sent successfully"
      }
    } catch (error) {
      // Ensure browser is closed even if an error occurs
      await browser.close()
      throw error
    }
  } catch (error) {
    console.error("Error generating PDF or sending email:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      message: "Failed to generate PDF or send email"
    }
  }
}

// Optional: Add a test function to verify Resend is working
export async function testResendConnection() {
  try {
    console.log("Testing Resend connection...")
    console.log("API Key exists:", !!process.env.RESEND_API_KEY)
    console.log("API Key prefix:", process.env.RESEND_API_KEY?.substring(0, 7))
    
    const result = await resend.emails.send({
      from: "Freelancer Platform <onboarding@resend.dev>",
      to: ["benazzaanis783@gmail.com","zizoubrahmi7@gmail.com"],
      subject: "Test Email - Freelancer Platform",
      html: "<p>This is a test email from the Freelancer Platform. If you receive this, Resend is working correctly!</p>",
    })
    
    console.log("Test email result:", result)
    return { success: true, data: result }
  } catch (error) {
    console.error("Test email error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}