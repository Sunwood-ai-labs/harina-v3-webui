'use client'

import { useState, useEffect } from 'react'
import { Image as ImageIcon, Calendar, Store, Trash2, Eye, Download, X } from 'lucide-react'
import { ReceiptData } from '../types'

interface PhotoGalleryProps {
  receipts: ReceiptData[]
  onReceiptSelect: (receipt: ReceiptData) => void
  onReceiptDelete?: (receiptId: number) => void
}

export default function PhotoGallery({ receipts, onReceiptSelect, onReceiptDelete }: PhotoGalleryProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleReceiptClick = (receipt: ReceiptData) => {
    setSelectedReceipt(receipt)
    setIsModalOpen(true)
  }

  const handleViewDetails = () => {
    if (selectedReceipt) {
      onReceiptSelect(selectedReceipt)
      setIsModalOpen(false)
    }
  }

  const handleDelete = (receiptId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onReceiptDelete && confirm('このレシートを削除しますか？')) {
      onReceiptDelete(receiptId)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '日付不明'
    try {
      return new Date(dateStr).toLocaleDateString('ja-JP')
    } catch {
      return dateStr
    }
  }

  if (receipts.length === 0) {
    return (
      <div className="text-center py-24 space-y-6">
        <div className="p-6 bg-gradient-to-br from-washi-200 to-washi-300 rounded-3xl inline-block">
          <ImageIcon className="mx-auto text-sumi-400" size={80} />
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-bold wa-text-gradient">レシートがありません</h3>
          <p className="text-sumi-500 text-lg leading-relaxed">撮影またはアップロードしたレシートがここに表示されます</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold wa-text-gradient tracking-wide">レシート一覧</h2>
          <div className="px-4 py-2 bg-washi-200/60 rounded-xl">
            <span className="text-sm text-sumi-600 font-medium">{receipts.length}件のレシート</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {receipts.map((receipt, index) => (
            <div
              key={receipt.id || index}
              onClick={() => handleReceiptClick(receipt)}
              className="card p-6 card-hover cursor-pointer group"
            >
              {/* レシート画像プレビュー（仮想） */}
              <div className="aspect-[3/4] bg-gradient-to-br from-washi-200 to-washi-300 rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden">
                <ImageIcon className="text-sumi-400" size={40} />
                <div className="absolute inset-0 bg-gradient-to-t from-sumi-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* アクションボタン */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {receipt.id && onReceiptDelete && (
                    <button
                      onClick={(e) => handleDelete(receipt.id!, e)}
                      className="p-2 bg-sakura-500 text-washi-50 rounded-xl hover:bg-sakura-600 transition-colors wa-shadow-soft"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* レシート情報 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-sumi-600">
                  <Store size={16} />
                  <span className="truncate font-medium">{receipt.store_name || '店舗名不明'}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-sm text-sumi-600">
                  <Calendar size={16} />
                  <span className="font-medium">{formatDate(receipt.transaction_date)}</span>
                </div>

                <div className="text-right">
                  <span className="text-xl font-bold wa-text-gradient">
                    ¥{receipt.total_amount?.toLocaleString() || '0'}
                  </span>
                </div>

                <div className="text-xs text-sumi-500 font-medium">
                  {receipt.items?.length || 0}点の商品
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 和風モーダル */}
      {isModalOpen && selectedReceipt && (
        <div className="fixed inset-0 bg-sumi-900 bg-opacity-60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-washi-50 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto wa-shadow-medium">
            <div className="p-8">
              {/* ヘッダー */}
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold wa-text-gradient tracking-wide">レシート詳細</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 hover:bg-washi-200 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* レシート画像プレビュー */}
              <div className="aspect-[3/4] bg-gradient-to-br from-washi-200 to-washi-300 rounded-2xl mb-8 flex items-center justify-center">
                <ImageIcon className="text-sumi-400" size={60} />
              </div>

              {/* レシート情報 */}
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-sumi-600 tracking-wide">店舗名</label>
                  <p className="text-sumi-800 font-bold text-lg mt-1">{selectedReceipt.store_name || '不明'}</p>
                </div>

                <div>
                  <label className="text-sm font-bold text-sumi-600 tracking-wide">取引日時</label>
                  <p className="text-sumi-800 font-medium mt-1">
                    {formatDate(selectedReceipt.transaction_date)} {selectedReceipt.transaction_time}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-sumi-600 tracking-wide">合計金額</label>
                  <p className="text-3xl font-bold wa-text-gradient mt-2">
                    ¥{selectedReceipt.total_amount?.toLocaleString() || '0'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-sumi-600 tracking-wide">商品数</label>
                  <p className="text-sumi-800 font-bold text-lg mt-1">{selectedReceipt.items?.length || 0}点</p>
                </div>

                {selectedReceipt.payment_method && (
                  <div>
                    <label className="text-sm font-bold text-sumi-600 tracking-wide">支払い方法</label>
                    <p className="text-sumi-800 font-medium mt-1">{selectedReceipt.payment_method}</p>
                  </div>
                )}
              </div>

              {/* アクションボタン */}
              <div className="flex space-x-4 mt-8">
                <button
                  onClick={handleViewDetails}
                  className="flex-1 flex items-center justify-center space-x-3 btn-primary rounded-2xl py-4"
                >
                  <Eye size={20} />
                  <span className="tracking-wide">詳細を見る</span>
                </button>
                
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-4 border border-washi-400 text-sumi-700 rounded-2xl hover:bg-washi-100 transition-colors font-medium tracking-wide"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}