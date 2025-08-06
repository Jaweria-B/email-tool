// app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import { userDb, sessionDb } from '@/lib/database';
export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    const session = sessionDb.findValid(sessionToken);
    
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    return NextResponse.json({ 
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
        company: session.company,
        job_title: session.job_title
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}