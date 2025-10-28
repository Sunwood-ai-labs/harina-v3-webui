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
  items?: ReceiptItem[]
  processed_at?: string
  image_path?: string
}
