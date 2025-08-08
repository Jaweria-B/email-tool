// lib/email/verification-service.js
import nodemailer from 'nodemailer';

// Configure your email transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generate 6-digit verification code
export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
export async function sendVerificationEmail(email, code, name = '') {
  const subject = 'Verify Your EmailCraft Account';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9ff; padding: 30px; border-radius: 0 0 8px 8px; }
        .code-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to EmailCraft!</h1>
          <p>Verify your email to get started</p>
        </div>
        <div class="content">
          <p>Hello${name ? ` ${name}` : ''},</p>
          <p>Thank you for signing up for EmailCraft! To complete your registration and secure your account, please verify your email address using the code below:</p>
          
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          
          <p>Enter this 6-digit code in the verification form to activate your account.</p>
          
          <div class="warning">
            <strong>Important:</strong> This code will expire in 15 minutes for security reasons. If you didn't request this verification, please ignore this email.
          </div>
          
          <p>Once verified, you'll have access to all EmailCraft features including AI-powered email generation, templates, and more!</p>
          
          <p>Best regards,<br>The EmailCraft Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Welcome to EmailCraft!
    
    Hello${name ? ` ${name}` : ''},
    
    Thank you for signing up! Please verify your email address using this 6-digit code:
    
    ${code}
    
    This code will expire in 15 minutes.
    
    If you didn't request this verification, please ignore this email.
    
    Best regards,
    The EmailCraft Team
  `;

  try {
    const info = await transporter.sendMail({
      from: `"EmailCraft" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      text: textContent,
      html: htmlContent,
    });

    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
}

// Rate limiting helper
export function isRateLimited(attempts, maxAttempts = 5) {
  return attempts >= maxAttempts;
}