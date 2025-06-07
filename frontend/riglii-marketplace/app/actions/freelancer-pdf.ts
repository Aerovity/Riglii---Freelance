"use server"

import puppeteer from "puppeteer"
import type { Browser } from "puppeteer"
import * as nodemailer from "nodemailer"



// Define HR team emails - you can add more emails here
const HR_TEAM_EMAILS = [
  "benazzaanis783@gmail.com",
  "zizoubrahmi7@gmail.com",
  // Add more HR team emails here as needed
]

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
  userEmail?: string
}

interface EmailResult {
  success: boolean
  message: string
  recipients?: string[]
  successfulSends?: number
  errors?: string[]
  error?: string
}

// ================================
// NODEMAILER CONFIGURATION
// ================================

/**
 * Creates a Nodemailer transporter with enhanced configuration
 * Uses Gmail service with App Password authentication
 */
const createTransporter = () => {
  try {
    // Validate environment variables
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      throw new Error("Missing required environment variables: GMAIL_USER and GMAIL_APP_PASSWORD")
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD // Use App Password, not regular password
      },
      // Enhanced configuration for better reliability
      pool: true, // Use pooled connections
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 20000, // 20 seconds between bursts
      rateLimit: 5, // 5 emails per rateDelta
      // Timeout settings
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000, // 30 seconds
      socketTimeout: 60000, // 60 seconds
      // TLS options
      tls: {
        rejectUnauthorized: false
      }
    })

    return transporter
  } catch (error) {
    throw error
  }
}

// ================================
// HTML TEMPLATE GENERATION
// ================================

/**
 * Generates the HTML template for the PDF document
 */
