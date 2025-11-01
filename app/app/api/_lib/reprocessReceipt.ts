import { readFile } from 'fs/promises'
import { join } from 'path'
import { getProcessingPrompt, getReceiptById, overwriteReceiptData } from '../../lib/database'
import type { ReceiptData } from '../../types'
import { parseXmlToReceiptData, parseXmlWithRegex } from './receiptParsing'

const HARINA_BASE_URL = process.env.HARINA_API_URL || 'http://harina:8000'
const DEFAULT_MODEL = 'gemini/gemini-2.5-flash'

export interface ReprocessResult {
  receipt: ReceiptData
  fallbackUsed: boolean
  keyType?: string
}

export class ReprocessError extends Error {
  status: number
  details?: string

  constructor(message: string, status = 500, details?: string) {
    super(message)
    this.name = 'ReprocessError'
    this.status = status
    this.details = details
  }
}

export async function reprocessReceiptById(receiptId: number): Promise<ReprocessResult> {
  if (!Number.isFinite(receiptId) || receiptId <= 0) {
    throw new ReprocessError('Invalid receipt id', 400)
  }

  const existing = await getReceiptById(receiptId)
  if (!existing) {
    throw new ReprocessError('Receipt not found', 404)
  }

  if (!existing.image_path) {
    throw new ReprocessError('Receipt image is missing, cannot reprocess', 400)
  }

  const relativePath = existing.image_path.startsWith('/')
    ? existing.image_path.slice(1)
    : existing.image_path
  const absolutePath = join(process.cwd(), 'public', relativePath)

  const fileBuffer = await readFile(absolutePath)
  const originalFilename = existing.filename || relativePath.split('/').pop() || `receipt_${receiptId}.jpg`

  let additionalPrompt = ''
  try {
    additionalPrompt = await getProcessingPrompt()
  } catch (promptError) {
    console.error('Failed to load additional prompt while reprocessing receipt:', promptError)
  }

  const extension = originalFilename.split('.').pop()?.toLowerCase()
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp',
  }
  const mimeType = (extension && mimeMap[extension]) || 'application/octet-stream'

  const file = new File([fileBuffer], originalFilename, { type: mimeType })

  const harinaFormData = new FormData()
  harinaFormData.append('file', file)
  harinaFormData.append('model', existing.model_used || DEFAULT_MODEL)
  harinaFormData.append('format', 'xml')
  if (additionalPrompt.trim().length > 0) {
    harinaFormData.append('instructions', additionalPrompt.trim())
  }

  const harinaResponse = await fetch(`${HARINA_BASE_URL}/process`, {
    method: 'POST',
    body: harinaFormData,
  })

  if (!harinaResponse.ok) {
    const errorText = await harinaResponse.text().catch(() => 'Unknown error')
    console.error('HARINA service returned error during reprocess:', errorText)
    throw new ReprocessError('Failed to reprocess receipt via HARINA service', harinaResponse.status, errorText)
  }

  const harinaResult = await harinaResponse.json()
  if (!harinaResult?.success) {
    throw new ReprocessError('HARINA processing failed', 502, harinaResult?.error ?? 'Unknown error')
  }

  const xmlData: string = harinaResult.data
  let receiptData: ReceiptData

  try {
    receiptData = await parseXmlToReceiptData(xmlData, originalFilename, existing.image_path ?? undefined)
  } catch (xmlError) {
    console.error('Structured XML parse failed, falling back to regex:', xmlError)
    receiptData = parseXmlWithRegex(xmlData, originalFilename, existing.image_path ?? undefined)
  }

  receiptData.id = receiptId
  receiptData.uploader = existing.uploader
  receiptData.image_path = existing.image_path
  receiptData.model_used = existing.model_used || DEFAULT_MODEL
  receiptData.processed_at = new Date().toISOString()

  await overwriteReceiptData(receiptId, receiptData)

  return {
    receipt: receiptData,
    fallbackUsed: harinaResult.fallbackUsed === true,
    keyType: typeof harinaResult.keyType === 'string' ? harinaResult.keyType : existing.keyType,
  }
}
