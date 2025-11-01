import { NextRequest, NextResponse } from 'next/server'
import { reprocessReceiptById, ReprocessError } from '../../../api/_lib/reprocessReceipt'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: { ids?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const idsRaw = Array.isArray(body.ids) ? body.ids : []
  const ids = idsRaw
    .map(value => Number(value))
    .filter(value => Number.isFinite(value) && value > 0)

  if (ids.length === 0) {
    return NextResponse.json({ error: '有効なレシートIDを指定してください' }, { status: 400 })
  }

  const successes: number[] = []
  const failures: Array<{ id: number; error: string }> = []

  for (const id of ids) {
    try {
      await reprocessReceiptById(id)
      successes.push(id)
    } catch (error) {
      if (error instanceof ReprocessError) {
        failures.push({ id, error: error.message })
      } else if (error instanceof Error) {
        failures.push({ id, error: error.message })
      } else {
        failures.push({ id, error: 'Unknown error' })
      }
    }
  }

  return NextResponse.json({
    requested: ids.length,
    succeeded: successes.length,
    failed: failures.length,
    failures,
  })
}
