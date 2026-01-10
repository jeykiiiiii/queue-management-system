import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const [rows]: any = await db.query(`
      SELECT 
        s.id,
        s.name,
        s.email,
        s.role,
        COUNT(q.id) as total_served,
        AVG(TIMESTAMPDIFF(MINUTE, q.created_at, q.served_at)) as avg_service_time
      FROM staff s
      LEFT JOIN queue q ON s.id = q.served_by AND q.status = 'done'
      GROUP BY s.id
      ORDER BY total_served DESC
    `);
    
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error fetching staff performance:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}