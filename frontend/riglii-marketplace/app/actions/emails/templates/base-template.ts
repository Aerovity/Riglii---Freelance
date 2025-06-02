export function baseEmailTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Freelancer Platform</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background-color: #f5f5f5;
                color: #333333;
            }
            .email-wrapper {
                width: 100%;
                background-color: #f5f5f5;
                padding: 40px 20px;
            }
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .email-header {
                background: linear-gradient(135deg, #00D37F, #00c070);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .email-header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
            }
            .email-body {
                padding: 30px;
            }
            .email-footer {
                background-color: #f8f9fa;
                padding: 20px 30px;
                text-align: center;
                font-size: 14px;
                color: #666666;
            }
            .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #00D37F;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
            }
            .button:hover {
                background-color: #00c070;
            }
            .info-box {
                background-color: #f8f9fa;
                border-left: 4px solid #00D37F;
                padding: 15px 20px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .divider {
                height: 1px;
                background-color: #eeeeee;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="email-container">
                ${content}
                <div class="email-footer">
                    <p>© ${new Date().getFullYear()} Freelancer Platform. All rights reserved.</p>
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `
}

export function sanitizeHtml(str: string): string {
  if (!str) return ''
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}