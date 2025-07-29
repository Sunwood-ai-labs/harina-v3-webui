'use client'

import { useState, useEffect } from 'react'
import { Camera, List, Home as HomeIcon, Activity, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ReceiptUpload from './components/ReceiptUpload'
import ReceiptDisplay from './components/ReceiptDisplay'
import { ReceiptData } from './types'

// ナビゲーションコンポーネント
const Navigation = () => {
  const pathname = usePathname()

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'ホーム' },
    { path: '/receipts', icon: List, label: '履歴' },
  ]

  return (
    <nav className="card border-0 rounded-none shadow-sm backdrop-blur-md bg-white/90 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Camera className="text-blue-600" size={28} />
              <Sparkles className="absolute -top-1 -right-1 text-blue-400" size={12} />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Receipt AI
            </span>
          </div>
          
          <div className="flex space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

// ステータスインジケーター
const StatusIndicator = ({ status }: { status: string }) => (
  <div className="flex items-center justify-center">
    <div className="card px-4 py-2 card-hover">
      <div className="flex items-center space-x-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${
          status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 
          status === 'error' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'
        }`} />
        <Activity size={14} className="text-slate-500" />
        <span className="text-slate-600">API Status:</span>
        <span className={`font-medium ${
          status === 'healthy' ? 'text-emerald-600' : 
          status === 'error' ? 'text-red-600' : 'text-amber-600'
        }`}>
          {status === 'healthy' ? 'Online' : 
           status === 'error' ? 'Offline' : 'Checking...'}
        </span>
      </div>
    </div>
  </div>
)

export default function Home() {
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptData | null>(null)
  const [healthStatus, setHealthStatus] = useState<string>('checking')

  useEffect(() => {
    // ヘルスチェック
    fetch('/api/health')
      .then(() => setHealthStatus('healthy'))
      .catch(() => setHealthStatus('error'))
  }, [])

  const handleReceiptProcessed = (receipt: ReceiptData) => {
    setCurrentReceipt(receipt)
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-8">
          <StatusIndicator status={healthStatus} />

          {!currentReceipt ? (
            <div className="text-center space-y-12 animate-fade-in">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  <Sparkles size={16} />
                  <span>AI-Powered Receipt Recognition</span>
                </div>
                
                <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent leading-tight">
                  レシート認識
                  <br />
                  <span className="text-4xl">アプリ</span>
                </h1>
                
                <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  最新のAI技術でレシートを瞬時に認識し、
                  <br />
                  データを自動で整理・保存します
                </p>
              </div>
              
              <ReceiptUpload onReceiptProcessed={handleReceiptProcessed} />
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center">
                <button
                  onClick={() => setCurrentReceipt(null)}
                  className="btn-primary"
                >
                  新しいレシートをアップロード
                </button>
              </div>
              <ReceiptDisplay receipt={currentReceipt} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}