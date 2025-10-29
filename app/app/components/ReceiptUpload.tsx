'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2, Sparkles, Brain, Zap, Paperclip, X, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { toast } from 'react-toastify'
import { ReceiptData } from '../types'

interface ReceiptUploadProps {
  onReceiptProcessed?: (receipt: ReceiptData) => void
  onUpload?: (files: File | File[]) => Promise<void> | void
}

interface FileProcessingStatus {
  file: File
  status: 'waiting' | 'processing' | 'completed' | 'error'
  result?: ReceiptData
  error?: string
  progress?: number
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

export default function ReceiptUpload({ onReceiptProcessed, onUpload }: ReceiptUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gemini/gemini-2.5-flash')
  const [selectedUploader, setSelectedUploader] = useState('夫')
  const [fileQueue, setFileQueue] = useState<FileProcessingStatus[]>([])
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(-1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const onUploadRef = useRef<ReceiptUploadProps['onUpload']>()

  useEffect(() => {
    onUploadRef.current = onUpload
  }, [onUpload])

  // 単一ファイル処理関数
  const processSingleFile = useCallback(async (file: File, index: number): Promise<ReceiptData> => {
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

    return await response.json()
  }, [selectedModel, selectedUploader])

  // 複数ファイルの順次処理
  const processFileQueue = useCallback(async (files: FileProcessingStatus[]) => {
    setIsProcessing(true)
    
    for (let i = 0; i < files.length; i++) {
      const fileStatus = files[i]
      
      // 現在処理中のファイルインデックスを更新
      setCurrentProcessingIndex(i)
      
      // ファイルステータスを「処理中」に更新
      setFileQueue(prev => prev.map((item, idx) => 
        idx === i ? { ...item, status: 'processing' as const } : item
      ))

      try {
        const result = await processSingleFile(fileStatus.file, i)
        
        // 成功時の処理
        setFileQueue(prev => prev.map((item, idx) => 
          idx === i ? { 
            ...item, 
            status: 'completed' as const, 
            result 
          } : item
        ))

        files[i] = {
          ...fileStatus,
          status: 'completed',
          result,
        }
        
        onReceiptProcessed?.(result)
        
      } catch (error) {
        console.error(`Error processing file ${fileStatus.file.name}:`, error)
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        // エラー時の処理
        setFileQueue(prev => prev.map((item, idx) => 
          idx === i ? { 
            ...item, 
            status: 'error' as const, 
            error: errorMessage
          } : item
        ))

        files[i] = {
          ...fileStatus,
          status: 'error',
          error: errorMessage,
        }
      }
    }
    
    setCurrentProcessingIndex(-1)
    setIsProcessing(false)
    
    // 処理完了の通知
    const completedCount = files.filter(f => f.status === 'completed').length
    const errorCount = files.filter(f => f.status === 'error').length
    const duplicateCount = files.filter(f => f.result?.duplicate).length
    const createdCount = completedCount - duplicateCount
    
    if (errorCount === 0) {
      if (completedCount === 0 && duplicateCount > 0) {
        toast.info(`${duplicateCount}件は既存のレシートとしてスキップしたよ📝`, {
          position: "top-center",
          autoClose: 4000,
        })
      } else if (duplicateCount > 0) {
        toast.success(`${createdCount}件を追加、${duplicateCount}件は既存レシートを再利用したよ✨`, {
          position: "top-center",
          autoClose: 4000,
        })
      } else {
        toast.success(`${completedCount}件のレシートを正常に処理しました！`, {
          position: "top-center",
          autoClose: 4000,
        })
      }
    } else {
      toast.warning(`${createdCount}件追加、${duplicateCount}件重複、${errorCount}件エラーがあったよ`, {
        position: "top-center",
        autoClose: 5000,
      })
    }
  }, [processSingleFile, onReceiptProcessed])

  // ファイル追加処理
  const addFilesToQueue = useCallback((newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} は画像ファイルではありません`, {
          position: "top-center",
          autoClose: 3000,
        })
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    const externalUpload = onUploadRef.current
    if (externalUpload) {
      void externalUpload(validFiles.length === 1 ? validFiles[0] : validFiles)
      return
    }

    const newFileStatuses: FileProcessingStatus[] = validFiles.map(file => ({
      file,
      status: 'waiting'
    }))

    setFileQueue(prev => [...prev, ...newFileStatuses])
    
    // 処理中でなければ自動的に処理開始
    if (!isProcessing) {
      processFileQueue([...fileQueue, ...newFileStatuses])
    }
  }, [fileQueue, isProcessing, processFileQueue])

  // キューをクリア
  const clearQueue = useCallback(() => {
    if (!isProcessing) {
      setFileQueue([])
    }
  }, [isProcessing])

  // 個別ファイルを削除
  const removeFileFromQueue = useCallback((index: number) => {
    if (!isProcessing) {
      setFileQueue(prev => prev.filter((_, idx) => idx !== index))
    }
  }, [isProcessing])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    addFilesToQueue(acceptedFiles)
  }, [addFilesToQueue])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      addFilesToQueue(Array.from(files))
    }
    // ファイル入力をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [addFilesToQueue])

  const handleFileButtonClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp']
    },
    multiple: true // 複数ファイル対応
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

      {/* ファイルキュー表示 */}
      {fileQueue.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">
              処理キュー ({fileQueue.length}件)
            </h3>
            {!isProcessing && (
              <button
                onClick={clearQueue}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                キューをクリア
              </button>
            )}
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {fileQueue.map((fileStatus, index) => (
              <div
                key={`${fileStatus.file.name}-${index}`}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  fileStatus.status === 'completed' && fileStatus.result?.duplicate
                    ? 'bg-amber-50 border-amber-200'
                    : fileStatus.status === 'completed'
                    ? 'bg-green-50 border-green-200'
                    : fileStatus.status === 'error'
                    ? 'bg-red-50 border-red-200'
                    : fileStatus.status === 'processing'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {fileStatus.status === 'waiting' && <Clock className="text-gray-400" size={20} />}
                  {fileStatus.status === 'processing' && <Loader2 className="text-blue-500 animate-spin" size={20} />}
                  {fileStatus.status === 'completed' && <CheckCircle className="text-green-500" size={20} />}
                  {fileStatus.status === 'error' && <AlertCircle className="text-red-500" size={20} />}
                  
                  <div>
                    <p className="font-medium text-gray-800">{fileStatus.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(fileStatus.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {fileStatus.error && (
                      <p className="text-sm text-red-600 mt-1">{fileStatus.error}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {fileStatus.status === 'waiting' && !isProcessing && (
                    <button
                      onClick={() => removeFileFromQueue(index)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                  
                  {fileStatus.status === 'processing' && (
                    <div className="text-sm font-medium text-blue-600">
                      処理中... ({index + 1}/{fileQueue.length})
                    </div>
                  )}
                  
                  {fileStatus.status === 'completed' && (
                    <div className="flex flex-col items-end gap-1 text-right">
                      <span className={`text-sm font-medium ${fileStatus.result?.duplicate ? 'text-amber-600' : 'text-green-600'}`}>
                        {fileStatus.result?.duplicate ? '既存レシート' : '完了'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-sumi-500">
                        <Sparkles size={12} className="text-indigo-500" />
                        {fileStatus.result?.model_used || 'gemini/gemini-2.5-flash'}
                      </span>
                      {fileStatus.result?.duplicate && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                          <Sparkles size={14} />
                          重複をスキップ
                        </span>
                      )}
                    </div>
                  )}
                  
                  {fileStatus.status === 'error' && (
                    <div className="text-sm font-medium text-red-600">エラー</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* 全体の進捗表示 */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>全体の進捗</span>
                <span>{currentProcessingIndex + 1} / {fileQueue.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentProcessingIndex + 1) / fileQueue.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

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
                  複数ファイルの同時アップロード・順次処理に対応
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
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
