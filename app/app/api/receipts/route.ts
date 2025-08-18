import { NextRequest, NextResponse } from 'next/server'
import { getReceiptsFromDatabase, getDatabaseStats } from '../../lib/database'

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
