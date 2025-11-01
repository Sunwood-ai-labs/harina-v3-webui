export interface ReceiptItem {
  id?: number
  name: string
  category?: string
  subcategory?: string
  quantity?: number
  unit_price?: number
  total_price?: number
}

export interface ReceiptData {
  id?: number
  filename?: string
  store_name?: string
  store_address?: string
  store_phone?: string
  transaction_date?: string
  transaction_time?: string
  receipt_number?: string
  subtotal?: number
  tax?: number
  total_amount?: number
  payment_method?: string
  uploader?: string
  model_used?: string
  items?: ReceiptItem[]
  processed_at?: string
  image_path?: string
  duplicate?: boolean
  duplicateOf?: number | null
  fallbackUsed?: boolean
  keyType?: string
}

export interface AnalyticsCategoryBreakdown {
  category: string
  totalAmount: number
  receiptCount: number
}

export interface AnalyticsUploaderBreakdown {
  uploader: string
  totalAmount: number
  receiptCount: number
  categories: AnalyticsCategoryBreakdown[]
}

export interface AnalyticsMonthlySummary {
  year: number
  month: number
  label: string
  totalAmount: number
  receiptCount: number
  uploaderBreakdown: AnalyticsUploaderBreakdown[]
}

export interface AnalyticsYearlySummary {
  year: number
  totalAmount: number
  receiptCount: number
  uploaderBreakdown: AnalyticsUploaderBreakdown[]
}

export interface AnalyticsTopCategory {
  uploader: string
  category: string
  totalAmount: number
  receiptCount: number
  year: number
}

export interface AnalyticsSummaryResponse {
  availableYears: number[]
  selectedYear: number
  monthly: AnalyticsMonthlySummary[]
  yearly: AnalyticsYearlySummary[]
  topCategoriesByUploader: AnalyticsTopCategory[]
  overallTopCategories: AnalyticsTopCategory[]
}

export type AnalyticsSummary = AnalyticsSummaryResponse
