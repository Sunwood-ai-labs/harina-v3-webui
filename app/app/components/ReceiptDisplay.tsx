'use client'

import { ReceiptData } from '../types'
import { Calendar, MapPin, Phone, CreditCard, Receipt, Store, ShoppingBag, Calculator, Tag } from 'lucide-react'

interface ReceiptDisplayProps {
  receipt: ReceiptData
}

const categoryColors = [
  'bg-blue-100 text-blue-800',
  'bg-emerald-100 text-emerald-800',
  'bg-purple-100 text-purple-800',
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-800',
  'bg-indigo-100 text-indigo-800',
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
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* レシート基本情報 */}
      <div className="card p-8 card-hover">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Receipt className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">レシート情報</h2>
            <p className="text-slate-600 text-sm">店舗・取引詳細</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <Store size={20} className="text-slate-500 mt-1" />
              <div className="flex-1">
                <p className="font-semibold text-slate-900 text-lg">
                  {receipt.store_name || '店舗名不明'}
                </p>
                {receipt.store_address && (
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    {receipt.store_address}
                  </p>
                )}
              </div>
            </div>
            
            {receipt.store_phone && (
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-slate-500" />
                <p className="text-slate-700 font-medium">{receipt.store_phone}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Calendar size={18} className="text-slate-500" />
              <div>
                <p className="text-slate-700 font-medium">
                  {receipt.transaction_date} {receipt.transaction_time}
                </p>
                <p className="text-slate-500 text-sm">取引日時</p>
              </div>
            </div>
            
            {receipt.payment_method && (
              <div className="flex items-center space-x-3">
                <CreditCard size={18} className="text-slate-500" />
                <div>
                  <p className="text-slate-700 font-medium">{receipt.payment_method}</p>
                  <p className="text-slate-500 text-sm">支払い方法</p>
                </div>
              </div>
            )}
            
            {receipt.receipt_number && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-500 text-sm mb-1">レシート番号</p>
                <p className="font-mono text-slate-800 font-medium">
                  {receipt.receipt_number}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 商品一覧 */}
      <div className="card p-8 card-hover">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <ShoppingBag className="text-emerald-600" size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">購入商品</h3>
            <p className="text-slate-600 text-sm">
              {receipt.items?.length || 0}点の商品
            </p>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">商品名</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">カテゴリ</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-700">数量</th>
                  <th className="text-right py-4 px-6 font-semibold text-slate-700">単価</th>
                  <th className="text-right py-4 px-6 font-semibold text-slate-700">小計</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {receipt.items?.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-slate-900 leading-tight">
                          {item.name}
                        </p>
                        {item.subcategory && (
                          <p className="text-sm text-slate-500 mt-1">
                            {item.subcategory}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        getCategoryColor(item.category || '未分類')
                      }`}>
                        <Tag size={12} className="mr-1" />
                        {item.category || '未分類'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 rounded-full text-sm font-medium text-slate-700">
                        {item.quantity || 1}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-slate-700">
                      ¥{item.unit_price?.toLocaleString() || '0'}
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-slate-900">
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
      <div className="card p-8 card-hover">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Calculator className="text-purple-600" size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">合計</h3>
            <p className="text-slate-600 text-sm">支払い詳細</p>
          </div>
        </div>
        
        <div className="bg-slate-50 rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600 font-medium">小計</span>
              <span className="text-slate-900 font-semibold text-lg">
                ¥{receipt.subtotal?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600 font-medium">税額</span>
              <span className="text-slate-900 font-semibold text-lg">
                ¥{receipt.tax?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="border-t border-slate-300 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-slate-900">合計金額</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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