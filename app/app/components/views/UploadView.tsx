'use client'

import { ReceiptData } from '../../types'
import ReceiptUpload from '../ReceiptUpload'

interface UploadViewProps {
  onReceiptProcessed: (receipt: ReceiptData) => void
}

export default function UploadView({ onReceiptProcessed }: UploadViewProps) {
  return (
    <div className="pb-20 lg:pb-8">
      <div className="text-center space-y-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Upload Receipt</h2>
        <p className="text-gray-600">Select an image file to process with AI</p>
      </div>
      <ReceiptUpload onReceiptProcessed={onReceiptProcessed} />
    </div>
  )
}