import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== API ROUTE DEBUG ===');
    console.log('Full URL:', request.url);
    
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const idFromUrl = pathSegments[pathSegments.length - 1];
    
    console.log('ID from URL path:', idFromUrl);
    console.log('Params object:', params);
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { status, staffId } = body; 
    const { id } = params;

    console.log('All possible IDs:');
    console.log('- From params:', id);
    console.log('- From URL:', idFromUrl);
    console.log('- Status:', status);
    console.log('- Staff ID:', staffId); 

    const finalId = id || idFromUrl;

    if (!finalId || finalId === 'undefined' || finalId === 'null') {
      console.log('❌ No valid ID found anywhere!');
      return NextResponse.json(
        { success: false, error: 'Missing queue identifier' },
        { status: 400 }
      );
    }

    if (!status) {
      console.log('❌ Missing status');
      return NextResponse.json(
        { success: false, error: 'Missing status' },
        { status: 400 }
      );
    }

    console.log('✅ Using identifier:', finalId);
    console.log('✅ Status:', status);
    console.log('✅ Staff ID:', staffId);

    let result;
    try {
      if (status === 'done' && staffId) {
        [result] = await db.query(
          'UPDATE queue SET status = ?, served_by = ?, served_at = NOW() WHERE queue_number = ?', 
          [status, staffId, finalId]
        );
        console.log('Update result with served_by:', result);
      } else {
        [result] = await db.query(
          'UPDATE queue SET status = ? WHERE queue_number = ?', 
          [status, finalId]
        );
        console.log('Update result without served_by:', result);
      }
    } catch (err) {
      console.log('queue_number failed, trying id...');
      try {
        if (status === 'done' && staffId) {
          [result] = await db.query(
            'UPDATE queue SET status = ?, served_by = ?, served_at = NOW() WHERE id = ?', 
            [status, staffId, finalId]
          );
        } else {
          [result] = await db.query(
            'UPDATE queue SET status = ? WHERE id = ?', 
            [status, finalId]
          );
        }
        console.log('Update result with id:', result);
      } catch (err2) {
        console.log('id failed, trying queueNumber...');
        if (status === 'done' && staffId) {
          [result] = await db.query(
            'UPDATE queue SET status = ?, served_by = ?, served_at = NOW() WHERE queueNumber = ?', 
            [status, staffId, finalId]
          );
        } else {
          [result] = await db.query(
            'UPDATE queue SET status = ? WHERE queueNumber = ?', 
            [status, finalId]
          );
        }
        console.log('Update result with queueNumber:', result);
      }
    }

    console.log('✅ Database update completed');
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Final error updating queue:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}