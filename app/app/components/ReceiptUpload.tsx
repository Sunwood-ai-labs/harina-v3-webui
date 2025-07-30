'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2, Sparkles, Brain, Zap, Paperclip } from 'lucide-react'
import { toast } from 'react-toastify'
import { ReceiptData } from '../types'

interface ReceiptUploadProps {
  onReceiptProcessed: (receipt: ReceiptData) => void
}

const modelOptions = [
  { 
    value: 'gemini/gemini-2.5-flash', 
    label: 'Gemini 2.5 Flash', 
    icon: Sparkles, 
    description: '高精度・高速処理',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  },
  { 
    value: 'gpt-4o', 
    label: 'GPT-4o', 
    icon: Brain, 
    description: '詳細な分析',
    color: 'text-matcha-600',
    bgColor: 'bg-matcha-50',
    borderColor: 'border-matcha-200'
  },
  { 
    value: 'claude-3-5-sonnet-20241022', 
    label: 'Claude 3.5 Sonnet', 
    icon: Zap, 
    description: '正確な認識',
    color: 'text-sakura-600',
    bgColor: 'bg-sakura-50',
    borderColor: 'border-sakura-200'
  },
]

export default function ReceiptUpload({ onReceiptProcessed }: ReceiptUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gemini/gemini-2.5-flash')
  const [selectedUploader, setSelectedUploader] = useState('夫')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('画像ファイルを選択してください', {
        position: "top-center",
        autoClose: 3000,
      })
      return
    }

    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('model', selectedModel)
      formData.append('uploader', selectedUploader)

      const response = await fetch('/api/process-receipt', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('レシート処理に失敗しました')
      }

      const result = await response.json()
      onReceiptProcessed(result)
      toast.success('レシートを正常に処理しました！', {
        position: "top-center",
        autoClose: 3000,
      })
    } catch (error) {
      console.error('Error processing receipt:', error)
      toast.error('レシート処理中にエラーが発生しました', {
        position: "top-center",
        autoClose: 5000,
      })
    } finally {
      setIsProcessing(false)
    }
  }, [selectedModel, onReceiptProcessed])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    const file = acceptedFiles[0]
    await processFile(file)
  }, [processFile])

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      await processFile(files[0])
    }
    // ファイル入力をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [processFile])

  const handleFileButtonClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp']
    },
    multiple: false
  })

  const selectedModelData = modelOptions.find(m => m.value === selectedModel)

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      {/* モデル選択 */}
      <div className="space-y-6">
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-bold wa-text-gradient">AIモデルを選択</h3>
          <p className="text-sumi-600 leading-relaxed">用途に応じて最適なAIモデルをお選びください</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {modelOptions.map((model) => {
            const Icon = model.icon
            const isSelected = selectedModel === model.value
            
            return (
              <button
                key={model.value}
                onClick={() => setSelectedModel(model.value)}
                disabled={isProcessing}
                className={`card p-6 text-left transition-all duration-300 ${
                  isSelected 
                    ? `ring-2 ${model.borderColor.replace('border-', 'ring-')} ${model.bgColor} border-transparent wa-shadow-medium` 
                    : 'card-hover'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 ${model.bgColor} rounded-xl`}>
                    <Icon className={`${model.color}`} size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sumi-800 text-lg tracking-wide">{model.label}</p>
                    <p className="text-sm text-sumi-500 mt-2 leading-relaxed">{model.description}</p>
                  </div>
                  {isSelected && (
                    <div className={`w-3 h-3 ${model.color.replace('text-', 'bg-')} rounded-full animate-pulse`} />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* アップロード者選択 */}
      <div className="space-y-6">
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-bold wa-text-gradient">アップロード者を選択</h3>
          <p className="text-sumi-600 leading-relaxed">誰がレシートをアップロードしますか？</p>
        </div>
        
        <div className="flex justify-center space-x-4">
          {['夫', '嫁'].map((uploader) => (
            <button
              key={uploader}
              onClick={() => setSelectedUploader(uploader)}
              disabled={isProcessing}
              className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                selectedUploader === uploader
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg'
                  : 'bg-washi-200 text-sumi-700 hover:bg-washi-300'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {uploader === '夫' ? '🤵 夫' : '👰 嫁'}
            </button>
          ))}
        </div>
      </div>

      {/* ファイルアップロード */}
      <div
        {...getRootProps()}
        className={`upload-zone p-16 text-center cursor-pointer ${
          isDragActive ? 'upload-zone-active' : ''
        } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <div className="space-y-8 animate-scale-in">
            <div className="relative">
              <Loader2 className="mx-auto h-20 w-20 text-indigo-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                {selectedModelData && (
                  <selectedModelData.icon className={`${selectedModelData.color} animate-pulse`} size={28} />
                )}
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-2xl font-bold wa-text-gradient">解析中...</p>
              <p className="text-sumi-600 text-lg leading-relaxed">
                {selectedModelData?.label}でレシートを解析しています
              </p>
              <div className="mt-6 w-64 mx-auto bg-washi-300 rounded-full h-2">
                <div className="wa-gradient-primary h-2 rounded-full animate-pulse" style={{width: '60%'}} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <div className="relative">
              <Upload className={`mx-auto h-20 w-20 transition-colors duration-300 ${
                isDragActive ? 'text-matcha-500 animate-float' : 'text-sumi-400'
              }`} />
              {isDragActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 border-2 border-matcha-500 border-dashed rounded-full animate-ping" />
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-2xl font-bold wa-text-gradient">
                  {isDragActive ? 'ファイルをドロップしてください' : 'レシート画像をアップロード'}
                </p>
                <p className="text-sumi-600 text-lg leading-relaxed">
                  ドラッグ&ドロップまたはクリックしてファイルを選択
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="inline-flex items-center space-x-3 px-6 py-3 bg-washi-200/60 rounded-2xl text-sm text-sumi-600">
                  <span className="font-medium">対応形式:</span>
                  <span className="font-bold tracking-wide">JPEG, PNG, GIF, BMP</span>
                </div>
                
                <button
                  onClick={handleFileButtonClick}
                  disabled={isProcessing}
                  className="flex items-center space-x-3 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Paperclip size={20} />
                  <span className="font-medium">ファイルを選択</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}