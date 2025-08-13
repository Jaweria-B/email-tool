// src/app/api/send-emails/route.js
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { emails, subject, body, smtpConfig } = await request.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ message: 'No email addresses provided' }, { status: 400 });
    }

    if (!subject || !body) {
      return NextResponse.json({ message: 'Subject and body are required' }, { status: 400 });
    }

    if (!smtpConfig || !smtpConfig.auth || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
      return NextResponse.json({ message: 'SMTP configuration is required' }, { status: 400 });
    }

    // Create transporter with custom SMTP configuration
    let transporterConfig;

    // If host is not provided, fall back to Gmail service
    if (!smtpConfig.host || smtpConfig.host === 'smtp.gmail.com') {
      transporterConfig = {
        service: 'gmail',
        auth: {
          user: smtpConfig.auth.user,
          pass: smtpConfig.auth.pass,
        },
      };
    } else {
      // Use custom SMTP configuration
      transporterConfig = {
        host: smtpConfig.host,
        port: smtpConfig.port || 587,
        secure: smtpConfig.secure || false, // true for 465 (SSL), false for other ports
        auth: {
          user: smtpConfig.auth.user,
          pass: smtpConfig.auth.pass,
        },
        // Additional options for better compatibility
        tls: {
          // Do not fail on invalid certs
          rejectUnauthorized: false
        }
      };

      // Add specific settings for common providers
      if (smtpConfig.host.includes('hostinger.com')) {
        transporterConfig.secure = true; // Hostinger typically uses SSL
        transporterConfig.port = smtpConfig.port || 465;
      } else if (smtpConfig.host.includes('outlook.com') || smtpConfig.host.includes('hotmail.com')) {
        transporterConfig.secure = false;
        transporterConfig.port = smtpConfig.port || 587;
        transporterConfig.requireTLS = true;
      } else if (smtpConfig.host.includes('yahoo.com')) {
        transporterConfig.secure = false;
        transporterConfig.port = smtpConfig.port || 587;
      }
    }

    console.log('Creating transporter with config:', {
      ...transporterConfig,
      auth: { user: transporterConfig.auth.user, pass: '[HIDDEN]' }
    });

    const transporter = nodemailer.createTransport(transporterConfig);

    // Verify the transporter configuration
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      return NextResponse.json({ 
        message: 'SMTP configuration verification failed',
        error: verifyError.message 
      }, { status: 400 });
    }

    const results = [];

    // Send emails one by one
    for (const email of emails) {
      try {
        const mailOptions = {
          from: `"${smtpConfig.fromName || 'Email Sender'}" <${smtpConfig.auth.user}>`,
          to: email,
          subject: subject,
          text: body,
          html: body.replace(/\n/g, '<br>'), // Convert line breaks to HTML
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${email}`);
        
        results.push({
          email: email,
          success: true,
        });
      } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
        results.push({
          email: email,
          success: false,
          error: error.message,
        });
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      error: error.message 
    }, { status: 500 });
  }
}

// Optional: Add other HTTP methods if needed
export async function GET() {
  return NextResponse.json({ message: 'GET method not supported for this endpoint' }, { status: 405 });
}