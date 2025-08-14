// app/api/stats/route.js

import { emailActivityDb } from '@/lib/database';

export async function GET() {
  try {
    // Get total count from email_activity table
    const result = await emailActivityDb.getTotalCount();
    
    return Response.json({ 
      success: true, 
      emailsGenerated: result 
    });
  } catch (error) {
    console.error('Error fetching email count:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch email count' 
    }, { status: 500 });
  }
}
