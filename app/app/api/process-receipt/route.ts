import { NextRequest, NextResponse } from 'next/server'
import { ReceiptData } from '../../types'
import xml2js from 'xml2js'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const model = formData.get('model') as string || 'gemini/gemini-2.5-flash'

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      )
    }

    // デバッグ用：送信パラメータをログ出力
    console.log('📤 Processing receipt:', {
      filename: file.name,
      fileSize: file.size,
      model: model
    })

    // HARINAサービスにファイルを送信
    const harinaFormData = new FormData()
    harinaFormData.append('file', file)
    harinaFormData.append('model', model)
    // formatパラメータは削除（クライアントスクリプトと同じ形式にする）

    const harinaResponse = await fetch(`${process.env.HARINA_API_URL || 'http://harina:8000'}/process`, {
      method: 'POST',
      body: harinaFormData,
    })

    if (!harinaResponse.ok) {
      const errorText = await harinaResponse.text()
      console.error(`❌ HARINA service error ${harinaResponse.status}:`, errorText)
      throw new Error(`HARINA service error: ${harinaResponse.status} - ${errorText}`)
    }

    let harinaResult: any
    const responseText = await harinaResponse.text()
    
    try {
      // まずJSONとしてパースを試行
      harinaResult = JSON.parse(responseText)
      console.log('✅ Receipt processed successfully')
    } catch (jsonError) {
      console.log('❌ JSON parse failed, trying XML parse...')
      try {
        // XMLとしてパースを試行
        const parser = new xml2js.Parser({ explicitArray: false })
        const xmlResult = await parser.parseStringPromise(responseText)
        harinaResult = xmlResult.receipt || xmlResult
        console.log('✅ XML parsed successfully')
      } catch (xmlError) {
        console.error('❌ Both JSON and XML parse failed:', jsonError, xmlError)
        throw new Error('Invalid response format from HARINA service')
      }
    }

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

    // 処理結果をログ出力
    console.log('📋 Receipt data formatted:', {
      store: receiptData.store_name,
      total: receiptData.total_amount,
      items: receiptData.items?.length || 0
    })

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