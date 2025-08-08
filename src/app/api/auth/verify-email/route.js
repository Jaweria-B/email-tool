// app/api/auth/verify-email/route.js
import { NextResponse } from 'next/server';
import { userDbUpdated, verificationDb, sessionDb } from '@/lib/database/verification-db';

export async function POST(request) {
  try {
    const { email, code } = await request.json();
    
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 });
    }

    // Find the verification code
    const verification = await verificationDb.findValidCode(email, code);
    
    if (!verification) {
      // Increment attempts for rate limiting
      await verificationDb.incrementAttempts(email, code);
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }

    // Check if too many attempts on this specific code
    if (verification.attempts >= 5) {
      return NextResponse.json({ error: 'Too many attempts for this code. Please request a new one.' }, { status: 429 });
    }

    // Mark the verification code as used
    await verificationDb.markAsUsed(verification.id);

    // Verify the user's email and activate their account
    await userDbUpdated.verifyEmail(email);

    // Get the verified user
    const user = await userDbUpdated.findByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create session for the verified user
    const sessionToken = await sessionDb.create(user.id);

    // Clean up old verification codes
    await verificationDb.cleanupExpired();

    // Set cookie and return response
    const response = NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
        job_title: user.job_title,
        email_verified: true
      }
    });
    
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return response;

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Resend verification code endpoint
export async function PUT(request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists and is not verified
    const user = await userDbUpdated.findByEmailAny(email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (user.email_verified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    // Check rate limiting
    const todayAttempts = await verificationDb.getTodayAttempts(email);
    if (todayAttempts >= 5) {
      return NextResponse.json({ 
        error: 'Too many verification attempts. Please try again tomorrow.' 
      }, { status: 429 });
    }

    // Generate and send new verification code
    const verificationCode = generateVerificationCode();
    await verificationDb.create(email, verificationCode);
    
    const emailResult = await sendVerificationEmail(email, verificationCode, user.name);
    
    if (!emailResult.success) {
      return NextResponse.json({ 
        error: 'Failed to send verification email. Please try again.' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'New verification code sent to your email.'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}