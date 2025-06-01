import { baseEmailTemplate, sanitizeHtml } from "./base-template"
import type { ProjectSubmittedParams } from "../types"

export function projectSubmittedTemplate(params: ProjectSubmittedParams): string {
  const content = `
    <div class="email-header">
        <h1>📦 Project Delivered!</h1>
    </div>
    <div class="email-body">
        <p>Dear ${sanitizeHtml(params.recipientName)},</p>
        
        <p>Great news! ${sanitizeHtml(params.freelancerName)} has delivered your project.</p>
        
        <div class="info-box" style="background-color: #e8f5e9; border-left-color: #4caf50;">
            <h3 style="margin-top: 0;">Delivery Details</h3>
            <p><strong>Project:</strong> ${sanitizeHtml(params.projectTitle)}</p>
            <p><strong>Freelancer:</strong> ${sanitizeHtml(params.freelancerName)}</p>
            <p><strong>Delivered on:</strong> ${params.submittedDate.toLocaleDateString()} at ${params.submittedDate.toLocaleTimeString()}</p>
            ${params.hasFiles ? `<p><strong>Files:</strong> ${params.fileCount || 1} file(s) included</p>` : ''}
            ${params.projectUrl ? `<p><strong>External Link:</strong> <a href="${sanitizeHtml(params.projectUrl)}">${sanitizeHtml(params.projectUrl)}</a></p>` : ''}
        </div>
        
        ${params.projectNotes ? `
        <div class="info-box">
            <h4 style="margin-top: 0;">Delivery Notes from Freelancer</h4>
            <p>${sanitizeHtml(params.projectNotes)}</p>
        </div>
        ` : ''}
        
        <p><strong>Action Required:</strong> Please review the delivered work and provide feedback.</p>
        
        <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/messages" class="button">
                Review Delivery
            </a>
        </div>
        
        <div class="divider"></div>
        
        <div class="info-box" style="background-color: #fff3cd; border-left-color: #ffc107;">
            <h4 style="margin-top: 0;">⏰ Important Timeline</h4>
            <p>The conversation will automatically close in <strong>3 days</strong> from the delivery date.</p>
            <p>Please review the work and leave a review for the freelancer before the conversation closes.</p>
        </div>
        
        <p><strong>What to do next:</strong></p>
        <ol>
            <li>Download and review all delivered files</li>
            <li>Check if the work meets your requirements</li>
            <li>Communicate any feedback directly with the freelancer</li>
            <li>Leave a review to help other clients</li>
        </ol>
        
        <p>Thank you for using our platform!</p>
        
        <p>Best regards,<br>The Freelancer Platform Team</p>
    </div>
  `
  
  return baseEmailTemplate(content)
}