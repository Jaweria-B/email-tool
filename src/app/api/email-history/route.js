// app/api/email-history/route.js
import { NextResponse } from 'next/server';
import { sessionDb, emailActivityDb } from '@/lib/database';

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    // Find session (now async)
    const session = await sessionDb.findValid(sessionToken);
    
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get user's email history (now async)
    const emails = await emailActivityDb.getByUser(session.id);

    return NextResponse.json({ emails });
  } catch (error) {
    console.error('Email history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    // Find session (now async)
    const session = await sessionDb.findValid(sessionToken);
    
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const emailData = await request.json();
    
    // Save email activity (now async)
    const result = await emailActivityDb.create(session.id, emailData);

    return NextResponse.json({ 
      success: true, 
      emailId: result.insertId || result.rows?.[0]?.id || 'created'
    });
  } catch (error) {
    console.error('Save email activity error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}