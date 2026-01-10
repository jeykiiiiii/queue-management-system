import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Helper type for mysql2 results
type QueryResult = [RowDataPacket[] | RowDataPacket[][] | ResultSetHeader, any];

// GET: Fetch a specific queue item
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const idFromUrl = pathSegments[pathSegments.length - 1];
    
    const finalId = paramId || idFromUrl;

    if (!finalId || finalId === 'undefined' || finalId === 'null') {
      return NextResponse.json(
        { success: false, error: 'Missing queue identifier' },
        { status: 400 }
      );
    }

    let rows: RowDataPacket[];
    try {
      const [result1]: QueryResult = await db.query('SELECT * FROM queue WHERE queue_number = ?', [finalId]);
      rows = result1 as RowDataPacket[];
      
      if (!rows || rows.length === 0) {
        const [result2]: QueryResult = await db.query('SELECT * FROM queue WHERE id = ?', [finalId]);
        rows = result2 as RowDataPacket[];
      }
      if (!rows || rows.length === 0) {
        const [result3]: QueryResult = await db.query('SELECT * FROM queue WHERE queueNumber = ?', [finalId]);
        rows = result3 as RowDataPacket[];
      }
    } catch (error: any) {
      console.error('Error fetching queue:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error in GET queue:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update a queue item
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    
    console.log('=== API ROUTE DEBUG ===');
    console.log('Full URL:', request.url);
    
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const idFromUrl = pathSegments[pathSegments.length - 1];
    
    console.log('ID from URL path:', idFromUrl);
    console.log('Params object ID:', paramId);
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { status, staffId } = body; 
    const id = paramId;

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

    let result: ResultSetHeader;
    try {
      if (status === 'done' && staffId) {
        const [dbResult]: QueryResult = await db.query(
          'UPDATE queue SET status = ?, served_by = ?, served_at = NOW() WHERE queue_number = ?', 
          [status, staffId, finalId]
        );
        result = dbResult as ResultSetHeader;
        console.log('Update result with served_by:', result);
      } else {
        const [dbResult]: QueryResult = await db.query(
          'UPDATE queue SET status = ? WHERE queue_number = ?', 
          [status, finalId]
        );
        result = dbResult as ResultSetHeader;
        console.log('Update result without served_by:', result);
      }
    } catch (err) {
      console.log('queue_number failed, trying id...');
      try {
        if (status === 'done' && staffId) {
          const [dbResult]: QueryResult = await db.query(
            'UPDATE queue SET status = ?, served_by = ?, served_at = NOW() WHERE id = ?', 
            [status, staffId, finalId]
          );
          result = dbResult as ResultSetHeader;
        } else {
          const [dbResult]: QueryResult = await db.query(
            'UPDATE queue SET status = ? WHERE id = ?', 
            [status, finalId]
          );
          result = dbResult as ResultSetHeader;
        }
        console.log('Update result with id:', result);
      } catch (err2) {
        console.log('id failed, trying queueNumber...');
        if (status === 'done' && staffId) {
          const [dbResult]: QueryResult = await db.query(
            'UPDATE queue SET status = ?, served_by = ?, served_at = NOW() WHERE queueNumber = ?', 
            [status, staffId, finalId]
          );
          result = dbResult as ResultSetHeader;
        } else {
          const [dbResult]: QueryResult = await db.query(
            'UPDATE queue SET status = ? WHERE queueNumber = ?', 
            [status, finalId]
          );
          result = dbResult as ResultSetHeader;
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

// DELETE: Remove a queue item
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const idFromUrl = pathSegments[pathSegments.length - 1];
    
    const finalId = paramId || idFromUrl;

    if (!finalId || finalId === 'undefined' || finalId === 'null') {
      return NextResponse.json(
        { success: false, error: 'Missing queue identifier' },
        { status: 400 }
      );
    }

    let result: ResultSetHeader;
    try {
      const [dbResult1]: QueryResult = await db.query('DELETE FROM queue WHERE queue_number = ?', [finalId]);
      result = dbResult1 as ResultSetHeader;
      
      if (!result.affectedRows || result.affectedRows === 0) {
        const [dbResult2]: QueryResult = await db.query('DELETE FROM queue WHERE id = ?', [finalId]);
        result = dbResult2 as ResultSetHeader;
      }
      if (!result.affectedRows || result.affectedRows === 0) {
        const [dbResult3]: QueryResult = await db.query('DELETE FROM queue WHERE queueNumber = ?', [finalId]);
        result = dbResult3 as ResultSetHeader;
      }
    } catch (error: any) {
      console.error('Error deleting queue:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!result.affectedRows || result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Queue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Queue deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE queue:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create or update a queue item (if needed)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const idFromUrl = pathSegments[pathSegments.length - 1];
    
    const finalId = paramId || idFromUrl;
    
    const body = await request.json();
    const { queue_number, status } = body;
    
    if (!queue_number) {
      return NextResponse.json(
        { success: false, error: 'Queue number is required' },
        { status: 400 }
      );
    }
    
    let result: ResultSetHeader;
    
    // Check if this is an update (id exists) or create new
    if (finalId && finalId !== 'undefined' && finalId !== 'null') {
      // Update existing
      const [dbResult]: QueryResult = await db.query(
        'UPDATE queue SET queue_number = ?, status = ? WHERE id = ? OR queue_number = ?',
        [queue_number, status || 'waiting', finalId, finalId]
      );
      result = dbResult as ResultSetHeader;
      
      return NextResponse.json({ 
        success: true, 
        message: 'Queue updated successfully',
        affectedRows: result.affectedRows
      });
    } else {
      // Create new
      const [dbResult]: QueryResult = await db.query(
        'INSERT INTO queue (queue_number, status) VALUES (?, ?)',
        [queue_number, status || 'waiting']
      );
      result = dbResult as ResultSetHeader;
      
      return NextResponse.json({ 
        success: true, 
        message: 'Queue created successfully',
        insertId: result.insertId
      }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Error in POST queue:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}