// app/api/csv/parse/route.js
import { NextResponse } from 'next/server';
import Papa from 'papaparse';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('csv');
    
    if (!file) {
      return NextResponse.json({ error: 'No CSV file provided' }, { status: 400 });
    }

    // Read file content
    const fileContent = await file.text();
    
    // Parse CSV
    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      delimitersToGuess: [',', '\t', '|', ';'],
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_')
    });

    if (parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors);
      return NextResponse.json({ 
        error: 'CSV parsing failed', 
        details: parseResult.errors 
      }, { status: 400 });
    }

    const headers = parseResult.meta.fields || [];
    const rows = parseResult.data;

    // Validate that we have data
    if (rows.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }

    // Basic validation for email field
    const emailHeaders = headers.filter(header => 
      header.includes('email') || header.includes('mail')
    );
    
    if (emailHeaders.length === 0) {
      console.warn('No email column detected. Available headers:', headers);
    }

    return NextResponse.json({
      success: true,
      headers,
      rows,
      rowCount: rows.length,
      message: `Successfully parsed ${rows.length} contacts`
    });

  } catch (error) {
    console.error('CSV parsing error:', error);
    return NextResponse.json({ 
      error: 'Failed to parse CSV file',
      details: error.message 
    }, { status: 500 });
  }
}