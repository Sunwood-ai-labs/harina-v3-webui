'use client'

import { useState, useEffect } from 'react'
import { Camera, Activity, Sparkles, Upload, Image as ImageIcon, BarChart3, X } from 'lucide-react'
import ReceiptUpload from './components/ReceiptUpload'
import ReceiptDisplay from './components/ReceiptDisplay'
import CameraCapture from './components/CameraCapture'
import PhotoGallery from './components/PhotoGallery'
import UsageDashboard from './components/UsageDashboard'
import { ReceiptData } from './types'

// ヘッダーコンポーネント
const Header = ({ healthStatus }: { healthStatus: string }) => {
  return (
    <header className="bg-slate-800 text-white px-6 py-4 fixed top-0 left-0 right-0 z-50">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <span className="text-xl font-semibold">HARINA WEBUI</span>
        </div>
        
        {/* ステータスインジケーター */}
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            healthStatus === 'healthy' ? 'bg-green-500 animate-pulse' : 
            healthStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
          }`} />
          <Activity size={16} className="text-gray-300" />
          <span className="text-sm text-gray-300 font-medium hidden sm:inline">Status:</span>
          <span className={`text-sm font-bold ${
            healthStatus === 'healthy' ? 'text-green-400' : 
            healthStatus === 'error' ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {healthStatus === 'healthy' ? 'Online' : 
             healthStatus === 'error' ? 'Offline' : 'Checking...'}
          </span>
        </div>
      </div>
    </header>
  )
}

