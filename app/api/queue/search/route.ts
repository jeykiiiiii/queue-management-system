import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    if (!query) {
      return NextResponse.json([]);
    }
    
    const [rows]: any = await db.query(
      `SELECT * FROM queue 
       WHERE queue_number LIKE ? 
       OR status LIKE ? 
       ORDER BY queue_number ASC`,
      [`%${query}%`, `%${query}%`]
    );
    
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error searching queue:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}