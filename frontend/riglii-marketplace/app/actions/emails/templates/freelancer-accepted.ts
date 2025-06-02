import { baseEmailTemplate, sanitizeHtml } from "./base-template"
import type { FreelancerAcceptedParams } from "../types"

export function freelancerAcceptedTemplate(params: FreelancerAcceptedParams): string {
  const content = `
    <div class="email-header">
        <h1>🎉 Welcome to Freelancer Platform!</h1>
    </div>
    <div class="email-body">
        <p>Dear ${sanitizeHtml(params.freelancerName)},</p>
        
        <p>Congratulations! Your freelancer application has been approved. You're now part of our growing community of talented professionals.</p>
        
        <div class="info-box" style="background-color: #e8f5e9; border-left-color: #4caf50;">
            <h3 style="margin-top: 0;">✅ Application Approved</h3>
            <p>Your profile has been reviewed and approved by our team.</p>
            <p><strong>Approval Date:</strong> ${params.acceptedDate.toLocaleDateString()}</p>
        </div>
        
        <p><strong>What's Next?</strong></p>
        <ul>
            <li>Complete your profile to attract more clients</li>
            <li>Browse available projects in your categories</li>
            <li>Start bidding on projects that match your skills</li>
            <li>Build your portfolio and collect reviews</li>
        </ul>
        
        <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/freelancer/dashboard" class="button">
                Go to Dashboard
            </a>
        </div>
        
        <div class="divider"></div>
        
        <div class="info-box">
            <h4 style="margin-top: 0;">🚀 Tips for Success</h4>
            <ul style="margin-bottom: 0;">
                <li>Keep your profile updated with recent work</li>
                <li>Respond to messages within 24 hours</li>
                <li>Be clear about your rates and delivery times</li>
                <li>Deliver quality work to build positive reviews</li>
                <li>Communicate professionally with all clients</li>
            </ul>
        </div>
        
        <p>We're excited to have you on board! If you have any questions, feel free to reach out to our support team.</p>
        
        <p>Best regards,<br>The Freelancer Platform Team</p>
    </div>
  `
  
  return baseEmailTemplate(content)
}