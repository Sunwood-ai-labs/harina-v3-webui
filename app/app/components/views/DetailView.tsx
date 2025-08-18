'use client'

import { X, Image, FileText, Calendar, Download, ExternalLink } from 'lucide-react'
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
      {/* ヘッダー */}
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

      {/* 画像プレビューセクション */}
      {receipt.image_path && (
        <div className="mb-8 p-6 bg-gradient-to-r from-sakura-50 to-indigo-50 rounded-2xl border border-washi-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-sakura-100 rounded-xl">
              <Image className="text-sakura-600" size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">画像プレビュー</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 画像サムネイル */}
            <div className="flex justify-center">
              <div className="relative group">
                <img
                  src={receipt.image_path || '/placeholder-receipt.png'}
                  alt={`レシート - ${receipt.store_name}`}
                  className="w-full max-w-xs h-48 object-cover rounded-xl shadow-md border border-washi-300"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-receipt.png'
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl"></div>
              </div>
            </div>
            
            {/* 画像情報 */}
            <div className="space-y-4">
              <div className="bg-white/70 rounded-xl p-4">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <FileText size={16} className="mr-2 text-indigo-500" />
                  画像情報
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ファイル名:</span>
                    <span className="font-mono text-gray-800 text-xs">{receipt.filename}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">保存パス:</span>
                    <span className="font-mono text-gray-800 text-xs break-all">{receipt.image_path}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">処理日時:</span>
                    <span className="text-gray-800 text-xs">
                      {new Date(receipt.processed_at || '').toLocaleString('ja-JP')}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* 操作ボタン */}
              <div className="flex space-x-2">
                <a
                  href={receipt.image_path}
                  download={receipt.filename}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors text-sm font-medium"
                >
                  <Download size={16} className="mr-2" />
                  ダウンロード
                </a>
                <button
                  onClick={() => {
                    if (receipt.image_path) {
                      window.open(receipt.image_path, '_blank')
                    }
                  }}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-washi-500 text-white rounded-xl hover:bg-washi-600 transition-colors text-sm font-medium"
                >
                  <ExternalLink size={16} className="mr-2" />
                  新規ウィンドウ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* レシート詳細 */}
      <ReceiptDisplay receipt={receipt} />
    </div>
  )
}
