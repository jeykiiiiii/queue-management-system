import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json(
        { error: 'Name parameter is required' },
        { status: 400 }
      );
    }

    const [queues] = await db.execute(
      `SELECT id, name, queue_number, status, created_at, served_at, served_by 
       FROM queue 
       WHERE LOWER(name) LIKE LOWER(?) 
       ORDER BY created_at DESC`,
      [`%${name}%`]
    );

    return NextResponse.json(queues);
  } catch (error) {
    console.error('Error searching queue:', error);
    return NextResponse.json(
      { error: 'Failed to search queue' },
      { status: 500 }
    );
  }
}