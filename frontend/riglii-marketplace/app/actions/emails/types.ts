export interface EmailData {
  to: string | string[]
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType?: string
  }>
}

export interface EmailResult {
  success: boolean
  message: string
  error?: string
  messageId?: string
}

export interface BaseEmailParams {
  recipientEmail: string
  recipientName: string
}

export interface ProposalAcceptedParams extends BaseEmailParams {
  proposalTitle: string
  clientName: string
  acceptedDate: Date
  projectBudget: number
  timeEstimate: string
}

export interface ProposalReceivedParams extends BaseEmailParams {
  proposalTitle: string
  clientName: string
  clientEmail: string
  projectBudget: number
  timeEstimate: string
  projectDescription: string
}

export interface FreelancerAcceptedParams extends BaseEmailParams {
  freelancerName: string
  acceptedDate: Date
}

export interface CommercialAcceptedParams extends BaseEmailParams {
  commercialTitle: string
  clientName: string
  acceptedDate: Date
  totalPrice: number
  deliveryTime: string
}

export interface ProjectSubmittedParams extends BaseEmailParams {
  projectTitle: string
  freelancerName: string
  submittedDate: Date
  hasFiles: boolean
  fileCount?: number
  projectUrl?: string
  projectNotes?: string
}