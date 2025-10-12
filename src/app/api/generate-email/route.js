// app/api/generate-email/route.js
import { NextResponse } from 'next/server';
import { EmailGenerationService } from '@/lib/ai-services';
import { AI_PROVIDERS } from '@/lib/ai-config';

export async function POST(request) {
  try {
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

    // Return the generated email
    return NextResponse.json(result);

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