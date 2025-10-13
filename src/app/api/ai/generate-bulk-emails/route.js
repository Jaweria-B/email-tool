// app/api/ai/generate-bulk-email/route.js
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request) {
  try {
    const { systemPrompt, userPrompt, temperature = 0.7, maxTokens = 500 } = await request.json();

    if (!systemPrompt || !userPrompt) {
      return NextResponse.json({ error: 'Missing required prompts' }, { status: 400 });
    }

    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'Gemini API key not configured on server' 
      }, { status: 500 });
    }

    // Initialize Gemini AI client
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    // Generate content using Gemini 2.5 Flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: [
        {
          role: 'user',
          parts: [
            { 
              text: `${systemPrompt}\n\nIMPORTANT: Format your response as a JSON object with the following structure:
              {
                "subject": "The email subject line",
                "email": "The full email body"
              }

              User Request: ${userPrompt}` 
            }
          ]
        }
      ],
      config: {
        temperature: parseFloat(temperature),
        maxOutputTokens: parseInt(maxTokens),
        responseMimeType: 'application/json',
        // Disable thinking for faster response and lower cost
        thinkingConfig: {
          thinkingBudget: 0
        }
      }
    });

    const responseText = response.text;
    
    try {
      const parsedResponse = JSON.parse(responseText);
      
      // Validate response structure
      if (!parsedResponse.subject || !parsedResponse.email) {
        throw new Error('Invalid response structure');
      }

      return NextResponse.json({
        success: true,
        subject: parsedResponse.subject,
        email: parsedResponse.email,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0
        }
      });

    } catch (parseError) {
      // Fallback: try to extract subject and body manually
      const lines = responseText.split('\n').filter(line => line.trim());
      let subject = 'Personalized Outreach';
      let email = responseText;

      // Try to find subject line
      const subjectLine = lines.find(line => 
        line.toLowerCase().includes('subject:') || 
        line.toLowerCase().includes('subject line:')
      );
      
      if (subjectLine) {
        subject = subjectLine.replace(/subject:?\s*/i, '').trim();
        // Remove subject line from email body
        email = responseText.replace(subjectLine, '').trim();
      }

      return NextResponse.json({
        success: true,
        subject,
        email,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0
        },
        fallbackParsing: true
      });
    }

  } catch (error) {
    console.error('Bulk email generation error:', error);
    
    // Handle specific Gemini API errors
    if (error.message?.includes('API key')) {
      return NextResponse.json({ 
        error: 'Invalid Gemini API key' 
      }, { status: 401 });
    }

    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return NextResponse.json({ 
        error: 'Gemini API quota exceeded or rate limit reached. Please try again later.' 
      }, { status: 429 });
    }

    if (error.message?.includes('SAFETY')) {
      return NextResponse.json({ 
        error: 'Content was blocked by safety filters. Please modify your prompt.' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to generate email',
      details: error.message 
    }, { status: 500 });
  }
}