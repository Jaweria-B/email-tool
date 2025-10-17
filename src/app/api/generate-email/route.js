// app/api/generate-email/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { EmailGenerationService } from '@/lib/ai-services';
import { AI_PROVIDERS } from '@/lib/ai-config';
import { sessionDb, anonymousDevicesDb } from '@/lib/database';

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    let deviceId = cookieStore.get('device_id')?.value;

    let user = null;
    if (sessionToken) {
      user = await sessionDb.findValid(sessionToken);
    }

    let isNewDevice = false;
    // For anonymous users, handle device ID and check usage
    if (!user) {
      if (!deviceId) {
        deviceId = uuidv4();
        isNewDevice = true;
      }

      const existingDevice = await anonymousDevicesDb.findByDeviceId(deviceId);
      if (existingDevice) {
        return NextResponse.json(
          { error: 'You have already generated your free email. Please sign in to continue.' },
          { status: 403 }
        );
      }
    }

    // Get the AIML API key from environment variables
    const apiKey = process.env.AIML_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AIML API key not configured on server' },
        { status: 500 }
      );
    }

    // Parse the request body
    const { prompt } = await request.json();

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Create the email generation service with the internal API key
    const emailService = new EmailGenerationService(AI_PROVIDERS.GEMINI, apiKey);

    // Generate the email
    const result = await emailService.generateEmail(prompt);

    // Validate the result has required fields
    if (!result || !result.subject || !result.body) {
      return NextResponse.json(
        { error: 'Invalid response from AI provider' },
        { status: 500 }
      );
    }

    // If the user is anonymous, save the device ID
    if (!user) {
      await anonymousDevicesDb.create(deviceId);
    }

    // Create the response
    const response = NextResponse.json(result);

    // If it's a new device, set the cookie
    if (isNewDevice) {
      response.cookies.set('device_id', deviceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
        sameSite: 'lax',
      });
    }

    return response;

  } catch (error) {
    console.error('Email generation error:', error);
    
    // Return appropriate error response
    if (error.message.includes('API error')) {
      return NextResponse.json(
        { error: `AI Provider Error: ${error.message}` },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate email. Please try again.' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}