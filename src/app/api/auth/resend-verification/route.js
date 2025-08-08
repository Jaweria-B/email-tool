// app/api/auth/resend-verification/route.js
import { NextResponse } from 'next/server';
import { userDb, verificationDb } from '@/lib/database';
import { sendVerificationEmail, generateVerificationCode } from '@/lib/email-verification-service';

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists
    const user = await userDb.findByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is already verified
    if (user.email_verified) {
      return NextResponse.json({ error: 'Email is already verified' }, { status: 400 });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    await verificationDb.create(email, verificationCode);
    
    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationCode, user.name);
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      return NextResponse.json({ 
        error: 'Failed to send verification email. Please try again.' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent successfully'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}