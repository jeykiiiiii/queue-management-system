import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const { name } = await request.json();

  const [rows]: any = await db.query('SELECT MAX(queue_number) AS maxNum FROM queue');
  const nextNumber = (rows[0].maxNum || 0) + 1;

  await db.query('INSERT INTO queue (name, queue_number) VALUES (?, ?)', [name, nextNumber]);

  return NextResponse.json({ success: true, queueNumber: nextNumber });
}

export async function GET() {
  const [rows]: any = await db.query('SELECT * FROM queue ORDER BY queue_number ASC');
  return NextResponse.json(rows);
}