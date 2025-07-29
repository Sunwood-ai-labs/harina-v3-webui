import { NextRequest, NextResponse } from 'next/server'
import { ReceiptData } from '../../types'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const model = formData.get('model') as string || 'gemini'

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      )
    }

    // HARINAサービスにファイルを送信
    const harinaFormData = new FormData()
    harinaFormData.append('file', file)
    harinaFormData.append('model', model)

    const harinaResponse = await fetch(`${process.env.HARINA_API_URL || 'http://harina:8000'}/process`, {
      method: 'POST',
      body: harinaFormData,
    })

    if (!harinaResponse.ok) {
      throw new Error(`HARINA service error: ${harinaResponse.status}`)
    }

    const harinaResult = await harinaResponse.json()

    // レスポンスデータを整形
    const receiptData: ReceiptData = {
      filename: file.name,
      store_name: harinaResult.store_name,
      store_address: harinaResult.store_address,
      store_phone: harinaResult.store_phone,
      transaction_date: harinaResult.transaction_date,
      transaction_time: harinaResult.transaction_time,
      receipt_number: harinaResult.receipt_number,
      subtotal: parseFloat(harinaResult.subtotal) || 0,
      tax: parseFloat(harinaResult.tax) || 0,
      total_amount: parseFloat(harinaResult.total_amount) || 0,
      payment_method: harinaResult.payment_method,
      items: harinaResult.items || [],
      processed_at: new Date().toISOString()
    }

    // TODO: データベースに保存する処理を追加

    return NextResponse.json(receiptData)
  } catch (error) {
    console.error('Receipt processing error:', error)
    return NextResponse.json(
      { error: 'レシート処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}