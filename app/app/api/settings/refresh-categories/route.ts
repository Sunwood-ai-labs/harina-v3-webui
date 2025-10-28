import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const HARINA_BASE_URL = process.env.HARINA_API_URL || 'http://harina:8000'

export async function POST() {
  try {
    const response = await fetch(`${HARINA_BASE_URL}/maintenance/refresh-categories`, {
      method: 'POST',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { error: 'Failed to refresh categories', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json().catch(() => ({}))

    return NextResponse.json({
      success: true,
      categories: data?.categories ?? null,
      subcategories: data?.subcategories ?? null,
    })
  } catch (error) {
    console.error('Failed to refresh categories:', error)
    return NextResponse.json(
      {
        error: 'Failed to refresh categories',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
