'use client'

import { X } from 'lucide-react'
import { ReceiptData } from '../../types'
import ReceiptDisplay from '../ReceiptDisplay'

interface DetailViewProps {
  receipt: ReceiptData | null
  onClose: () => void
}

export default function DetailView({ receipt, onClose }: DetailViewProps) {
  if (!receipt) return null

  return (
    <div className="pb-20 lg:pb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Receipt Details</h2>
        <button
          onClick={onClose}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <X size={20} />
          <span>Close</span>
        </button>
      </div>
      <ReceiptDisplay receipt={receipt} />
    </div>
  )
}