'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Camera, X, RotateCcw, Check, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface CameraCaptureProps {
  onCapture: (file: File) => void
  onClose: () => void
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsStreaming(false)
    setIsInitializing(false)
  }, [])

  const startCamera = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
      setErrorMessage('お使いのブラウザではカメラ機能が利用できません。HTTPSでアクセスしているか確認してください。')
      return
    }

    const getStream = async (facing: 'environment' | 'user') => {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      }

      return navigator.mediaDevices.getUserMedia(constraints)
    }

    setIsInitializing(true)
    setErrorMessage(null)
    setCapturedImage(null)
    setIsStreaming(false)

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      let stream: MediaStream | null = null

      try {
        stream = await getStream('environment')
      } catch (primaryError) {
        console.warn('背面カメラにアクセスできません。前面カメラで再試行します。', primaryError)
        if (primaryError instanceof DOMException && primaryError.name === 'NotAllowedError') {
          throw primaryError
        }
        stream = await getStream('user')
      }

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream
      }
      streamRef.current = stream
      setIsStreaming(true)
    } catch (error) {
      console.error('カメラアクセスエラー:', error)
      const message =
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'カメラへのアクセスが拒否されました。ブラウザやOSの設定を確認し、アクセスを許可してください。'
          : 'カメラを起動できませんでした。ブラウザの設定を確認し、別のカメラをお試しください。'
      setErrorMessage(message)
      setIsStreaming(false)
    } finally {
      setIsInitializing(false)
    }
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
    setErrorMessage(null)
    stopCamera()
  }, [stopCamera])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    setErrorMessage(null)
    void startCamera()
  }, [startCamera])

  const handleClose = useCallback(() => {
    stopCamera()
    setCapturedImage(null)
    setErrorMessage(null)
    onClose()
  }, [stopCamera, onClose])

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
  }, [capturedImage, handleClose, onCapture])

  useEffect(() => {
    void startCamera()
    return () => {
      stopCamera()
    }
  }, [startCamera, stopCamera])

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

        {errorMessage && (
          <div className="absolute top-20 left-1/2 z-20 w-[min(90%,24rem)] -translate-x-1/2 rounded-lg border border-red-400/60 bg-red-500/25 p-3 text-sm text-red-100 shadow-lg backdrop-blur">
            {errorMessage}
          </div>
        )}

        {/* カメラビューまたはキャプチャ画像 */}
        <div className="relative w-full h-full flex items-center justify-center">
          {!isStreaming && !capturedImage && (
            <div className="text-center space-y-4 px-6">
              <Camera className="mx-auto text-white/80" size={64} />
              <p className="text-white text-lg">カメラを起動してレシートを撮影</p>
              <p className="text-sm text-white/70">
                カメラが起動しない場合はブラウザの権限設定を確認し、下のボタンから再試行してください。
              </p>
              <button
                onClick={() => void startCamera()}
                disabled={isInitializing}
                className="inline-flex items-center gap-2 rounded-full bg-white/95 px-5 py-2 font-semibold text-gray-800 shadow hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isInitializing && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{isInitializing ? '準備中…' : 'カメラを起動'}</span>
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
            <div className="relative w-full h-full">
              <Image
                src={capturedImage}
                alt="撮影されたレシート"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 960px"
                className="object-contain rounded-lg"
                priority
                onError={() => setErrorMessage('画像を読み込めませんでした。もう一度撮影してください。')}
              />
            </div>
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
