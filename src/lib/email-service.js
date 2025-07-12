// lib/email-service.js
import nodemailer from 'nodemailer';

export class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Gmail configuration
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS || 'bjaweria509@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'gwow fpxo tlll igin'
      }
    });
  }

  async sendEmail(to, subject, body, from = process.env.EMAIL_ADDRESS || 'bjaweria509@gmail.com') {
    try {
      const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        text: body,
        html: body.replace(/\n/g, '<br>') // Simple HTML conversion
      };

      const info = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: info.messageId,
        message: 'Email sent successfully'
      };
    } catch (error) {
      console.error('Email sending error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendBulkEmails(emails, subject, body, from = process.env.EMAIL_ADDRESS || 'bjaweria509@gmail.com') {
    const results = [];
    
    for (const email of emails) {
      const result = await this.sendEmail(email.trim(), subject, body, from);
      results.push({
        email: email.trim(),
        ...result
      });
      
      // Add delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service is ready' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}