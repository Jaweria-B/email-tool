// lib/email-service.js
import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE || false, // true for 465 (SSL), false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: '_VNkv*B$tW#qLC9',
    },
    // Additional options for better compatibility
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false
    },
    from: `"EmailCurator" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`
  });
};

// Generate 6-digit verification code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
export const sendVerificationEmail = async (email, code, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"EmailCurator" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify Your EmailCurator Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to EmailCurator!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Hi ${name}, verify your account to get started</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Please use the verification code below to complete your registration:
            </p>
            
            <div style="background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 4px; font-family: 'Courier New', monospace;">
                ${code}
              </div>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              This code will expire in 15 minutes. If you didn't request this verification, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px;">
            <p style="font-size: 12px; color: #888;">
              © 2025 EmailCurator. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `Welcome to EmailCurator, ${name}!\n\nYour verification code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this verification, please ignore this email.`
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Rate limiting helper
export const isRateLimited = (attempts) => {
  return attempts >= 5; // Max 5 attempts per day
};
