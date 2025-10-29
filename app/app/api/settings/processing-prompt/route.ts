import { NextRequest, NextResponse } from 'next/server'
import { getProcessingPrompt, updateProcessingPrompt } from '../../../lib/database'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const prompt = await getProcessingPrompt()
    return NextResponse.json({ prompt })
  } catch (error) {
    console.error('Failed to fetch processing prompt:', error)
    return NextResponse.json(
      { error: '追加プロンプトの取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  let body: { prompt?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 }
    )
  }

  const prompt = body.prompt ?? ''

  try {
    const updated = await updateProcessingPrompt(prompt)
    return NextResponse.json({ prompt: updated })
  } catch (error) {
    console.error('Failed to update processing prompt:', error)
    return NextResponse.json(
      { error: '追加プロンプトの更新に失敗しました' },
      { status: 500 }
    )
  }
}
