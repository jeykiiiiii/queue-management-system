import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const [existingStaff]: any = await db.query(
      'SELECT * FROM staff WHERE email = ?',
      [email]
    );

    if (existingStaff.length > 0) {
      return NextResponse.json(
        { error: 'Staff with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.query(
      'INSERT INTO staff (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'staff']
    );

    return NextResponse.json({
      message: 'Staff registered successfully'
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}