import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start') || new Date().toISOString().split('T')[0];
    const endDate = searchParams.get('end') || new Date().toISOString().split('T')[0];

    const [performanceData] = await db.execute(`
      SELECT 
        s.id as staff_id,
        s.name as staff_name,
        s.role,
        COUNT(q.id) as total_served,
        SUM(CASE WHEN DATE(q.served_at) = CURDATE() THEN 1 ELSE 0 END) as served_today,
        SUM(CASE WHEN q.served_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as served_this_week,
        AVG(TIMESTAMPDIFF(MINUTE, q.created_at, q.served_at)) as avg_serve_time
      FROM staff s
      LEFT JOIN queue q ON s.id = q.served_by
      WHERE (q.status = 'done' OR q.status IS NULL)
      GROUP BY s.id, s.name, s.role
      ORDER BY total_served DESC
    `);

    return NextResponse.json(performanceData);
  } catch (error) {
    console.error('Error fetching staff performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff performance' },
      { status: 500 }
    );
  }
}