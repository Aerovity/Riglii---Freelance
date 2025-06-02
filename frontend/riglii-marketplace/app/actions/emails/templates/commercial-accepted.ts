import { baseEmailTemplate, sanitizeHtml } from "./base-template"
import type { CommercialAcceptedParams } from "../types"

export function commercialAcceptedTemplate(params: CommercialAcceptedParams): string {
  const content = `
    <div class="email-header">
        <h1>✅ Commercial Form Accepted</h1>
    </div>
    <div class="email-body">
        <p>Dear ${sanitizeHtml(params.recipientName)},</p>
        
        <p>Excellent news! Your commercial form has been accepted by the client. You can now proceed with the project.</p>
        
        <div class="info-box" style="background-color: #e8f5e9; border-left-color: #4caf50;">
            <h3 style="margin-top: 0;">Agreement Details</h3>
            <p><strong>Service:</strong> ${sanitizeHtml(params.commercialTitle)}</p>
            <p><strong>Client:</strong> ${sanitizeHtml(params.clientName)}</p>
            <p><strong>Total Price:</strong> ${params.totalPrice.toLocaleString()} DZD</p>
            <p><strong>Delivery Time:</strong> ${sanitizeHtml(params.deliveryTime)}</p>
            <p><strong>Accepted on:</strong> ${params.acceptedDate.toLocaleDateString()}</p>
        </div>
        
        <p><strong>Important:</strong> You can now start working on the project. Remember to:</p>
        <ul>
            <li>Deliver high-quality work within the agreed timeframe</li>
            <li>Keep the client updated on your progress</li>
            <li>Submit the project through the platform when complete</li>
            <li>Include all deliverables as specified in the agreement</li>
        </ul>
        
        <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/messages" class="button">
                View Project Details
            </a>
        </div>
        
        <div class="divider"></div>
        
        <div class="info-box" style="background-color: #fff3cd; border-left-color: #ffc107;">
            <h4 style="margin-top: 0;">⚠️ Delivery Guidelines</h4>
            <p>When your work is complete:</p>
            <ol style="margin-bottom: 0;">
                <li>Upload all project files through the platform</li>
                <li>Include any necessary documentation or instructions</li>
                <li>Add delivery notes if needed</li>
                <li>Submit the project for client review</li>
            </ol>
        </div>
        
        <p>Good luck with the project! We're here if you need any assistance.</p>
        
        <p>Best regards,<br>The Freelancer Platform Team</p>
    </div>
  `
  
  return baseEmailTemplate(content)
}