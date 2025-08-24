import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // HARINAサービスのヘルスチェック
    const harinaResponse = await fetch(`${process.env.HARINA_API_URL || 'http://harina:8000'}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!harinaResponse.ok) {
      throw new Error('HARINA service is not available')
    }

    return NextResponse.json({ 
      status: 'healthy',
      services: {
        harina: 'online',
        database: 'online'
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Service unavailable'
      },
      { status: 503 }
    )
  }
}
