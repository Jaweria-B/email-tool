// src/app/api/send-emails/route.js
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { emails, subject, body, fromEmail, fromPassword } = await request.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ message: 'No email addresses provided' }, { status: 400 });
    }

    if (!subject || !body) {
      return NextResponse.json({ message: 'Subject and body are required' }, { status: 400 });
    }

    if (!fromEmail || !fromPassword) {
      return NextResponse.json({ message: 'Email configuration is required' }, { status: 400 });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: fromEmail,
        pass: fromPassword,
      },
    });

    const results = [];

    // Send emails one by one
    for (const email of emails) {
      try {
        const mailOptions = {
          from: fromEmail,
          to: email,
          subject: subject,
          text: body,
          html: body.replace(/\n/g, '<br>'), // Convert line breaks to HTML
        };

        await transporter.sendMail(mailOptions);
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
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Optional: Add other HTTP methods if needed
export async function GET() {
  return NextResponse.json({ message: 'GET method not supported for this endpoint' }, { status: 405 });
}