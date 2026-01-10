import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    const [rows]: any = await db.query(
      'SELECT * FROM staff WHERE email = ?',
      [email]
    );
    
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const staff = rows[0];
    const isValidPassword = await bcrypt.compare(password, staff.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Remove password from response
    const { password: _, ...staffWithoutPassword } = staff;
    
    return NextResponse.json({
      success: true,
      data: staffWithoutPassword,
      message: 'Login successful'
    });
  } catch (error: any) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}