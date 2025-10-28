import { NextRequest, NextResponse } from 'next/server'
import { getReceiptsFromDatabase, getDatabaseStats, deleteReceiptsByIds } from '../../lib/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching receipts from database...')
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const includeStats = url.searchParams.get('stats') === 'true'

    const receipts = await getReceiptsFromDatabase(limit, offset)
    console.log(`Retrieved ${receipts.length} receipts`)
    
    let stats = null
    if (includeStats) {
      stats = await getDatabaseStats()
      console.log('Database stats:', stats)
    }

    return NextResponse.json({
      receipts,
      stats,
      pagination: {
        limit,
        offset,
        hasMore: receipts.length === limit
      }
    })
  } catch (error) {
    console.error('Error fetching receipts:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        error: 'レシート取得中にエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null) as { ids?: number[] } | null;

    if (!body || !Array.isArray(body.ids)) {
      return NextResponse.json(
        { error: '削除対象のIDが指定されていません' },
        { status: 400 }
      );
    }

    const ids = body.ids
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);

    if (ids.length === 0) {
      return NextResponse.json(
        { error: '有効なIDが指定されていません' },
        { status: 400 }
      );
    }

    const { deletedReceipts, deletedItems } = await deleteReceiptsByIds(ids);

    return NextResponse.json({
      deletedReceipts,
      deletedItems,
    });
  } catch (error) {
    console.error('Error deleting receipts:', error);
    return NextResponse.json(
      { error: 'レシート削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
