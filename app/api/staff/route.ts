import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [staff] = await db.execute(`
      SELECT id, name, email, role, created_at 
      FROM staff 
      ORDER BY created_at DESC
    `);
    
    return NextResponse.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}