// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { userDbUpdated, verificationDb } from '@/lib/database/verification-db';
import { sendVerificationEmail, generateVerificationCode, isRateLimited } from '@/lib/verification-service';

export async function POST(request) {
  try {
    const userData = await request.json();
    const { name, email, company, job_title } = userData;
    
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await userDbUpdated.findByEmailAny(email);
    if (existingUser) {
      // If user exists but not verified, allow resending verification
      if (!existingUser.email_verified) {
        return await handleResendVerification(email, name);
      }
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Check rate limiting (max 5 attempts per day per email)
    const todayAttempts = await verificationDb.getTodayAttempts(email);
    if (isRateLimited(todayAttempts)) {
      return NextResponse.json({ 
        error: 'Too many verification attempts. Please try again tomorrow.' 
      }, { status: 429 });
    }

    // Create pending user
    const result = await userDbUpdated.createPending({ name, email, company, job_title });
    
    // Generate and send verification code
    const verificationCode = generateVerificationCode();
    await verificationDb.create(email, verificationCode);
    
    const emailResult = await sendVerificationEmail(email, verificationCode, name);
    
    if (!emailResult.success) {
      // If email sending fails, we should probably delete the pending user
      // or handle this gracefully
      console.error('Failed to send verification email:', emailResult.error);
      return NextResponse.json({ 
        error: 'Failed to send verification email. Please try again.' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Registration initiated. Please check your email for verification code.',
      email: email // Send back email for the verification page
    });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to handle resending verification
async function handleResendVerification(email, name) {
  try {
    const todayAttempts = await verificationDb.getTodayAttempts(email);
    if (isRateLimited(todayAttempts)) {
      return NextResponse.json({ 
        error: 'Too many verification attempts. Please try again tomorrow.' 
      }, { status: 429 });
    }

    const verificationCode = generateVerificationCode();
    await verificationDb.create(email, verificationCode);
    
    const emailResult = await sendVerificationEmail(email, verificationCode, name);
    
    if (!emailResult.success) {
      return NextResponse.json({ 
        error: 'Failed to send verification email. Please try again.' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Verification code resent. Please check your email.',
      email: email
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}