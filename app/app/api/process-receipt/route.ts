import { NextRequest, NextResponse } from 'next/server'
import { ReceiptData } from '../../types'
import xml2js from 'xml2js'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const model = formData.get('model') as string || 'gemini/gemini-2.5-flash'
    const uploader = formData.get('uploader') as string || '夫'

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
      model: model,
      uploader: uploader
    })

    // HARINAサービスにファイルを送信（client_sample.pyと同じ形式）
    const harinaFormData = new FormData()
    harinaFormData.append('file', file)
    harinaFormData.append('model', model)
    harinaFormData.append('format', 'xml')  // XMLフォーマットを明示的に指定

    const harinaResponse = await fetch(`${process.env.HARINA_API_URL || 'http://harina:8000'}/process`, {
      method: 'POST',
      body: harinaFormData,
    })

    if (!harinaResponse.ok) {
      const errorText = await harinaResponse.text()
      console.error(`❌ HARINA service error ${harinaResponse.status}:`, errorText)
      throw new Error(`HARINA service error: ${harinaResponse.status} - ${errorText}`)
    }

    const responseText = await harinaResponse.text()
    console.log('🔍 Raw response from HARINA:', responseText.substring(0, 200) + '...')
    
    let harinaResult: any
    
    try {
      // まずJSONレスポンスとしてパースを試行
      const jsonResponse = JSON.parse(responseText)
      
      if (jsonResponse.success && jsonResponse.data) {
        console.log('✅ JSON response with data field detected')
        // client_sample.pyと同じ形式のレスポンス
        if (jsonResponse.format === 'xml') {
          // XMLデータをパース
          const parser = new xml2js.Parser({ explicitArray: false })
          const xmlResult = await parser.parseStringPromise(jsonResponse.data)
          harinaResult = xmlResult.receipt || xmlResult
          console.log('✅ XML data parsed successfully')
        } else {
          throw new Error('Unexpected format in JSON response')
        }
      } else {
        // 直接的なJSONレスポンス
        harinaResult = jsonResponse
        console.log('✅ Direct JSON response parsed successfully')
      }
    } catch (jsonError) {
      console.log('❌ JSON parse failed, trying direct XML parse...')
      try {
        // 直接XMLとしてパースを試行
        const parser = new xml2js.Parser({ explicitArray: false })
        const xmlResult = await parser.parseStringPromise(responseText)
        harinaResult = xmlResult.receipt || xmlResult
        console.log('✅ Direct XML parsed successfully')
      } catch (xmlError) {
        console.error('❌ Both JSON and XML parse failed:', jsonError, xmlError)
        console.error('❌ Raw response:', responseText)
        throw new Error('Invalid response format from HARINA service')
      }
    }

    // XMLの構造に合わせてレスポンスデータを整形
    console.log('🔍 Parsing receipt data structure...')
    
    const receiptData: ReceiptData = {
      filename: file.name,
      store_name: harinaResult.store_info?.n || harinaResult.store_name,
      store_address: harinaResult.store_info?.address || harinaResult.store_address,
      store_phone: harinaResult.store_info?.phone || harinaResult.store_phone,
      transaction_date: harinaResult.transaction_info?.date || harinaResult.transaction_date,
      transaction_time: harinaResult.transaction_info?.time || harinaResult.transaction_time,
      receipt_number: harinaResult.transaction_info?.receipt_number || harinaResult.receipt_number,
      subtotal: parseFloat(harinaResult.totals?.subtotal || harinaResult.subtotal) || 0,
      tax: parseFloat(harinaResult.totals?.tax || harinaResult.tax) || 0,
      total_amount: parseFloat(harinaResult.totals?.total || harinaResult.total_amount) || 0,
      payment_method: harinaResult.payment_info?.method || harinaResult.payment_method,
      uploader: uploader,
      items: [],
      processed_at: new Date().toISOString()
    }

    // アイテムの処理
    if (harinaResult.items) {
      if (Array.isArray(harinaResult.items.item)) {
        // 複数のアイテム
        receiptData.items = harinaResult.items.item.map((item: any) => ({
          name: item.n || item.name,
          category: item.category,
          subcategory: item.subcategory,
          quantity: parseInt(item.quantity) || 1,
          unit_price: parseFloat(item.unit_price) || 0,
          total_price: parseFloat(item.total_price) || 0
        }))
      } else if (harinaResult.items.item) {
        // 単一のアイテム
        const item = harinaResult.items.item
        receiptData.items = [{
          name: item.n || item.name,
          category: item.category,
          subcategory: item.subcategory,
          quantity: parseInt(item.quantity) || 1,
          unit_price: parseFloat(item.unit_price) || 0,
          total_price: parseFloat(item.total_price) || 0
        }]
      }
    } else if (Array.isArray(harinaResult.items)) {
      // 直接配列の場合
      receiptData.items = harinaResult.items.map((item: any) => ({
        name: item.n || item.name,
        category: item.category,
        subcategory: item.subcategory,
        quantity: parseInt(item.quantity) || 1,
        unit_price: parseFloat(item.unit_price) || 0,
        total_price: parseFloat(item.total_price) || 0
      }))
    }

    // 処理結果をログ出力
    console.log('📋 Receipt data formatted:', {
      store: receiptData.store_name,
      total: receiptData.total_amount,
      items: receiptData.items?.length || 0
    })

    // データベースに保存
    try {
      const { Pool } = require('pg')
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL
      })

      // レシート情報を保存
      const receiptInsertQuery = `
        INSERT INTO receipts (
          filename, store_name, store_address, store_phone, 
          transaction_date, transaction_time, receipt_number,
          subtotal, tax, total_amount, payment_method, uploader
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `
      
      const receiptValues = [
        receiptData.filename,
        receiptData.store_name,
        receiptData.store_address,
        receiptData.store_phone,
        receiptData.transaction_date,
        receiptData.transaction_time,
        receiptData.receipt_number,
        receiptData.subtotal,
        receiptData.tax,
        receiptData.total_amount,
        receiptData.payment_method,
        receiptData.uploader
      ]

      const receiptResult = await pool.query(receiptInsertQuery, receiptValues)
      const receiptId = receiptResult.rows[0].id
      
      console.log(`💾 Receipt saved to database with ID: ${receiptId}`)

      // アイテム情報を保存
      if (receiptData.items && receiptData.items.length > 0) {
        const itemInsertQuery = `
          INSERT INTO receipt_items (
            receipt_id, name, category, subcategory, 
            quantity, unit_price, total_price
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `
        
        for (const item of receiptData.items) {
          const itemValues = [
            receiptId,
            item.name,
            item.category,
            item.subcategory,
            item.quantity,
            item.unit_price,
            item.total_price
          ]
          await pool.query(itemInsertQuery, itemValues)
        }
        
        console.log(`💾 ${receiptData.items.length} items saved to database`)
      }

      // データベース接続を閉じる
      await pool.end()
      
      // レスポンスにIDを追加
      receiptData.id = receiptId
      
    } catch (dbError) {
      console.error('❌ Database save error:', dbError)
      // データベースエラーでもレスポンスは返す（処理は成功しているため）
    }

    return NextResponse.json(receiptData)
  } catch (error) {
    console.error('Receipt processing error:', error)
    return NextResponse.json(
      { error: 'レシート処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}