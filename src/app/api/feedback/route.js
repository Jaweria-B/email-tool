// app/api/feedback/route.js
import { NextResponse } from 'next/server';
import { feedbackDb, initializeSchema } from '@/lib/database';

export async function POST(request) {
  try {
    const { type, feedback, ai_provider, email_sent, user_id } = await request.json();
    
    // Save feedback to database
    const result = await feedbackDb.create({
      user_id,
      feedback_type: type,
      feedback_data: feedback,
      ai_provider,
      email_sent: email_sent || false
    });
    
    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Failed to save feedback:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback', details: error.message }, 
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    
    const feedback = await feedbackDb.getByUser(userId, type);
    
    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Failed to get feedback:', error);
    return NextResponse.json(
      { error: 'Failed to get feedback' }, 
      { status: 500 }
    );
  }
}