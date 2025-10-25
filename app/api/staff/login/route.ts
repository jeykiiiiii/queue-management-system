import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const [staff]: any = await db.query(
      'SELECT * FROM staff WHERE email = ?',
      [email]
    );

    if (staff.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const staffData = staff[0];
    const isPasswordValid = await bcrypt.compare(password, staffData.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const { password: _, ...staffWithoutPassword } = staffData;

    return NextResponse.json({
      message: 'Login successful',
      staff: staffWithoutPassword
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}