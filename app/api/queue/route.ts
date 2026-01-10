import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const [rows]: any = await db.query('SELECT * FROM queue ORDER BY queue_number ASC');
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error fetching queue:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { queue_number } = body;
    
    if (!queue_number) {
      return NextResponse.json(
        { success: false, error: 'Queue number is required' },
        { status: 400 }
      );
    }
    
    // Check if queue number already exists
    const [existing]: any = await db.query(
      'SELECT * FROM queue WHERE queue_number = ?',
      [queue_number]
    );
    
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Queue number already exists' },
        { status: 400 }
      );
    }
    
    // Insert new queue
    await db.query(
      'INSERT INTO queue (queue_number, status) VALUES (?, ?)',
      [queue_number, 'waiting']
    );
    
    return NextResponse.json(
      { success: true, message: 'Queue created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating queue:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}