function generateHTMLTemplate(data: FreelancerData): string {
  try {
    const submissionDate = new Date(data.submissionDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // Sanitize data to prevent XSS
    const sanitize = (str: string) => {
      if (!str) return ''
      return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
    }

    const template = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Freelancer Profile - ${sanitize(data.firstName)} ${sanitize(data.lastName)}</title>
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
                  page-break-inside: avoid;
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
                  word-wrap: break-word;
              }
              
              .description {
                  background: #f8f9fa;
                  padding: 20px;
                  border-radius: 8px;
                  border-left: 4px solid #00D37F;
                  font-style: italic;
                  line-height: 1.8;
                  white-space: pre-wrap;
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
                  page-break-inside: avoid;
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
                  
                  .header {
                      page-break-after: avoid;
                  }
                  
                  .section {
                      page-break-inside: avoid;
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>${sanitize(data.firstName)} ${sanitize(data.lastName)}</h1>
                  <div class="subtitle">${sanitize(data.displayName)} • ${sanitize(data.occupation === "Other" ? data.customOccupation : data.occupation)}</div>
              </div>
              
              <div class="content">
                  <div class="section">
                      <h2 class="section-title">Personal Information</h2>
                      <div class="info-grid">
                          <div class="info-item">
                              <div class="info-label">Full Name</div>
                              <div class="info-value">${sanitize(data.firstName)} ${sanitize(data.lastName)}</div>
                          </div>
                          <div class="info-item">
                              <div class="info-label">Display Name</div>
                              <div class="info-value">${sanitize(data.displayName)}</div>
                          </div>
                          <div class="info-item">
                              <div class="info-label">Email</div>
                              <div class="info-value">${sanitize(data.userEmail || data.email)}</div>
                          </div>
                          <div class="info-item">
                              <div class="info-label">Occupation</div>
                              <div class="info-value">${sanitize(data.occupation === "Other" ? data.customOccupation : data.occupation)}</div>
                          </div>
                      </div>
                      <div class="description">
                          <strong>Professional Description:</strong><br>
                          ${sanitize(data.description)}
                      </div>
                  </div>

                  <div class="section">
                      <h2 class="section-title">Languages</h2>
                      <div class="list-container">
                          ${data.languages
                            .map(
                              (lang) => `
                              <div class="list-item">
                                  <span class="list-item-name">${sanitize(lang.language)}</span>
                                  <span class="list-item-level">${sanitize(lang.proficiency_level)}</span>
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
                              <span class="category-tag">${sanitize(category)}</span>
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
                                  <span class="list-item-name">${sanitize(skill.skill)}</span>
                                  <span class="list-item-level">${sanitize(skill.level)}</span>
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
                              <div class="info-value">${sanitize(data.education.country)}</div>
                          </div>
                          `
                              : ""
                          }
                          ${
                            data.education.university
                              ? `
                          <div class="info-item">
                              <div class="info-label">University</div>
                              <div class="info-value">${sanitize(data.education.university)}</div>
                          </div>
                          `
                              : ""
                          }
                          ${
                            data.education.title
                              ? `
                          <div class="info-item">
                              <div class="info-label">Degree Title</div>
                              <div class="info-value">${sanitize(data.education.title)}</div>
                          </div>
                          `
                              : ""
                          }
                          ${
                            data.education.major
                              ? `
                          <div class="info-item">
                              <div class="info-label">Major</div>
                              <div class="info-value">${sanitize(data.education.major)}</div>
                          </div>
                          `
                              : ""
                          }
                          ${
                            data.education.year
                              ? `
                          <div class="info-item">
                              <div class="info-label">Graduation Year</div>
                              <div class="info-value">${sanitize(data.education.year)}</div>
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
                              <div class="certificate-name">${sanitize(cert.name)}</div>
                              <div class="certificate-details">
                                  Issued by: ${sanitize(cert.issuer)}${cert.year ? ` • Year: ${sanitize(cert.year)}` : ""}
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
                              <div class="info-value">${sanitize(data.ccpDetails.rib)}</div>
                          </div>
                          <div class="info-item">
                              <div class="info-label">Account Holder Name</div>
                              <div class="info-value">${sanitize(data.ccpDetails.name)}</div>
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

    return template
  } catch (error) {
    throw new Error(`Failed to generate HTML template: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generates the HTML email template
 */
function generateEmailHTML(data: FreelancerData): string {
  try {
    const sanitize = (str: string) => {
      if (!str) return ''
      return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
    }

    const emailHTML = `
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
              <li><strong>Name:</strong> ${sanitize(data.firstName)} ${sanitize(data.lastName)}</li>
              <li><strong>Display Name:</strong> ${sanitize(data.displayName)}</li>
              <li><strong>Email:</strong> ${sanitize(data.userEmail || 'Not provided')}</li>
              <li><strong>Occupation:</strong> ${sanitize(data.occupation === "Other" ? data.customOccupation : data.occupation)}</li>
              <li><strong>Categories:</strong> ${data.categories.map(c => sanitize(c)).join(", ")}</li>
              <li><strong>Languages:</strong> ${data.languages.map((l) => `${sanitize(l.language)} (${sanitize(l.proficiency_level)})`).join(", ")}</li>
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
          
          <p style="font-size: 14px; color: #666; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            This is an automated message from the Freelancer Platform. The applicant has been notified that their application has been submitted for review.
          </p>

          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            Best regards,<br>
            <strong>Freelancer Platform System</strong>
          </p>
        </div>
      </div>
    `

    return emailHTML
  } catch (error) {
    throw new Error(`Failed to generate email HTML template: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// ================================
// EMAIL SENDING FUNCTIONS
// ================================

/**
 * Enhanced email sending function with retry logic and better error handling
 */
async function sendEmailWithRetry(
  transporter: nodemailer.Transporter, 
  mailOptions: nodemailer.SendMailOptions, 
  maxRetries = 3
): Promise<{ success: boolean; error?: string; info?: any }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      
      const result = await transporter.sendMail(mailOptions)
      
      if (result.accepted && result.accepted.length > 0) {
        return { success: true, info: result }
      } else {
        throw new Error(`Email not accepted by server: ${JSON.stringify(result.rejected)}`)
      }
    } catch (error) {
      
      if (attempt === maxRetries) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000) // Max 10 seconds
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  return { success: false, error: 'Max retries exceeded' }
}

// ================================
// PDF GENERATION FUNCTIONS
// ================================

/**
 * Generates PDF using Puppeteer with enhanced error handling
 */
async function generatePDF(htmlContent: string): Promise<Buffer> {
  let browser: Browser | null = null;

  try {
    // Launch Puppeteer with optimized settings for server environments
    browser = await puppeteer.launch({
      headless: true, // Use headless mode
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-default-apps",
        "--disable-extensions",
        "--disable-plugins",
        "--disable-translate",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding"
      ],
      timeout: 30000,
      protocolTimeout: 30000,
    });

    const page = await browser.newPage();

    // Set viewport and emulate screen for better rendering
    await page.setViewport({ width: 1200, height: 800 });
    await page.emulateMediaType('screen');

    // Set content with proper wait conditions
    await page.setContent(htmlContent, { 
      waitUntil: ["load", "domcontentloaded", "networkidle0"],
      timeout: 30000
    });

    // Additional wait for rendering
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate PDF with enhanced settings
    const pdfUint8Array = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "10mm",
        right: "10mm",
        bottom: "10mm",
        left: "10mm",
      },
      preferCSSPageSize: true,
      timeout: 30000,
      displayHeaderFooter: false,
      scale: 0.8, // Slightly reduce scale for better fit
    });

    // Close browser
    await browser.close();
    browser = null;

    // Ensure the result is a Node.js Buffer
    return Buffer.from(pdfUint8Array);
  } catch (error) {
    // Ensure browser is closed even if an error occurs
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
      }
    }
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ================================
// MAIN EXPORT FUNCTIONS
// ================================

/**
 * Main function to generate PDF and send emails to HR team
 */
export async function generateAndSendFreelancerPDF(
  data: FreelancerData, 
  customRecipients?: string[]
): Promise<EmailResult> {
  const startTime = Date.now()
  

  try {
    // 1. Validate environment variables
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      throw new Error("Gmail credentials not configured in environment variables")
    }

    // 2. Validate input data
    if (!data.firstName || !data.lastName || !data.displayName) {
      throw new Error("Missing required freelancer data: firstName, lastName, or displayName")
    }

    // 3. Determine recipients
    const recipients = customRecipients && customRecipients.length > 0 ? customRecipients : HR_TEAM_EMAILS

    // 4. Generate HTML template
    const htmlContent = generateHTMLTemplate(data)

    // 5. Generate PDF
    const pdfBuffer = await generatePDF(htmlContent)

    // 6. Create email transporter and verify connection
    const transporter = createTransporter()

    try {
      await transporter.verify()
    } catch (verifyError) {
      throw new Error(`Failed to verify email configuration: ${verifyError instanceof Error ? verifyError.message : 'Unknown error'}`)
    }

    // 7. Generate filename for PDF
    const timestamp = new Date().toISOString().split('T')[0]
    const pdfFilename = `freelancer-application-${data.firstName.toLowerCase()}-${data.lastName.toLowerCase()}-${timestamp}.pdf`

    // 8. Send emails to all recipients
    
    let successfulSends = 0
    const errors: string[] = []
    const successfulRecipients: string[] = []

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i]
      
      try {
        
        const mailOptions: nodemailer.SendMailOptions = {
          from: {
            name: "Freelancer Platform",
            address: process.env.GMAIL_USER!
          },
          to: recipient,
          subject: `New Freelancer Application - ${data.firstName} ${data.lastName}`,
          html: generateEmailHTML(data),
          attachments: [
            {
              filename: pdfFilename,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ],
          // Email options for better delivery
          priority: 'normal',
          headers: {
            'X-Priority': '3',
            'X-MSMail-Priority': 'Normal',
            'Importance': 'Normal',
            'X-Mailer': 'Freelancer Platform v1.0'
          }
        }

        const sendResult = await sendEmailWithRetry(transporter, mailOptions, 3)
        
        if (sendResult.success) {
          successfulSends++
          successfulRecipients.push(recipient)
        } else {
          const errorMsg = `Failed to send to ${recipient}: ${sendResult.error}`
          errors.push(errorMsg)
        }

        // Small delay between sends to avoid rate limiting
        if (i < recipients.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      } catch (error) {
        const errorMessage = `Error sending to ${recipient}: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMessage)
      }
    }

    // 9. Close transporter
    transporter.close()

    // 10. Prepare result
    const duration = Date.now() - startTime

    if (successfulSends === 0) {
      throw new Error(`Failed to send email to any recipients. Errors: ${errors.join('; ')}`)
    }

    const result: EmailResult = { 
      success: true, 
      message: `Profile created and email sent successfully to ${successfulSends}/${recipients.length} recipient${successfulSends > 1 ? 's' : ''}`,
      recipients: successfulRecipients,
      successfulSends,
      errors: errors.length > 0 ? errors : undefined
    }

    return result

  } catch (error) {
    const duration = Date.now() - startTime
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      message: "Failed to generate PDF or send email"
    }
  }
}

/**
 * Function to get HR team emails
 */
export async function getHREmails(): Promise<string[]> {
  return HR_TEAM_EMAILS
}

/**
 * Function to send to specific recipients
 */
export async function generateAndSendFreelancerPDFToSpecificRecipients(
  data: FreelancerData, 
  recipients: string[]
): Promise<EmailResult> {
  return generateAndSendFreelancerPDF(data, recipients)
}