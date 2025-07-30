import { NextResponse } from 'next/server'
import { ReceiptData } from '../../types'

export async function GET() {
  try {
    const { Pool } = require('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    })

    // レシート一覧を取得（最新順）
    const receiptsQuery = `
      SELECT 
        r.id,
        r.filename,
        r.store_name,
        r.store_address,
        r.store_phone,
        r.transaction_date,
        r.transaction_time,
        r.receipt_number,
        r.subtotal,
        r.tax,
        r.total_amount,
        r.payment_method,
        r.processed_at,
        COUNT(ri.id) as item_count
      FROM receipts r
      LEFT JOIN receipt_items ri ON r.id = ri.receipt_id
      GROUP BY r.id
      ORDER BY r.processed_at DESC
    `

    const receiptsResult = await pool.query(receiptsQuery)
    const receipts: ReceiptData[] = []

    // 各レシートのアイテムを取得
    for (const receiptRow of receiptsResult.rows) {
      const itemsQuery = `
        SELECT name, category, subcategory, quantity, unit_price, total_price
        FROM receipt_items
        WHERE receipt_id = $1
        ORDER BY id
      `
      
      const itemsResult = await pool.query(itemsQuery, [receiptRow.id])
      
      const receipt: ReceiptData = {
        id: receiptRow.id,
        filename: receiptRow.filename,
        store_name: receiptRow.store_name,
        store_address: receiptRow.store_address,
        store_phone: receiptRow.store_phone,
        transaction_date: receiptRow.transaction_date,
        transaction_time: receiptRow.transaction_time,
        receipt_number: receiptRow.receipt_number,
        subtotal: parseFloat(receiptRow.subtotal) || 0,
        tax: parseFloat(receiptRow.tax) || 0,
        total_amount: parseFloat(receiptRow.total_amount) || 0,
        payment_method: receiptRow.payment_method,
        items: itemsResult.rows.map((item: any) => ({
          name: item.name,
          category: item.category,
          subcategory: item.subcategory,
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price) || 0,
          total_price: parseFloat(item.total_price) || 0
        })),
        processed_at: receiptRow.processed_at
      }
      
      receipts.push(receipt)
    }

    await pool.end()
    
    console.log(`📋 Retrieved ${receipts.length} receipts from database`)
    
    return NextResponse.json(receipts)
    
  } catch (error) {
    console.error('❌ Database fetch error:', error)
    return NextResponse.json(
      { error: 'データベースからの取得に失敗しました' },
      { status: 500 }
    )
  }
}