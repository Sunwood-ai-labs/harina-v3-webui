import { NextRequest, NextResponse } from 'next/server'
import { updateReceiptItem } from '../../../lib/database'

export const dynamic = 'force-dynamic'

type Params = {
  params: {
    id: string
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const itemId = Number(params.id)

  if (!Number.isFinite(itemId) || itemId <= 0) {
    return NextResponse.json(
      { error: 'Invalid receipt item id' },
      { status: 400 }
    )
  }

  let payload: { category?: string | null; subcategory?: string | null }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 }
    )
  }

  const hasCategory = Object.prototype.hasOwnProperty.call(payload, 'category')
  const hasSubcategory = Object.prototype.hasOwnProperty.call(payload, 'subcategory')

  if (!hasCategory && !hasSubcategory) {
    return NextResponse.json(
      { error: 'No updatable fields provided' },
      { status: 400 }
    )
  }

  try {
    const updated = await updateReceiptItem(itemId, {
      category: hasCategory ? payload.category ?? null : undefined,
      subcategory: hasSubcategory ? payload.subcategory ?? null : undefined
    })

    if (!updated) {
      return NextResponse.json(
        { error: 'Receipt item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update receipt item:', error)
    return NextResponse.json(
      { error: 'レシート項目の更新中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
