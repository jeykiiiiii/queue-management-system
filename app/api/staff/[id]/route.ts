import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const staffId = params.id;

    // Check if staff exists
    const [staff] = await db.execute('SELECT id FROM staff WHERE id = ?', [staffId]);
    
    if (!Array.isArray(staff) || staff.length === 0) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Delete the staff member
    await db.execute('DELETE FROM staff WHERE id = ?', [staffId]);

    return NextResponse.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json(
      { error: 'Failed to delete staff member' },
      { status: 500 }
    );
  }
}