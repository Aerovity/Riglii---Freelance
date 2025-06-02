"use server"

import nodemailer from "nodemailer"
import { EMAIL_CONFIG } from "./config"
import type { EmailData, EmailResult } from "./types"

let transporter: nodemailer.Transporter | null = null

async function getTransporter() {
  console.log("=== EMAIL TRANSPORTER DEBUG ===")
  console.log("1. Checking if transporter exists:", !!transporter)
  
  if (!transporter) {
    console.log("2. Creating new transporter...")
    console.log("3. Environment variables check:")
    console.log("   - GMAIL_USER exists:", !!process.env.GMAIL_USER)
    console.log("   - GMAIL_USER value:", process.env.GMAIL_USER)
    console.log("   - GMAIL_APP_PASSWORD exists:", !!process.env.GMAIL_APP_PASSWORD)
    console.log("   - GMAIL_APP_PASSWORD length:", process.env.GMAIL_APP_PASSWORD?.length || 0)
    
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error("❌ EMAIL CONFIG ERROR: Missing environment variables")
      throw new Error("Email configuration missing: GMAIL_USER and GMAIL_APP_PASSWORD required")
    }

    console.log("4. Creating nodemailer transporter with config:")
    console.log("   - Service: gmail")
    console.log("   - Host: smtp.gmail.com")
    console.log("   - Port: 587")
    console.log("   - Secure: false")
    console.log("   - User:", process.env.GMAIL_USER)

    transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      },
      pool: true,
      maxConnections: EMAIL_CONFIG.rateLimits.maxConnections,
      maxMessages: EMAIL_CONFIG.rateLimits.maxMessages,
      rateDelta: EMAIL_CONFIG.rateLimits.rateDelta,
      rateLimit: EMAIL_CONFIG.rateLimits.rateLimit,
      tls: {
        rejectUnauthorized: false
      },
      debug: true, // Enable debug output
      logger: true  // Log information to console
    })
    
    console.log("5. Transporter created successfully")
  } else {
    console.log("2. Using existing transporter")
  }

  return transporter
}

export async function sendEmail(emailData: EmailData): Promise<EmailResult> {
  console.log("\n=== SEND EMAIL DEBUG START ===")
  console.log("Timestamp:", new Date().toISOString())
  console.log("Email data:")
  console.log("- To:", emailData.to)
  console.log("- Subject:", emailData.subject)
  console.log("- HTML length:", emailData.html?.length || 0)
  console.log("- Has attachments:", !!(emailData.attachments && emailData.attachments.length > 0))
  
  try {
    console.log("\n1. Getting transporter...")
    const transporter = await getTransporter()
    
    console.log("\n2. Verifying transporter connection...")
    try {
      await transporter.verify()
      console.log("✅ Transporter verified successfully")
    } catch (verifyError) {
      console.error("❌ Transporter verification failed:", verifyError)
      throw verifyError
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from: {
        name: EMAIL_CONFIG.from.name,
        address: EMAIL_CONFIG.from.email
      },
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      replyTo: EMAIL_CONFIG.replyTo,
      attachments: emailData.attachments,
      priority: 'normal',
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
        'X-Mailer': 'Freelancer Platform v1.0'
      }
    }

    console.log("\n3. Mail options prepared:")
    console.log("- From:", mailOptions.from)
    console.log("- To:", mailOptions.to)
    console.log("- Reply-To:", mailOptions.replyTo)

    // Send with retry logic
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= EMAIL_CONFIG.retry.maxRetries; attempt++) {
      try {
        console.log(`\n4. Sending email (attempt ${attempt}/${EMAIL_CONFIG.retry.maxRetries})...`)
        const info = await transporter.sendMail(mailOptions)
        
        console.log("5. Send mail response:", {
          messageId: info.messageId,
          accepted: info.accepted,
          rejected: info.rejected,
          pending: info.pending,
          response: info.response
        })
        
        if (info.accepted && info.accepted.length > 0) {
          console.log("✅ EMAIL SENT SUCCESSFULLY")
          console.log("=== SEND EMAIL DEBUG END ===\n")
          return {
            success: true,
            message: "Email sent successfully",
            messageId: info.messageId
          }
        }
        
        console.error("❌ Email not accepted by server")
        throw new Error("Email not accepted by server")
      } catch (error) {
        lastError = error as Error
        console.error(`❌ Attempt ${attempt} failed:`, error instanceof Error ? error.message : String(error))
        
        if (attempt < EMAIL_CONFIG.retry.maxRetries) {
          const delay = Math.min(
            EMAIL_CONFIG.retry.retryDelay * Math.pow(2, attempt - 1),
            EMAIL_CONFIG.retry.maxRetryDelay
          )
          console.log(`⏳ Waiting ${delay}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    console.error("❌ All retry attempts failed")
    throw lastError || new Error("Failed to send email after retries")
    
  } catch (error) {
    console.error("\n❌ EMAIL SENDING ERROR:", error)
    console.error("Error details:", {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack
    })
    console.log("=== SEND EMAIL DEBUG END (WITH ERROR) ===\n")
    
    return {
      success: false,
      message: "Failed to send email",
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

export async function testEmailConnection(): Promise<boolean> {
  console.log("\n=== TEST EMAIL CONNECTION ===")
  try {
    const transporter = await getTransporter()
    console.log("Testing transporter verification...")
    await transporter.verify()
    console.log("✅ Email connection test passed")
    return true
  } catch (error) {
    console.error("❌ Email connection test failed:", error)
    return false
  }
}