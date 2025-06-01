import { baseEmailTemplate, sanitizeHtml } from "./base-template"
import type { ProposalAcceptedParams } from "../types"

export function proposalAcceptedTemplate(params: ProposalAcceptedParams): string {
  const content = `
    <div class="email-header">
        <h1>🎉 Proposal Accepted!</h1>
    </div>
    <div class="email-body">
        <p>Dear ${sanitizeHtml(params.recipientName)},</p>
        
        <p>Great news! Your project proposal has been accepted.</p>
        
        <div class="info-box">
            <h3 style="margin-top: 0;">Proposal Details</h3>
            <p><strong>Project:</strong> ${sanitizeHtml(params.proposalTitle)}</p>
            <p><strong>Client:</strong> ${sanitizeHtml(params.clientName)}</p>
            <p><strong>Budget:</strong> ${params.projectBudget.toLocaleString()} DZD</p>
            <p><strong>Timeline:</strong> ${sanitizeHtml(params.timeEstimate)}</p>
            <p><strong>Accepted on:</strong> ${params.acceptedDate.toLocaleDateString()}</p>
        </div>
        
        <p>You can now:</p>
        <ul>
            <li>Continue discussing project details with the client</li>
            <li>Send a commercial form when ready to formalize the agreement</li>
            <li>Start working on the project once the commercial form is accepted</li>
        </ul>
        
        <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/messages" class="button">
                Go to Messages
            </a>
        </div>
        
        <div class="divider"></div>
        
        <p><strong>Next Steps:</strong></p>
        <ol>
            <li>Discuss any final details with the client</li>
            <li>Send a commercial form to formalize the agreement</li>
            <li>Begin work once the commercial form is accepted</li>
        </ol>
        
        <p>Best regards,<br>The Freelancer Platform Team</p>
    </div>
  `
  
  return baseEmailTemplate(content)
}