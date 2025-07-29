'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, X, RotateCcw, Check } from 'lucide-react'

interface CameraCaptureProps {
  onCapture: (file: File) => void
  onClose: () => void
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsStreaming(true)
      }
    } catch (error) {
      console.error('カメラアクセスエラー:', error)
      alert('カメラにアクセスできませんでした。ブラウザの設定を確認してください。')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsStreaming(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedImage(imageDataUrl)
    stopCamera()
  }, [stopCamera])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    startCamera()
  }, [startCamera])

  const confirmPhoto = useCallback(() => {
    if (!capturedImage) return

    // DataURLをFileオブジェクトに変換
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `receipt_${Date.now()}.jpg`, { type: 'image/jpeg' })
        onCapture(file)
        handleClose()
      })
  }, [capturedImage, onCapture])

  const handleClose = useCallback(() => {
    stopCamera()
    setCapturedImage(null)
    onClose()
  }, [stopCamera, onClose])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full max-w-4xl max-h-screen p-4">
        {/* ヘッダー */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
          <h2 className="text-white text-xl font-semibold">レシート撮影</h2>
          <button
            onClick={handleClose}
            className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* カメラビューまたはキャプチャ画像 */}
        <div className="relative w-full h-full flex items-center justify-center">
          {!isStreaming && !capturedImage && (
            <div className="text-center space-y-4">
              <Camera className="mx-auto text-white" size={64} />
              <p className="text-white text-lg">カメラを起動してレシートを撮影</p>
              <button
                onClick={startCamera}
                className="btn-primary"
              >
                カメラを起動
              </button>
            </div>
          )}

          {isStreaming && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain rounded-lg"
              />
              
              {/* 撮影ガイド */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="border-2 border-white/50 border-dashed rounded-lg w-80 h-96 flex items-center justify-center">
                    <p className="text-white/70 text-sm">レシートをここに合わせてください</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {capturedImage && (
            <img
              src={capturedImage}
              alt="撮影されたレシート"
              className="w-full h-full object-contain rounded-lg"
            />
          )}
        </div>

        {/* コントロールボタン */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          {isStreaming && (
            <button
              onClick={capturePhoto}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
            >
              <Camera className="text-gray-800" size={24} />
            </button>
          )}

          {capturedImage && (
            <div className="flex space-x-4">
              <button
                onClick={retakePhoto}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RotateCcw size={20} />
                <span>撮り直し</span>
              </button>
              <button
                onClick={confirmPhoto}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Check size={20} />
                <span>使用する</span>
              </button>
            </div>
          )}
        </div>

        {/* 隠しcanvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}