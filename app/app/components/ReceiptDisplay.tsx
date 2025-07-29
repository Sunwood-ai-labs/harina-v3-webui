'use client'

import { ReceiptData } from '../types'
import { Calendar, MapPin, Phone, CreditCard, Receipt, Store, ShoppingBag, Calculator, Tag } from 'lucide-react'

interface ReceiptDisplayProps {
  receipt: ReceiptData
}

const categoryColors = [
  'bg-indigo-100 text-indigo-800',
  'bg-matcha-100 text-matcha-800',
  'bg-sakura-100 text-sakura-800',
  'bg-gold-100 text-gold-800',
  'bg-washi-300 text-sumi-800',
  'bg-sumi-200 text-sumi-800',
]

const getCategoryColor = (category: string) => {
  const hash = category.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  return categoryColors[Math.abs(hash) % categoryColors.length]
}

export default function ReceiptDisplay({ receipt }: ReceiptDisplayProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in">
      {/* レシート基本情報 */}
      <div className="card p-10 card-hover">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl">
            <Receipt className="text-indigo-700" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-bold wa-text-gradient tracking-wide">レシート情報</h2>
            <p className="text-sumi-600 text-lg mt-1">店舗・取引詳細</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <Store size={24} className="text-sumi-500 mt-1" />
              <div className="flex-1">
                <p className="font-bold text-sumi-800 text-xl tracking-wide">
                  {receipt.store_name || '店舗名不明'}
                </p>
                {receipt.store_address && (
                  <p className="text-sumi-600 mt-2 leading-relaxed text-lg">
                    {receipt.store_address}
                  </p>
                )}
              </div>
            </div>
            
            {receipt.store_phone && (
              <div className="flex items-center space-x-4">
                <Phone size={20} className="text-sumi-500" />
                <p className="text-sumi-700 font-bold text-lg">{receipt.store_phone}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <Calendar size={20} className="text-sumi-500" />
              <div>
                <p className="text-sumi-700 font-bold text-lg">
                  {receipt.transaction_date} {receipt.transaction_time}
                </p>
                <p className="text-sumi-500 text-sm mt-1 tracking-wide">取引日時</p>
              </div>
            </div>
            
            {receipt.payment_method && (
              <div className="flex items-center space-x-4">
                <CreditCard size={20} className="text-sumi-500" />
                <div>
                  <p className="text-sumi-700 font-bold text-lg">{receipt.payment_method}</p>
                  <p className="text-sumi-500 text-sm mt-1 tracking-wide">支払い方法</p>
                </div>
              </div>
            )}
            
            {receipt.receipt_number && (
              <div className="p-6 bg-washi-200/60 rounded-2xl">
                <p className="text-sumi-500 text-sm mb-2 font-medium tracking-wide">レシート番号</p>
                <p className="font-mono text-sumi-800 font-bold text-lg">
                  {receipt.receipt_number}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 商品一覧 */}
      <div className="card p-10 card-hover">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-4 bg-gradient-to-br from-matcha-100 to-matcha-200 rounded-2xl">
            <ShoppingBag className="text-matcha-700" size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-bold wa-text-gradient tracking-wide">購入商品</h3>
            <p className="text-sumi-600 text-lg mt-1">
              {receipt.items?.length || 0}点の商品
            </p>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-2xl border border-washi-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-washi-200/60">
                <tr>
                  <th className="text-left py-6 px-8 font-bold text-sumi-700 tracking-wide">商品名</th>
                  <th className="text-left py-6 px-8 font-bold text-sumi-700 tracking-wide">カテゴリ</th>
                  <th className="text-center py-6 px-8 font-bold text-sumi-700 tracking-wide">数量</th>
                  <th className="text-right py-6 px-8 font-bold text-sumi-700 tracking-wide">単価</th>
                  <th className="text-right py-6 px-8 font-bold text-sumi-700 tracking-wide">小計</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-washi-300">
                {receipt.items?.map((item, index) => (
                  <tr key={index} className="hover:bg-washi-100/50 transition-colors duration-300">
                    <td className="py-6 px-8">
                      <div>
                        <p className="font-bold text-sumi-800 leading-tight text-lg tracking-wide">
                          {item.name}
                        </p>
                        {item.subcategory && (
                          <p className="text-sm text-sumi-500 mt-2 font-medium">
                            {item.subcategory}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ${
                        getCategoryColor(item.category || '未分類')
                      }`}>
                        <Tag size={14} className="mr-2" />
                        {item.category || '未分類'}
                      </span>
                    </td>
                    <td className="py-6 px-8 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 bg-washi-200 rounded-xl text-sm font-bold text-sumi-700">
                        {item.quantity || 1}
                      </span>
                    </td>
                    <td className="py-6 px-8 text-right font-bold text-sumi-700 text-lg">
                      ¥{item.unit_price?.toLocaleString() || '0'}
                    </td>
                    <td className="py-6 px-8 text-right font-bold wa-text-gradient text-xl">
                      ¥{item.total_price?.toLocaleString() || '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 合計金額 */}
      <div className="card p-10 card-hover">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-4 bg-gradient-to-br from-gold-100 to-gold-200 rounded-2xl">
            <Calculator className="text-gold-700" size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-bold wa-text-gradient tracking-wide">合計</h3>
            <p className="text-sumi-600 text-lg mt-1">支払い詳細</p>
          </div>
        </div>
        
        <div className="bg-washi-200/60 rounded-2xl p-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center py-3">
              <span className="text-sumi-600 font-bold text-lg tracking-wide">小計</span>
              <span className="text-sumi-800 font-bold text-xl">
                ¥{receipt.subtotal?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sumi-600 font-bold text-lg tracking-wide">税額</span>
              <span className="text-sumi-800 font-bold text-xl">
                ¥{receipt.tax?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="border-t border-washi-400 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-sumi-800 tracking-wide">合計金額</span>
                <span className="text-4xl font-bold wa-text-gradient">
                  ¥{receipt.total_amount?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}