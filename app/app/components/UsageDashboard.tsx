'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Calendar, DollarSign, ShoppingBag, Brain, Zap, Sparkles } from 'lucide-react'
import { ReceiptData } from '../types'

interface UsageDashboardProps {
  receipts: ReceiptData[]
}

interface UsageStats {
  totalReceipts: number
  totalAmount: number
  totalItems: number
  avgAmount: number
  monthlyData: { month: string; count: number; amount: number }[]
  categoryData: { category: string; count: number; amount: number }[]
  modelUsage: { model: string; count: number; percentage: number }[]
}

export default function UsageDashboard({ receipts }: UsageDashboardProps) {
  const [stats, setStats] = useState<UsageStats>({
    totalReceipts: 0,
    totalAmount: 0,
    totalItems: 0,
    avgAmount: 0,
    monthlyData: [],
    categoryData: [],
    modelUsage: []
  })

  useEffect(() => {
    calculateStats()
  }, [receipts])

  const calculateStats = () => {
    if (receipts.length === 0) {
      setStats({
        totalReceipts: 0,
        totalAmount: 0,
        totalItems: 0,
        avgAmount: 0,
        monthlyData: [],
        categoryData: [],
        modelUsage: []
      })
      return
    }

    const totalReceipts = receipts.length
    const totalAmount = receipts.reduce((sum, receipt) => sum + (receipt.total_amount || 0), 0)
    const totalItems = receipts.reduce((sum, receipt) => sum + (receipt.items?.length || 0), 0)
    const avgAmount = totalAmount / totalReceipts

    // 月別データ
    const monthlyMap = new Map<string, { count: number; amount: number }>()
    receipts.forEach(receipt => {
      if (receipt.transaction_date) {
        const month = receipt.transaction_date.substring(0, 7) // YYYY-MM
        const existing = monthlyMap.get(month) || { count: 0, amount: 0 }
        monthlyMap.set(month, {
          count: existing.count + 1,
          amount: existing.amount + (receipt.total_amount || 0)
        })
      }
    })

    const monthlyData = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // カテゴリ別データ
    const categoryMap = new Map<string, { count: number; amount: number }>()
    receipts.forEach(receipt => {
      receipt.items?.forEach(item => {
        const category = item.category || '未分類'
        const existing = categoryMap.get(category) || { count: 0, amount: 0 }
        categoryMap.set(category, {
          count: existing.count + 1,
          amount: existing.amount + (item.total_price || 0)
        })
      })
    })

    const categoryData = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5) // トップ5

    // モデル使用状況（仮想データ）
    const modelUsage = [
      { model: 'Gemini', count: Math.floor(totalReceipts * 0.6), percentage: 60 },
      { model: 'GPT-4o', count: Math.floor(totalReceipts * 0.25), percentage: 25 },
      { model: 'Claude', count: Math.floor(totalReceipts * 0.15), percentage: 15 }
    ]

    setStats({
      totalReceipts,
      totalAmount,
      totalItems,
      avgAmount,
      monthlyData,
      categoryData,
      modelUsage
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    return `${year}年${parseInt(month)}月`
  }

  const getModelIcon = (model: string) => {
    switch (model) {
      case 'Gemini': return <Sparkles className="text-indigo-600" size={18} />
      case 'GPT-4o': return <Brain className="text-matcha-600" size={18} />
      case 'Claude': return <Zap className="text-sakura-600" size={18} />
      default: return <Brain className="text-sumi-600" size={18} />
    }
  }

  return (
    <div className="space-y-12">
      {/* 概要統計 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="card p-8 card-hover">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl">
              <BarChart3 className="text-indigo-700" size={28} />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-sumi-600 font-medium tracking-wide">総レシート数</p>
              <p className="text-3xl font-bold wa-text-gradient">{stats.totalReceipts}</p>
            </div>
          </div>
        </div>

        <div className="card p-8 card-hover">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-matcha-100 to-matcha-200 rounded-2xl">
              <DollarSign className="text-matcha-700" size={28} />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-sumi-600 font-medium tracking-wide">総支出額</p>
              <p className="text-3xl font-bold wa-text-gradient">{formatCurrency(stats.totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="card p-8 card-hover">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-sakura-100 to-sakura-200 rounded-2xl">
              <ShoppingBag className="text-sakura-700" size={28} />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-sumi-600 font-medium tracking-wide">総商品数</p>
              <p className="text-3xl font-bold wa-text-gradient">{stats.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="card p-8 card-hover">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-gold-100 to-gold-200 rounded-2xl">
              <TrendingUp className="text-gold-700" size={28} />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-sumi-600 font-medium tracking-wide">平均支出額</p>
              <p className="text-3xl font-bold wa-text-gradient">{formatCurrency(stats.avgAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 月別推移 */}
      <div className="card p-8 card-hover">
        <h3 className="text-2xl font-bold wa-text-gradient mb-8 tracking-wide">月別推移</h3>
        {stats.monthlyData.length > 0 ? (
          <div className="space-y-6">
            {stats.monthlyData.map((data, index) => (
              <div key={data.month} className="flex items-center space-x-6">
                <div className="w-24 text-sm text-sumi-600 font-medium">
                  {formatMonth(data.month)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-sumi-700 font-medium">{data.count}件</span>
                    <span className="text-sm font-bold wa-text-gradient">
                      {formatCurrency(data.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-washi-300 rounded-full h-3">
                    <div
                      className="wa-gradient-primary h-3 rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min((data.amount / Math.max(...stats.monthlyData.map(d => d.amount))) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sumi-500 text-center py-12 text-lg">データがありません</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* カテゴリ別支出 */}
        <div className="card p-8 card-hover">
          <h3 className="text-2xl font-bold wa-text-gradient mb-8 tracking-wide">カテゴリ別支出（トップ5）</h3>
          {stats.categoryData.length > 0 ? (
            <div className="space-y-6">
              {stats.categoryData.map((data, index) => (
                <div key={data.category} className="flex items-center space-x-5">
                  <div className="w-5 h-5 rounded-full wa-gradient-accent" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-sumi-800 tracking-wide">{data.category}</span>
                      <span className="text-sm text-sumi-600 font-medium">{data.count}点</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="w-full bg-washi-300 rounded-full h-3 mr-4">
                        <div
                          className="wa-gradient-accent h-3 rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min((data.amount / Math.max(...stats.categoryData.map(d => d.amount))) * 100, 100)}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold wa-text-gradient whitespace-nowrap">
                        {formatCurrency(data.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sumi-500 text-center py-12 text-lg">データがありません</p>
          )}
        </div>

        {/* AIモデル使用状況 */}
        <div className="card p-8 card-hover">
          <h3 className="text-2xl font-bold wa-text-gradient mb-8 tracking-wide">AIモデル使用状況</h3>
          <div className="space-y-6">
            {stats.modelUsage.map((data, index) => (
              <div key={data.model} className="flex items-center space-x-5">
                <div className="p-2 bg-washi-200 rounded-xl">
                  {getModelIcon(data.model)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-sumi-800 tracking-wide">{data.model}</span>
                    <span className="text-sm text-sumi-600 font-medium">{data.count}回</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 bg-washi-300 rounded-full h-3">
                      <div
                        className="wa-gradient-warm h-3 rounded-full transition-all duration-700"
                        style={{ width: `${data.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold wa-text-gradient w-12 text-right">
                      {data.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}