// サイドバーナビゲーション（デスクトップ用）
const SidebarNavigation = ({ activeTab, setActiveTab }: { 
  activeTab: TabType, 
  setActiveTab: (tab: TabType) => void 
}) => {
  const navItems = [
    { id: 'gallery' as TabType, label: 'Home', icon: ImageIcon },
    { id: 'camera' as TabType, label: 'Capture', icon: Camera },
    { id: 'dashboard' as TabType, label: 'Analytics', icon: BarChart3 },
    { id: 'upload' as TabType, label: 'Profile', icon: Upload },
  ]

  return (
    <nav className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 p-6 z-40">
      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                isActive
                  ? 'text-slate-800 bg-slate-100 font-medium'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// 下部タブナビゲーション（モバイル用）
const BottomNavigation = ({ activeTab, setActiveTab }: { 
  activeTab: TabType, 
  setActiveTab: (tab: TabType) => void 
}) => {
  const navItems = [
    { id: 'gallery' as TabType, label: 'Home', icon: ImageIcon },
    { id: 'camera' as TabType, label: 'Capture', icon: Camera },
    { id: 'dashboard' as TabType, label: 'Analytics', icon: BarChart3 },
    { id: 'upload' as TabType, label: 'Profile', icon: Upload },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 lg:hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-slate-800 bg-gray-100'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={24} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}



type TabType = 'upload' | 'camera' | 'gallery' | 'dashboard' | 'detail'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('gallery')
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
      },
      {
        id: 3,
        filename: 'receipt_003.jpg',
        store_name: 'Rocurt',
        store_address: '東京都新宿区3-3-3',
        transaction_date: '16,23,2029',
        transaction_time: '12:45',
        total_amount: 1520,
        items: [
          { name: 'パン', category: '食品・飲料', total_price: 300 },
          { name: 'ミルク', category: '食品・飲料', total_price: 220 }
        ],
        processed_at: '2025-01-18T12:50:00Z'
      },
      {
        id: 4,
        filename: 'receipt_004.jpg',
        store_name: 'Recent',
        store_address: '東京都渋谷区4-4-4',
        transaction_date: '12,20,2029',
        transaction_time: '16:20',
        total_amount: 3450,
        items: [
          { name: '肉類', category: '食品・飲料', total_price: 2000 },
          { name: '野菜', category: '食品・飲料', total_price: 800 }
        ],
        processed_at: '2025-01-17T16:25:00Z'
      },
      {
        id: 5,
        filename: 'receipt_005.jpg',
        store_name: 'Coss',
        store_address: '東京都港区5-5-5',
        transaction_date: '3F/20,2024',
        transaction_time: '11:30',
        total_amount: 103099,
        items: [
          { name: '電子機器', category: '家電', total_price: 98000 },
          { name: 'アクセサリー', category: '雑貨', total_price: 5099 }
        ],
        processed_at: '2025-01-16T11:35:00Z'
      },
      {
        id: 6,
        filename: 'receipt_006.jpg',
        store_name: 'Tech Store',
        store_address: '東京都品川区6-6-6',
        transaction_date: '15,1,2025',
        transaction_time: '14:15',
        total_amount: 2890,
        items: [
          { name: 'ケーブル', category: '家電', total_price: 1500 },
          { name: 'バッテリー', category: '家電', total_price: 1390 }
        ],
        processed_at: '2025-01-15T14:20:00Z'
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
      case 'gallery':
        return (
          <div className="pb-20 lg:pb-8">
            {/* カテゴリタブ */}
            <div className="flex space-x-1 mb-6 bg-slate-800 rounded-full p-1 overflow-x-auto">
              {['Stories', 'Groceries', 'Transport', 'Utilities'].map((category, index) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    index === 0 
                      ? 'bg-slate-700 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* レシートカードグリッド */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 mb-6">
              {receipts.map((receipt, index) => (
                <div
                  key={receipt.id || index}
                  onClick={() => handleReceiptSelect(receipt)}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      index % 4 === 0 ? 'bg-red-100' :
                      index % 4 === 1 ? 'bg-blue-100' :
                      index % 4 === 2 ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      <div className={`w-4 h-4 rounded ${
                        index % 4 === 0 ? 'bg-red-500' :
                        index % 4 === 1 ? 'bg-blue-500' :
                        index % 4 === 2 ? 'bg-green-500' : 'bg-orange-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {receipt.store_name || 'Unknown Store'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {receipt.transaction_date || 'No date'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ¥{receipt.total_amount?.toLocaleString() || '0'}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">
                      {receipt.items?.length || 0} items
                    </span>
                    <div className="flex space-x-1">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <ImageIcon size={14} className="text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <BarChart3 size={14} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* スキャンボタン */}
            <button
              onClick={() => setShowCamera(true)}
              className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 bg-slate-800 text-white px-6 py-3 rounded-full shadow-lg hover:bg-slate-700 transition-colors flex items-center space-x-2 z-40"
            >
              <Camera size={20} />
              <span className="font-medium hidden sm:inline">Scan receipt</span>
              <span className="font-medium sm:hidden">Scan</span>
            </button>
          </div>
        )
      
      case 'camera':
        return (
          <div className="pb-20 lg:pb-8 text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Capture Receipt
              </h2>
              <p className="text-gray-600">
                Take a photo of your receipt to automatically extract information
              </p>
            </div>
            
            <button
              onClick={() => setShowCamera(true)}
              className="bg-slate-800 text-white px-8 py-4 rounded-2xl hover:bg-slate-700 transition-colors flex items-center space-x-3 mx-auto"
            >
              <Camera size={24} />
              <span className="font-medium">Start Camera</span>
            </button>
          </div>
        )
      
      case 'dashboard':
        return (
          <div className="pb-20 lg:pb-8">
            <UsageDashboard receipts={receipts} />
          </div>
        )
      
      case 'upload':
        return (
          <div className="pb-20 lg:pb-8">
            <div className="text-center space-y-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Upload Receipt
              </h2>
              <p className="text-gray-600">
                Select an image file to process with AI
              </p>
            </div>
            <ReceiptUpload onReceiptProcessed={handleReceiptProcessed} />
          </div>
        )
      
      case 'detail':
        return currentReceipt ? (
          <div className="pb-20 lg:pb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Receipt Details</h2>
              <button
                onClick={() => setActiveTab('gallery')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X size={20} />
                <span>Close</span>
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
    <div className="min-h-screen bg-gray-50">
      <Header healthStatus={healthStatus} />
      
      <div className="pt-16 flex">
        <SidebarNavigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
        
        <main className="flex-1 lg:ml-64 px-4 py-6 min-h-screen">
          <div className="w-full max-w-md lg:max-w-none mx-auto lg:mx-0 animate-fade-in">
            {renderTabContent()}
          </div>
        </main>
      </div>

      <BottomNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

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