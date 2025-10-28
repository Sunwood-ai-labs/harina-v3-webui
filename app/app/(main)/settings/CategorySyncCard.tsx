'use client'

import { useState } from 'react'
import { Loader2, RefreshCcw } from 'lucide-react'
import { toast } from 'react-toastify'

export default function CategorySyncCard() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/settings/refresh-categories', {
        method: 'POST',
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.error || 'カテゴリの更新に失敗しました')
      }

      const result = await response.json()
      const categoryCount = result.categories ?? '—'
      const subcategoryCount = result.subcategories ?? '—'

      toast.success(`カテゴリ情報を再同期しました（カテゴリ: ${categoryCount} / サブカテゴリ: ${subcategoryCount}）`)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'カテゴリの更新に失敗しました')
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <section className="rounded-3xl border border-washi-300 bg-white shadow-sm p-6 space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-sumi-900">カテゴリマスター更新</h2>
        <p className="text-sm text-sumi-600">
          HARINA サーバーのカテゴリとサブカテゴリを最新の XML 定義で再同期します。新しい分類を追加したときはこのボタンで更新してね。
        </p>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw size={16} />}
          {isRefreshing ? '更新中…' : 'カテゴリを再同期'}
        </button>
      </div>
    </section>
  )
}
