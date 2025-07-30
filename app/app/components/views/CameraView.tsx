'use client'

import { Camera } from 'lucide-react'
import UploaderSelector from '../UploaderSelector'

interface CameraViewProps {
  selectedUploader: string
  setSelectedUploader: (uploader: string) => void
  onCameraStart: () => void
}

export default function CameraView({ selectedUploader, setSelectedUploader, onCameraStart }: CameraViewProps) {
  return (
    <div className="pb-20 lg:pb-8 text-center space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Capture Receipt</h2>
        <p className="text-gray-600">Take a photo of your receipt to automatically extract information</p>
      </div>

      {/* アップロード者選択 */}
      <UploaderSelector 
        selectedUploader={selectedUploader}
        setSelectedUploader={setSelectedUploader}
      />

      <button
        onClick={onCameraStart}
        className="bg-slate-800 text-white px-8 py-4 rounded-2xl hover:bg-slate-700 transition-colors flex items-center space-x-3 mx-auto"
      >
        <Camera size={24} />
        <span className="font-medium">Start Camera</span>
      </button>
    </div>
  )
}