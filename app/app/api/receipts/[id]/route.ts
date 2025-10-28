import { NextResponse } from 'next/server'
import { getReceiptById } from '../../../lib/database'

export const dynamic = 'force-dynamic'

type Params = {
  params: {
    id: string
  }
}

export async function GET(_request: Request, { params }: Params) {
  const receiptId = Number(params.id)

  if (!Number.isFinite(receiptId) || receiptId <= 0) {
    return NextResponse.json({ error: 'Invalid receipt id' }, { status: 400 })
  }

  try {
    const receipt = await getReceiptById(receiptId)

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 })
    }

    return NextResponse.json(receipt)
  } catch (error) {
    console.error('Error fetching receipt by id:', error)
    return NextResponse.json(
      { error: 'レシート取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
