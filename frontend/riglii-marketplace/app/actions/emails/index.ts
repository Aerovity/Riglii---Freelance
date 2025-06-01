"use server"

import { sendEmail } from "./sender"
import { EMAIL_SUBJECTS } from "./config"
import { proposalAcceptedTemplate } from "./templates/proposal-accepted"
import { proposalReceivedTemplate } from "./templates/proposal-received"
import { freelancerAcceptedTemplate } from "./templates/freelancer-accepted"
import { commercialAcceptedTemplate } from "./templates/commercial-accepted"
import { projectSubmittedTemplate } from "./templates/project-submitted"
import type {
  EmailResult,
  ProposalAcceptedParams,
  ProposalReceivedParams,
  FreelancerAcceptedParams,
  CommercialAcceptedParams,
  ProjectSubmittedParams
} from "./types"

export async function sendProposalAcceptedEmail(params: ProposalAcceptedParams): Promise<EmailResult> {
  console.log("\n📧 SENDING PROPOSAL ACCEPTED EMAIL")
  console.log("Parameters:", {
    recipientEmail: params.recipientEmail,
    recipientName: params.recipientName,
    proposalTitle: params.proposalTitle,
    clientName: params.clientName,
    acceptedDate: params.acceptedDate,
    projectBudget: params.projectBudget,
    timeEstimate: params.timeEstimate
  })
  
  const html = proposalAcceptedTemplate(params)
  const subject = EMAIL_SUBJECTS.proposalAccepted(params.proposalTitle)
  
  console.log("Subject:", subject)
  console.log("Template generated, length:", html.length)
  
  const result = await sendEmail({
    to: params.recipientEmail,
    subject,
    html
  })
  
  console.log("Proposal accepted email result:", result)
  return result
}

export async function sendProposalReceivedEmail(params: ProposalReceivedParams): Promise<EmailResult> {
  console.log("\n📧 SENDING PROPOSAL RECEIVED EMAIL")
  console.log("Parameters:", {
    recipientEmail: params.recipientEmail,
    recipientName: params.recipientName,
    proposalTitle: params.proposalTitle,
    clientName: params.clientName,
    clientEmail: params.clientEmail,
    projectBudget: params.projectBudget,
    timeEstimate: params.timeEstimate,
    projectDescription: params.projectDescription?.substring(0, 100) + "..."
  })
  
  const html = proposalReceivedTemplate(params)
  const subject = EMAIL_SUBJECTS.proposalReceived(params.proposalTitle)
  
  console.log("Subject:", subject)
  console.log("Template generated, length:", html.length)
  
  const result = await sendEmail({
    to: params.recipientEmail,
    subject,
    html
  })
  
  console.log("Proposal received email result:", result)
  return result
}

export async function sendFreelancerAcceptedEmail(params: FreelancerAcceptedParams): Promise<EmailResult> {
  console.log("\n📧 SENDING FREELANCER ACCEPTED EMAIL")
  console.log("Parameters:", {
    recipientEmail: params.recipientEmail,
    recipientName: params.recipientName,
    freelancerName: params.freelancerName,
    acceptedDate: params.acceptedDate
  })
  
  const html = freelancerAcceptedTemplate(params)
  const subject = EMAIL_SUBJECTS.freelancerAccepted()
  
  console.log("Subject:", subject)
  console.log("Template generated, length:", html.length)
  
  const result = await sendEmail({
    to: params.recipientEmail,
    subject,
    html
  })
  
  console.log("Freelancer accepted email result:", result)
  return result
}

export async function sendCommercialAcceptedEmail(params: CommercialAcceptedParams): Promise<EmailResult> {
  console.log("\n📧 SENDING COMMERCIAL ACCEPTED EMAIL")
  console.log("Parameters:", {
    recipientEmail: params.recipientEmail,
    recipientName: params.recipientName,
    commercialTitle: params.commercialTitle,
    clientName: params.clientName,
    acceptedDate: params.acceptedDate,
    totalPrice: params.totalPrice,
    deliveryTime: params.deliveryTime
  })
  
  const html = commercialAcceptedTemplate(params)
  const subject = EMAIL_SUBJECTS.commercialAccepted(params.commercialTitle)
  
  console.log("Subject:", subject)
  console.log("Template generated, length:", html.length)
  
  const result = await sendEmail({
    to: params.recipientEmail,
    subject,
    html
  })
  
  console.log("Commercial accepted email result:", result)
  return result
}

export async function sendProjectSubmittedEmail(params: ProjectSubmittedParams): Promise<EmailResult> {
  console.log("\n📧 SENDING PROJECT SUBMITTED EMAIL")
  console.log("Parameters:", {
    recipientEmail: params.recipientEmail,
    recipientName: params.recipientName,
    projectTitle: params.projectTitle,
    freelancerName: params.freelancerName,
    submittedDate: params.submittedDate,
    hasFiles: params.hasFiles,
    fileCount: params.fileCount,
    projectUrl: params.projectUrl,
    projectNotes: params.projectNotes?.substring(0, 100) + "..."
  })
  
  const html = projectSubmittedTemplate(params)
  const subject = EMAIL_SUBJECTS.projectSubmitted(params.projectTitle)
  
  console.log("Subject:", subject)
  console.log("Template generated, length:", html.length)
  
  const result = await sendEmail({
    to: params.recipientEmail,
    subject,
    html
  })
  
  console.log("Project submitted email result:", result)
  return result
}

// Test email connection function
export async function testEmailConnection(): Promise<boolean> {
  console.log("\n🔌 TESTING EMAIL CONNECTION")
  try {
    // Import and use the function directly instead of re-exporting
    const { testEmailConnection: testConnection } = await import("./sender")
    const result = await testConnection()
    console.log("Email connection test result:", result)
    return result
  } catch (error) {
    console.error("Email connection test failed:", error)
    return false
  }
}