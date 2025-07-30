'use client'

import { Activity, Sparkles } from 'lucide-react'

interface HeaderProps {
  healthStatus: string
}

export default function Header({ healthStatus }: HeaderProps) {
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
          <div className={`w-3 h-3 rounded-full ${healthStatus === 'healthy' ? 'bg-green-500 animate-pulse' :
              healthStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
            }`} />
          <Activity size={16} className="text-gray-300" />
          <span className="text-sm text-gray-300 font-medium hidden sm:inline">Status:</span>
          <span className={`text-sm font-bold ${healthStatus === 'healthy' ? 'text-green-400' :
              healthStatus === 'error' ? 'text-red-400' : 'text-yellow-400'
            }`}>
            {healthStatus === 'healthy' ? 'Online' : healthStatus === 'error' ? 'Offline' : 'Checking...'}
          </span>
        </div>
      </div>
    </header>
  )
}