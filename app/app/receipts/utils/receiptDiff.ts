import type { ReceiptData } from '../../types'

export interface ReceiptDiffEntry {
  label: string
  before: string
  after: string
}

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return '—'
  }
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return '—'
    return value.toLocaleString('ja-JP', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  }
  return String(value)
}

const formatCurrency = (value: unknown): string => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return `¥${value.toLocaleString('ja-JP', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`
  }
  return formatValue(value)
}

const FIELD_CONFIG: Array<{ key: keyof ReceiptData; label: string; formatter?: (value: unknown) => string }> = [
  { key: 'store_name', label: '店舗名' },
  { key: 'store_address', label: '住所' },
  { key: 'store_phone', label: '電話番号' },
  { key: 'transaction_date', label: '購入日' },
  { key: 'transaction_time', label: '購入時間' },
  { key: 'receipt_number', label: 'レシート番号' },
  { key: 'payment_method', label: '支払方法' },
  { key: 'subtotal', label: '小計', formatter: formatCurrency },
  { key: 'tax', label: '税額', formatter: formatCurrency },
  { key: 'total_amount', label: '合計', formatter: formatCurrency },
  { key: 'model_used', label: '使用モデル' },
]

export const buildReceiptDiffEntries = (before: ReceiptData, after: ReceiptData): ReceiptDiffEntry[] => {
  const entries: ReceiptDiffEntry[] = []

  FIELD_CONFIG.forEach(field => {
    const formatter = field.formatter ?? formatValue
    const beforeValue = formatter(before[field.key])
    const afterValue = formatter(after[field.key])
    if (beforeValue !== afterValue) {
      entries.push({
        label: field.label,
        before: beforeValue,
        after: afterValue,
      })
    }
  })

  const beforeItemCount = before.items?.length ?? 0
  const afterItemCount = after.items?.length ?? 0
  if (beforeItemCount !== afterItemCount) {
    entries.push({
      label: '商品数',
      before: `${beforeItemCount.toLocaleString()} 件`,
      after: `${afterItemCount.toLocaleString()} 件`,
    })
  }

  return entries
}
