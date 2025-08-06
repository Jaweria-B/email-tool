//  app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { sessionDb } from '@/lib/database';

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (sessionToken) {
      // Delete session (now async)
      await sessionDb.delete(sessionToken);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete('session_token');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}