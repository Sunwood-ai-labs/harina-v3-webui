'use client'

import { Camera, Upload, Image as ImageIcon, BarChart3 } from 'lucide-react'

export type TabType = 'upload' | 'camera' | 'gallery' | 'dashboard' | 'detail'

interface NavigationProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

const navItems = [
  { id: 'gallery' as TabType, label: 'Home', icon: ImageIcon },
  { id: 'camera' as TabType, label: 'Capture', icon: Camera },
  { id: 'dashboard' as TabType, label: 'Analytics', icon: BarChart3 },
  { id: 'upload' as TabType, label: 'Profile', icon: Upload },
]

// サイドバーナビゲーション（デスクトップ用）
export function SidebarNavigation({ activeTab, setActiveTab }: NavigationProps) {
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
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${isActive
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
export function BottomNavigation({ activeTab, setActiveTab }: NavigationProps) {
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
                className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
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