'use client'

import { useState, useEffect } from 'react'
import { Camera, Activity, Sparkles, Upload, Image as ImageIcon, BarChart3, X } from 'lucide-react'
import ReceiptUpload from './components/ReceiptUpload'
import ReceiptDisplay from './components/ReceiptDisplay'
import CameraCapture from './components/CameraCapture'
import PhotoGallery from './components/PhotoGallery'
import UsageDashboard from './components/UsageDashboard'
import { ReceiptData } from './types'

// 和風ナビゲーションコンポーネント
const Navigation = ({ activeTab, setActiveTab, healthStatus }: { 
  activeTab: TabType, 
  setActiveTab: (tab: TabType) => void,
  healthStatus: string 
}) => {
  const navItems = [
    { id: 'upload' as TabType, label: 'アップロード', icon: Upload },
    { id: 'camera' as TabType, label: '撮影', icon: Camera },
    { id: 'gallery' as TabType, label: 'ギャラリー', icon: ImageIcon },
    { id: 'dashboard' as TabType, label: 'ダッシュボード', icon: BarChart3 },
  ]

  return (
    <nav className="border-0 rounded-none wa-shadow-soft backdrop-blur-md bg-washi-50/95 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <div className="relative p-2 bg-gradient-to-br from-indigo-100 to-matcha-100 rounded-2xl">
              <Camera className="text-indigo-700" size={24} />
              <Sparkles className="absolute -top-1 -right-1 text-matcha-600" size={10} />
            </div>
            <div>
              <span className="text-2xl font-bold wa-text-gradient tracking-wide">
                レシート和
              </span>
              <p className="text-xs text-sumi-500 -mt-1">Receipt Wa</p>
            </div>
          </div>
          
          {/* タブナビゲーション */}
          {activeTab !== 'detail' && (
            <div className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      isActive
                        ? 'wa-gradient-primary text-washi-50 wa-shadow-medium'
                        : 'text-sumi-600 hover:text-sumi-800 hover:bg-washi-100/80'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm tracking-wide">{item.label}</span>
                  </button>
                )
              })}
            </div>
          )}
          
          {/* ステータスインジケーター */}
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              healthStatus === 'healthy' ? 'bg-matcha-500 animate-pulse' : 
              healthStatus === 'error' ? 'bg-sakura-500' : 'bg-gold-500 animate-pulse'
            }`} />
            <Activity size={16} className="text-sumi-500" />
            <span className="text-sm text-sumi-600 font-medium">システム:</span>
            <span className={`text-sm font-bold tracking-wide ${
              healthStatus === 'healthy' ? 'text-matcha-600' : 
              healthStatus === 'error' ? 'text-sakura-600' : 'text-gold-600'
            }`}>
              {healthStatus === 'healthy' ? '正常' : 
               healthStatus === 'error' ? '停止中' : '確認中...'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}



type TabType = 'upload' | 'camera' | 'gallery' | 'dashboard' | 'detail'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('upload')
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptData | null>(null)
  const [receipts, setReceipts] = useState<ReceiptData[]>([])
  const [healthStatus, setHealthStatus] = useState<string>('checking')
  const [showCamera, setShowCamera] = useState(false)

  useEffect(() => {
    // ヘルスチェック
    fetch('/api/health')
      .then(() => setHealthStatus('healthy'))
      .catch(() => setHealthStatus('error'))
    
    // サンプルデータを追加（実際の実装では、APIから取得）
    const sampleReceipts: ReceiptData[] = [
      {
        id: 1,
        filename: 'receipt_001.jpg',
        store_name: 'スーパーマーケットA',
        store_address: '東京都渋谷区1-1-1',
        transaction_date: '2025-01-20',
        transaction_time: '14:30',
        total_amount: 2580,
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
        store_name: 'コンビニB',
        store_address: '東京都新宿区2-2-2',
        transaction_date: '2025-01-19',
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
  }, [])

  const handleReceiptProcessed = (receipt: ReceiptData) => {
    const newReceipt = { ...receipt, id: receipts.length + 1 }
    setReceipts(prev => [newReceipt, ...prev])
    setCurrentReceipt(newReceipt)
    setActiveTab('detail')
  }

  const handleCameraCapture = (file: File) => {
    // カメラで撮影されたファイルを処理
    const formData = new FormData()
    formData.append('file', file)
    formData.append('model', 'gemini')

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

  const handleReceiptDelete = (receiptId: number) => {
    setReceipts(prev => prev.filter(r => r.id !== receiptId))
  }



  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <div className="max-w-3xl mx-auto">
            <div className="text-center space-y-8 mb-12">
              <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-indigo-50 to-matcha-50 text-indigo-700 rounded-2xl text-sm font-medium wa-shadow-soft">
                <Sparkles size={18} />
                <span className="tracking-wide">AI搭載レシート認識システム</span>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl font-bold wa-text-gradient">
                  レシートをアップロード
                </h2>
                
                <p className="text-sumi-600 text-lg leading-relaxed">
                  画像を選択して、AIが自動でレシート情報を読み取ります
                </p>
              </div>
            </div>
            <ReceiptUpload onReceiptProcessed={handleReceiptProcessed} />
          </div>
        )
      
      case 'camera':
        return (
          <div className="max-w-3xl mx-auto text-center space-y-12">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-matcha-50 to-indigo-50 text-matcha-700 rounded-2xl text-sm font-medium wa-shadow-soft">
                <Camera size={18} />
                <span className="tracking-wide">カメラ撮影モード</span>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl font-bold wa-text-gradient">
                  レシートを撮影
                </h2>
                
                <p className="text-sumi-600 text-lg leading-relaxed">
                  カメラでレシートを直接撮影して、瞬時に情報を取得
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowCamera(true)}
              className="btn-primary text-lg px-12 py-5 rounded-2xl"
            >
              <Camera size={28} className="mr-4" />
              <span className="tracking-wide">カメラを起動</span>
            </button>
          </div>
        )
      
      case 'gallery':
        return (
          <PhotoGallery 
            receipts={receipts}
            onReceiptSelect={handleReceiptSelect}
            onReceiptDelete={handleReceiptDelete}
          />
        )
      
      case 'dashboard':
        return <UsageDashboard receipts={receipts} />
      
      case 'detail':
        return currentReceipt ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">レシート詳細</h2>
              <button
                onClick={() => setActiveTab('gallery')}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
                <span>閉じる</span>
              </button>
            </div>
            <ReceiptDisplay receipt={currentReceipt} />
          </div>
        ) : null
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        healthStatus={healthStatus} 
      />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* タブコンテンツ */}
          <div className="animate-fade-in">
            {renderTabContent()}
          </div>
        </div>
      </main>

      {/* カメラモーダル */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  )
}