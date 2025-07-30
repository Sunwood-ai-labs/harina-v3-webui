'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import CameraCapture from './components/CameraCapture'
import UsageDashboard from './components/UsageDashboard'
import Header from './components/Header'
import { SidebarNavigation, BottomNavigation, TabType } from './components/Navigation'
import GalleryView from './components/views/GalleryView'
import CameraView from './components/views/CameraView'
import UploadView from './components/views/UploadView'
import DetailView from './components/views/DetailView'
import { ReceiptData } from './types'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('gallery')
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptData | null>(null)
  const [receipts, setReceipts] = useState<ReceiptData[]>([])
  const [healthStatus, setHealthStatus] = useState<string>('checking')
  const [showCamera, setShowCamera] = useState(false)
  const [selectedUploader, setSelectedUploader] = useState('夫')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // ヘルスチェック
    fetch('/api/health')
      .then(() => setHealthStatus('healthy'))
      .catch(() => setHealthStatus('error'))

    // データベースからレシート一覧を取得
    fetchReceipts()
  }, [])

  const fetchReceipts = async () => {
    try {
      const response = await fetch('/api/receipts')
      if (response.ok) {
        const receiptsData = await response.json()
        setReceipts(receiptsData)
        console.log(`📋 Loaded ${receiptsData.length} receipts from database`)
      } else {
        console.error('Failed to fetch receipts from database')
        // フォールバック：サンプルデータを使用
        loadSampleData()
      }
    } catch (error) {
      console.error('Error fetching receipts:', error)
      // フォールバック：サンプルデータを使用
      loadSampleData()
    }
  }

  const loadSampleData = () => {
    // サンプルデータ（データベース接続に失敗した場合のフォールバック）
    const sampleReceipts: ReceiptData[] = [
      {
        id: 1,
        filename: 'receipt_001.jpg',
        store_name: 'Merchant',
        store_address: '東京都渋谷区1-1-1',
        transaction_date: '20/2/23,2022',
        transaction_time: '14:30',
        total_amount: 11327,
        items: [
          { name: '牛肉', category: '食品・飲料', total_price: 1200 },
          { name: '野菜セット', category: '食品・飲料', total_price: 680 },
          { name: '調味料', category: '食品・飲料', total_price: 700 }
        ],
        processed_at: '2025-01-20T14:35:00Z'
      },
      {
        id: 2,
        filename: 'receipt_002.jpg',
        store_name: 'Mogurt',
        store_address: '東京都新宿区2-2-2',
        transaction_date: '13,4,2039',
        transaction_time: '09:15',
        total_amount: 890,
        items: [
          { name: 'おにぎり', category: '食品・飲料', total_price: 150 },
          { name: 'コーヒー', category: '食品・飲料', total_price: 120 },
          { name: '雑誌', category: '書籍・雑誌', total_price: 620 }
        ],
        processed_at: '2025-01-19T09:20:00Z'
      }
    ]
    setReceipts(sampleReceipts)
  }

  const handleReceiptProcessed = (receipt: ReceiptData) => {
    // データベースに保存されたレシートをリストに追加
    setReceipts(prev => [receipt, ...prev])
    setCurrentReceipt(receipt)
    setActiveTab('detail')
  }

  const handleCameraCapture = (file: File) => {
    // カメラで撮影されたファイルを処理
    const formData = new FormData()
    formData.append('file', file)
    formData.append('model', 'gemini/gemini-2.5-flash')
    formData.append('uploader', selectedUploader)

    fetch('/api/process-receipt', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(result => {
        handleReceiptProcessed(result)
      })
      .catch(error => {
        console.error('Error processing camera capture:', error)
      })

    setShowCamera(false)
  }

  const handleReceiptSelect = (receipt: ReceiptData) => {
    setCurrentReceipt(receipt)
    setActiveTab('detail')
  }



  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const file = files[0]
      const formData = new FormData()
      formData.append('file', file)
      formData.append('model', 'gemini/gemini-2.5-flash')
      formData.append('uploader', selectedUploader)

      try {
        const response = await fetch('/api/process-receipt', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          handleReceiptProcessed(result)
        }
      } catch (error) {
        console.error('Error processing file upload:', error)
      }
    }

    // ファイル入力をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [selectedUploader])

  const handleFileButtonClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'gallery':
        return (
          <GalleryView
            receipts={receipts}
            selectedUploader={selectedUploader}
            setSelectedUploader={setSelectedUploader}
            onReceiptSelect={handleReceiptSelect}
            onCameraClick={() => setShowCamera(true)}
            onFileClick={handleFileButtonClick}
          />
        )

      case 'camera':
        return (
          <CameraView
            selectedUploader={selectedUploader}
            setSelectedUploader={setSelectedUploader}
            onCameraStart={() => setShowCamera(true)}
          />
        )

      case 'dashboard':
        return (
          <div className="pb-20 lg:pb-8">
            <UsageDashboard receipts={receipts} />
          </div>
        )

      case 'upload':
        return (
          <UploadView onReceiptProcessed={handleReceiptProcessed} />
        )

      case 'detail':
        return (
          <DetailView
            receipt={currentReceipt}
            onClose={() => setActiveTab('gallery')}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header healthStatus={healthStatus} />

      <div className="pt-16 flex">
        <SidebarNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 lg:ml-64 px-4 py-6 min-h-screen">
          <div className="w-full max-w-md lg:max-w-none mx-auto lg:mx-0 animate-fade-in">
            {renderTabContent()}
          </div>
        </main>
      </div>

      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* カメラモーダル */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}