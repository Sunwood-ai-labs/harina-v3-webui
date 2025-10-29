import { NextRequest, NextResponse } from 'next/server'
import { bulkUpdateReceiptItemsByReceiptIds } from '../../../lib/database'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: { receiptIds?: unknown; category?: unknown; subcategory?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const receiptIdsRaw = body.receiptIds
  if (!Array.isArray(receiptIdsRaw) || receiptIdsRaw.length === 0) {
    return NextResponse.json({ error: 'レシートIDを指定してください' }, { status: 400 })
  }

  const receiptIds = receiptIdsRaw
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0)

  if (receiptIds.length === 0) {
    return NextResponse.json({ error: '有効なレシートIDがありません' }, { status: 400 })
  }

  const category = typeof body.category === 'string' ? body.category.trim() : ''
  if (!category) {
    return NextResponse.json({ error: 'カテゴリを指定してください' }, { status: 400 })
  }

  const subcategory =
    typeof body.subcategory === 'string' ? body.subcategory.trim() : ''

  try {
    const updatedItems = await bulkUpdateReceiptItemsByReceiptIds(receiptIds, {
      category,
      subcategory: subcategory || null,
    })
    return NextResponse.json({ updatedItems })
  } catch (error) {
    console.error('Failed to bulk update receipt items:', error)
    return NextResponse.json(
      { error: 'レシートの更新に失敗しました' },
      { status: 500 }
    )
  }
}
