export const EMAIL_CONFIG = {
  from: {
    name: "Freelancer Platform",
    email: process.env.GMAIL_USER || "noreply@freelancerplatform.com"
  },
  replyTo: process.env.SUPPORT_EMAIL || "support@freelancerplatform.com",
  // Rate limiting
  rateLimits: {
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 20000, // 20 seconds
    rateLimit: 5, // 5 emails per rateDelta
  },
  // Retry configuration
  retry: {
    maxRetries: 3,
    retryDelay: 1000, // Base delay in ms
    maxRetryDelay: 10000 // Max delay in ms
  }
}

export const EMAIL_SUBJECTS = {
  proposalAccepted: (title: string) => `✅ Your proposal "${title}" has been accepted!`,
  proposalReceived: (title: string) => `📋 New project proposal: "${title}"`,
  freelancerAccepted: () => `🎉 Welcome to our Freelancer Platform!`,
  commercialAccepted: (title: string) => `✅ Commercial form "${title}" accepted - Ready to start!`,
  projectSubmitted: (title: string) => `📦 Project "${title}" has been delivered!`
}