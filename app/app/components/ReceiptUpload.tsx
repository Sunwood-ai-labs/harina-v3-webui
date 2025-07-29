'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2, Sparkles, Brain, Zap } from 'lucide-react'
import { toast } from 'react-toastify'
import { ReceiptData } from '../types'

interface ReceiptUploadProps {
  onReceiptProcessed: (receipt: ReceiptData) => void
}

const modelOptions = [
  { 
    value: 'gemini', 
    label: 'Gemini', 
    icon: Sparkles, 
    description: '高精度・高速処理',
    color: 'text-blue-600'
  },
  { 
    value: 'gpt-4o', 
    label: 'GPT-4o', 
    icon: Brain, 
    description: '詳細な分析',
    color: 'text-emerald-600'
  },
  { 
    value: 'claude', 
    label: 'Claude', 
    icon: Zap, 
    description: '正確な認識',
    color: 'text-purple-600'
  },
]

export default function ReceiptUpload({ onReceiptProcessed }: ReceiptUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gemini')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp']
    },
    multiple: false
  })

  const selectedModelData = modelOptions.find(m => m.value === selectedModel)

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* モデル選択 */}
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">AIモデルを選択</h3>
          <p className="text-sm text-slate-600">用途に応じて最適なAIモデルをお選びください</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {modelOptions.map((model) => {
            const Icon = model.icon
            const isSelected = selectedModel === model.value
            
            return (
              <button
                key={model.value}
                onClick={() => setSelectedModel(model.value)}
                disabled={isProcessing}
                className={`card p-4 text-left transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-50/50 border-blue-200' 
                    : 'card-hover'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start space-x-3">
                  <Icon className={`${model.color} mt-0.5`} size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{model.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{model.description}</p>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ファイルアップロード */}
      <div
        {...getRootProps()}
        className={`upload-zone p-12 text-center cursor-pointer ${
          isDragActive ? 'upload-zone-active' : ''
        } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <div className="space-y-6 animate-scale-in">
            <div className="relative">
              <Loader2 className="mx-auto h-16 w-16 text-blue-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                {selectedModelData && (
                  <selectedModelData.icon className={`${selectedModelData.color} animate-pulse`} size={24} />
                )}
              </div>
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-900 mb-2">処理中...</p>
              <p className="text-slate-600">
                {selectedModelData?.label}でレシートを解析しています
              </p>
              <div className="mt-4 w-48 mx-auto bg-slate-200 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full animate-pulse" style={{width: '60%'}} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="relative">
              <Upload className={`mx-auto h-16 w-16 transition-colors duration-200 ${
                isDragActive ? 'text-blue-500 animate-float' : 'text-slate-400'
              }`} />
              {isDragActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 border-2 border-blue-500 border-dashed rounded-full animate-ping" />
                </div>
              )}
            </div>
            
            <div>
              <p className="text-xl font-semibold text-slate-900 mb-2">
                {isDragActive ? 'ファイルをドロップしてください' : 'レシート画像をアップロード'}
              </p>
              <p className="text-slate-600 mb-4">
                ドラッグ&ドロップまたはクリックしてファイルを選択
              </p>
              
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 rounded-full text-sm text-slate-600">
                <span>対応形式:</span>
                <span className="font-medium">JPEG, PNG, GIF, BMP</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}