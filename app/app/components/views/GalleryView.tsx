'use client'

import { ReceiptData } from '../../types'
import UploaderSelector from '../UploaderSelector'
import ReceiptCard from '../ReceiptCard'
import ActionButtons from '../ActionButtons'

interface GalleryViewProps {
  receipts: ReceiptData[]
  selectedUploader: string
  setSelectedUploader: (uploader: string) => void
  onReceiptSelect: (receipt: ReceiptData) => void
  onCameraClick: () => void
  onFileClick: () => void
}

export default function GalleryView({
  receipts,
  selectedUploader,
  setSelectedUploader,
  onReceiptSelect,
  onCameraClick,
  onFileClick
}: GalleryViewProps) {
  return (
    <div className="pb-20 lg:pb-8">
      {/* アップロード者選択 */}
      <UploaderSelector 
        selectedUploader={selectedUploader}
        setSelectedUploader={setSelectedUploader}
      />

      {/* カテゴリタブ */}
      <div className="flex space-x-1 mb-6 bg-slate-800 rounded-full p-1 overflow-x-auto">
        {['Stories', 'Groceries', 'Transport', 'Utilities'].map((category, index) => (
          <button
            key={category}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${index === 0
                ? 'bg-slate-700 text-white'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* レシートカードグリッド */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 mb-6">
        {receipts.map((receipt, index) => (
          <ReceiptCard
            key={receipt.id || index}
            receipt={receipt}
            index={index}
            onSelect={onReceiptSelect}
          />
        ))}
      </div>

      {/* アクションボタン */}
      <ActionButtons 
        onCameraClick={onCameraClick}
        onFileClick={onFileClick}
      />
    </div>
  )
}