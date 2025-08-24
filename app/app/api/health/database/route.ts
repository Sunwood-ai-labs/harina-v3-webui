import { NextResponse } from 'next/server'
import { testDatabaseConnection } from '../../../lib/database'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const isConnected = await testDatabaseConnection()
    
    if (isConnected) {
      return NextResponse.json({ 
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({ 
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }
  } catch (error) {
    console.error('Database health check failed:', error)
    return NextResponse.json({ 
      status: 'error',
      database: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}
