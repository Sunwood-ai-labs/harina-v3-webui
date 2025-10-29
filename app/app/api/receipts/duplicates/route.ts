import { NextResponse } from 'next/server'
import { getDuplicateReceiptGroups } from '../../../lib/database'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const groups = await getDuplicateReceiptGroups()
    return NextResponse.json({ groups })
  } catch (error) {
    console.error('Failed to fetch duplicate receipts:', error)
    return NextResponse.json(
      { error: '重複レシートの取得に失敗しました' },
      { status: 500 }
    )
  }
}
