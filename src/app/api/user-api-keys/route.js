import { NextResponse } from 'next/server';
import { sessionDb, apiKeysDb } from '@/lib/database';

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

    // Get user's API keys
    const apiKeys = apiKeysDb.getByUser(session.id);

    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error('Get API keys error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    const session = sessionDb.findValid(sessionToken);
    
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { provider, apiKey } = await request.json();
    
    if (!provider || !apiKey) {
      return NextResponse.json({ error: 'Provider and API key are required' }, { status: 400 });
    }

    // Save/update API key
    apiKeysDb.upsert(session.id, provider, apiKey);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save API key error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    const session = sessionDb.findValid(sessionToken);
    
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { provider } = await request.json();
    
    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
    }

    // Delete API key
    apiKeysDb.delete(session.id, provider);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete API key error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}