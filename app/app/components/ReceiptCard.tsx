'use client'

import { Image as ImageIcon, BarChart3 } from 'lucide-react'
import { ReceiptData } from '../types'

interface ReceiptCardProps {
  receipt: ReceiptData
  index: number
  onSelect: (receipt: ReceiptData) => void
}

export default function ReceiptCard({ receipt, index, onSelect }: ReceiptCardProps) {
  return (
    <div
      onClick={() => onSelect(receipt)}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-3 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${index % 4 === 0 ? 'bg-red-100' :
            index % 4 === 1 ? 'bg-blue-100' :
              index % 4 === 2 ? 'bg-green-100' : 'bg-orange-100'
          }`}>
          <div className={`w-4 h-4 rounded ${index % 4 === 0 ? 'bg-red-500' :
              index % 4 === 1 ? 'bg-blue-500' :
                index % 4 === 2 ? 'bg-green-500' : 'bg-orange-500'
            }`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">
            {receipt.store_name || 'Unknown Store'}
          </h3>
          <p className="text-xs text-gray-500">
            {receipt.transaction_date || 'No date'}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-lg font-bold text-gray-900">
          ¥{receipt.total_amount?.toLocaleString() || '0'}
        </p>
      </div>

      <div className="flex justify-between items-center mt-3">
        <div className="flex flex-col space-y-1">
          <span className="text-xs text-gray-500">
            {receipt.items?.length || 0} items
          </span>
          <span className="text-xs font-medium text-indigo-600">
            {receipt.uploader === '夫' ? '🤵 夫' : '👰 嫁'}
          </span>
        </div>
        <div className="flex space-x-1">
          <button className="p-1 hover:bg-gray-100 rounded">
            <ImageIcon size={14} className="text-gray-400" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <BarChart3 size={14} className="text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}