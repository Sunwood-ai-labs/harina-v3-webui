import { parseString } from 'xml2js'
import type { ReceiptData } from '../../types'

export function parseXmlWithRegex(xmlData: string, filename: string, imagePath?: string): ReceiptData {
  const extractValue = (tag: string): string => {
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`)
    const match = xmlData.match(regex)
    return match ? match[1].trim() : ''
  }

  const extractItems = (): ReceiptData['items'] => {
    const itemsMatch = xmlData.match(/<items>([\s\S]*?)<\/items>/)
    if (!itemsMatch) return []

    const itemsXml = itemsMatch[1]
    const itemMatches = itemsXml.match(/<item>([\s\S]*?)<\/item>/g)
    if (!itemMatches) return []

    return itemMatches.map(itemXml => {
      const name = itemXml.match(/<n>(.*?)<\/n>/)?.[1] || 'Unknown Item'
      const category = itemXml.match(/<category>(.*?)<\/category>/)?.[1] || 'その他'
      const subcategory = itemXml.match(/<subcategory>(.*?)<\/subcategory>/)?.[1] || ''
      const quantity = parseInt(itemXml.match(/<quantity>(.*?)<\/quantity>/)?.[1] || '1')
      const unit_price = parseFloat(itemXml.match(/<unit_price>(.*?)<\/unit_price>/)?.[1] || '0')
      const total_price = parseFloat(itemXml.match(/<total_price>(.*?)<\/total_price>/)?.[1] || '0')

      return {
        name,
        category,
        subcategory,
        quantity,
        unit_price,
        total_price,
      }
    })
  }

  return {
    filename,
    store_name: extractValue('n') || 'Unknown Store',
    store_address: extractValue('address') || '',
    store_phone: extractValue('phone') || '',
    transaction_date: extractValue('date') || new Date().toISOString().split('T')[0],
    transaction_time: extractValue('time') || '',
    receipt_number: extractValue('receipt_number') || '',
    subtotal: parseFloat(extractValue('subtotal')) || 0,
    tax: parseFloat(extractValue('tax')) || 0,
    total_amount: parseFloat(extractValue('total')) || 0,
    payment_method: extractValue('method') || 'Unknown',
    items: extractItems(),
    processed_at: new Date().toISOString(),
    image_path: imagePath,
  }
}

export function parseXmlToReceiptData(xmlData: string, filename: string, imagePath?: string): Promise<ReceiptData> {
  return new Promise((resolve, reject) => {
    let cleanedXml = xmlData
      .replace(/<category>食品・飲料<\/string>/g, '<category>食品・飲料</category>')
      .replace(/<\/string>/g, '</category>')
      .replace(/&/g, '&amp;')

    parseString(cleanedXml, (err, result) => {
      if (err) {
        reject(err)
        return
      }

      try {
        const receipt = result.receipt

        const receiptData: ReceiptData = {
          filename,
          store_name: receipt.store_info?.[0]?.n?.[0] || 'Unknown Store',
          store_address: receipt.store_info?.[0]?.address?.[0] || '',
          store_phone: receipt.store_info?.[0]?.phone?.[0] || '',
          transaction_date: receipt.transaction_info?.[0]?.date?.[0] || new Date().toISOString().split('T')[0],
          transaction_time: receipt.transaction_info?.[0]?.time?.[0] || '',
          receipt_number: receipt.transaction_info?.[0]?.receipt_number?.[0] || '',
          subtotal: parseFloat(receipt.totals?.[0]?.subtotal?.[0]) || 0,
          tax: parseFloat(receipt.totals?.[0]?.tax?.[0]) || 0,
          total_amount: parseFloat(receipt.totals?.[0]?.total?.[0]) || 0,
          payment_method: receipt.payment_info?.[0]?.method?.[0] || 'Unknown',
          items: receipt.items?.[0]?.item?.map((item: any) => ({
            name: item.n?.[0] || 'Unknown Item',
            category: item.category?.[0] || 'その他',
            subcategory: item.subcategory?.[0] || '',
            quantity: parseInt(item.quantity?.[0]) || 1,
            unit_price: parseFloat(item.unit_price?.[0]) || 0,
            total_price: parseFloat(item.total_price?.[0]) || 0,
          })) || [],
          processed_at: new Date().toISOString(),
          image_path: imagePath,
        }

        resolve(receiptData)
      } catch (parseError) {
        reject(parseError)
      }
    })
  })
}
