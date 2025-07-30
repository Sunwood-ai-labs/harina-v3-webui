'use client'

import { Camera, Paperclip } from 'lucide-react'

interface ActionButtonsProps {
  onCameraClick: () => void
  onFileClick: () => void
}

export default function ActionButtons({ onCameraClick, onFileClick }: ActionButtonsProps) {
  return (
    <div className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 flex flex-col space-y-3 z-40">
      <button
        onClick={onCameraClick}
        className="bg-slate-800 text-white px-6 py-3 rounded-full shadow-lg hover:bg-slate-700 transition-colors flex items-center space-x-2"
      >
        <Camera size={20} />
        <span className="font-medium hidden sm:inline">Scan receipt</span>
        <span className="font-medium sm:hidden">Scan</span>
      </button>

      <button
        onClick={onFileClick}
        className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
      >
        <Paperclip size={20} />
        <span className="font-medium hidden sm:inline">Upload file</span>
        <span className="font-medium sm:hidden">Upload</span>
      </button>
    </div>
  )
}