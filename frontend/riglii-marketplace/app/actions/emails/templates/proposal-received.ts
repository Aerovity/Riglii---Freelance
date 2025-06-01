import { baseEmailTemplate, sanitizeHtml } from "./base-template"
import type { ProposalReceivedParams } from "../types"

export function proposalReceivedTemplate(params: ProposalReceivedParams): string {
  const content = `
    <div class="email-header">
        <h1>📋 New Project Proposal</h1>
    </div>
    <div class="email-body">
        <p>Dear ${sanitizeHtml(params.recipientName)},</p>
        
        <p>You've received a new project proposal from a potential client.</p>
        
        <div class="info-box">
            <h3 style="margin-top: 0;">Proposal Details</h3>
            <p><strong>Project Title:</strong> ${sanitizeHtml(params.proposalTitle)}</p>
            <p><strong>Client Name:</strong> ${sanitizeHtml(params.clientName)}</p>
            <p><strong>Client Email:</strong> ${sanitizeHtml(params.clientEmail)}</p>
            <p><strong>Budget:</strong> ${params.projectBudget.toLocaleString()} DZD</p>
            <p><strong>Timeline:</strong> ${sanitizeHtml(params.timeEstimate)}</p>
        </div>
        
        <div class="info-box" style="background-color: #f0f8ff; border-left-color: #4169e1;">
            <h4 style="margin-top: 0;">Project Description</h4>
            <p>${sanitizeHtml(params.projectDescription)}</p>
        </div>
        
        <p><strong>Action Required:</strong> Please review this proposal and respond through the platform.</p>
        
        <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/messages" class="button">
                View Proposal
            </a>
        </div>
        
        <div class="divider"></div>
        
        <p><strong>Tips for Responding:</strong></p>
        <ul>
            <li>Review the project requirements carefully</li>
            <li>Ask any clarifying questions before accepting</li>
            <li>Consider if the timeline and budget align with your capabilities</li>
            <li>Respond promptly to show professionalism</li>
        </ul>
        
        <p>Best regards,<br>The Freelancer Platform Team</p>
    </div>
  `
  
  return baseEmailTemplate(content)
}