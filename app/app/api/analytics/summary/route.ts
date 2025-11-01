import { NextRequest, NextResponse } from 'next/server'
import { getAnalyticsSummary } from '../../../lib/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const yearParam = url.searchParams.get('year')
  const parsedYear = yearParam ? Number(yearParam) : undefined
  const year = Number.isFinite(parsedYear) ? Math.trunc(parsedYear!) : undefined

  try {
    const summary = await getAnalyticsSummary(year)
    return NextResponse.json(summary)
  } catch (error) {
    console.error('Failed to build analytics summary:', error)
    return NextResponse.json(
      { error: '分析データの取得に失敗しました' },
      { status: 500 }
    )
  }
}
