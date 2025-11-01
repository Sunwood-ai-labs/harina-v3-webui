import { NextResponse } from 'next/server'
import { reprocessReceiptById, ReprocessError } from '../../../_lib/reprocessReceipt'

type Params = {
  params: {
    id: string
  }
}

export async function POST(_request: Request, { params }: Params) {
  const receiptId = Number(params.id)

  if (!Number.isFinite(receiptId) || receiptId <= 0) {
    return NextResponse.json({ error: 'Invalid receipt id' }, { status: 400 })
  }

  try {
    const result = await reprocessReceiptById(receiptId)
    return NextResponse.json({
      success: true,
      receipt: {
        ...result.receipt,
        fallbackUsed: result.fallbackUsed,
        keyType: result.keyType,
      },
    })
  } catch (error) {
    if (error instanceof ReprocessError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status }
      )
    }
    console.error('Failed to reprocess receipt:', error)
    return NextResponse.json(
      { error: 'レシート再解析中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
