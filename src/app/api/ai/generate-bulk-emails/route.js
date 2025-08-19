// app/api/ai/generate-bulk-email/route.js
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  try {
    const { systemPrompt, userPrompt, temperature = 0.7, maxTokens = 500 } = await request.json();

    if (!systemPrompt || !userPrompt) {
      return NextResponse.json({ error: 'Missing required prompts' }, { status: 400 });
    }

    // Initialize OpenAI with GPT-4 (GPT-5 not yet available, using latest model)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured on server' 
      }, { status: 500 });
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { 
          role: "system", 
          content: `${systemPrompt} 
            Format your response as a JSON object with the following structure:
            {
            "subject": "The email subject line",
            "email": "The full email body"
            }`
        },
        { role: "user", content: userPrompt }
      ],
      temperature: parseFloat(temperature),
      max_tokens: parseInt(maxTokens),
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0].message.content;
    
    try {
      const parsedResponse = JSON.parse(responseContent);
      
      // Validate response structure
      if (!parsedResponse.subject || !parsedResponse.email) {
        throw new Error('Invalid response structure');
      }

      return NextResponse.json({
        success: true,
        subject: parsedResponse.subject,
        email: parsedResponse.email,
        usage: completion.usage
      });

    } catch (parseError) {
      // Fallback: try to extract subject and body manually
      const lines = responseContent.split('\n').filter(line => line.trim());
      let subject = 'Personalized Outreach';
      let email = responseContent;

      // Try to find subject line
      const subjectLine = lines.find(line => 
        line.toLowerCase().includes('subject:') || 
        line.toLowerCase().includes('subject line:')
      );
      
      if (subjectLine) {
        subject = subjectLine.replace(/subject:?\s*/i, '').trim();
        // Remove subject line from email body
        email = responseContent.replace(subjectLine, '').trim();
      }

      return NextResponse.json({
        success: true,
        subject,
        email,
        usage: completion.usage,
        fallbackParsing: true
      });
    }

  } catch (error) {
    console.error('Bulk email generation error:', error);
    
    if (error.code === 'insufficient_quota') {
      return NextResponse.json({ 
        error: 'OpenAI API quota exceeded. Please check your billing.' 
      }, { status: 429 });
    }

    if (error.code === 'invalid_api_key') {
      return NextResponse.json({ 
        error: 'Invalid OpenAI API key' 
      }, { status: 401 });
    }

    return NextResponse.json({ 
      error: 'Failed to generate email',
      details: error.message 
    }, { status: 500 });
  }
}