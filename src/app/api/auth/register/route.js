// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { userDb, sessionDb } from '@/lib/database';

export async function POST(request) {
  try {
    const userData = await request.json();
    const { name, email, company, job_title } = userData;
    
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = userDb.findByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Create user
    const result = userDb.create({ name, email, company, job_title });
    const user = userDb.findById(result.lastInsertRowid);

    // Create session
    const sessionToken = sessionDb.create(user.id);

    // Set cookie and return response
    const response = NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
        job_title: user.job_title
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
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
