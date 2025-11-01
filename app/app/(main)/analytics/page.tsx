'use client'

import { Fragment, type ChangeEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { BarChart3, Loader2, PieChart, RefreshCcw, Trophy, Users } from 'lucide-react'
import type {
  AnalyticsMonthlySummary,
  AnalyticsSummaryResponse,
  AnalyticsYearlySummary,
} from '../../types'
import { MonthlySpendChart } from '../../components/analytics/MonthlySpendChart'
import { TopCategoryChart } from '../../components/analytics/TopCategoryChart'

const currency = (value: number) => `¥${Math.round(value).toLocaleString('ja-JP')}`

const analyticsFetch = async (year?: number, signal?: AbortSignal): Promise<AnalyticsSummaryResponse> => {
  const query = typeof year === 'number' ? `?year=${year}` : ''
  const response = await fetch(`/api/analytics/summary${query}`, {
    method: 'GET',
    signal,
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('分析データの取得に失敗しました')
  }

  return (await response.json()) as AnalyticsSummaryResponse
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummaryResponse | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedUploaders, setSelectedUploaders] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const resolvedYear = selectedYear ?? summary?.selectedYear ?? new Date().getFullYear()

  const fetchSummary = useCallback(
    async (year?: number) => {
      setIsLoading(!summary)
      setIsRefreshing(true)
      setError(null)

      try {
        const data = await analyticsFetch(year)
        setSummary(data)
        setSelectedYear(data.selectedYear)
        setSelectedUploaders([])
      } catch (cause) {
        if ((cause as Error).name !== 'AbortError') {
          console.error(cause)
          setError((cause as Error).message)
        }
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [summary]
  )

  useEffect(() => {
    void fetchSummary()
  }, [fetchSummary])

  useEffect(() => {
    if (selectedYear !== null && summary && selectedYear !== summary.selectedYear) {
      void fetchSummary(selectedYear)
    }
  }, [selectedYear, summary, fetchSummary])

  const selectedYearSummary = useMemo<AnalyticsYearlySummary | null>(() => {
    if (!summary) return null
    return summary.yearly.find((entry) => entry.year === resolvedYear) ?? null
  }, [summary, resolvedYear])

  const monthlyData = useMemo<AnalyticsMonthlySummary[]>(() => {
    if (!summary) return []
    return summary.monthly.filter((entry) => entry.year === resolvedYear)
  }, [summary, resolvedYear])

  const availableUploaders = useMemo(() => {
    if (!selectedYearSummary) return []
    return selectedYearSummary.uploaderBreakdown.map((entry) => entry.uploader)
  }, [selectedYearSummary])

  const topOverall = summary?.overallTopCategories ?? []
  const topByUploader = summary?.topCategoriesByUploader ?? []

  const totalAmount = selectedYearSummary?.totalAmount ?? 0
  const totalReceipts = selectedYearSummary?.receiptCount ?? 0
  const activeUploader = selectedYearSummary?.uploaderBreakdown[0]
  const activeCategory = topOverall[0]
  const activeMonths = monthlyData.length || 1
  const averageMonthly = totalAmount / activeMonths

  const handleUploaderToggle = (uploader: string) => {
    setSelectedUploaders((prev) => {
      if (prev.includes(uploader)) {
        return prev.filter((item) => item !== uploader)
      }
      return [...prev, uploader]
    })
  }

  const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const year = Number(event.target.value)
    setSelectedYear(Number.isFinite(year) ? year : null)
  }

  const isUploaderActive = (uploader: string) =>
    selectedUploaders.length === 0 || selectedUploaders.includes(uploader)

  return (
    <div className="min-h-screen bg-washi-100 px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-sumi-900">分析・レポート</h1>
            <p className="text-sumi-500 text-sm">
              年次・月次・カテゴリ別に「誰が何に使ったか」をぱっと可視化するよ。気になるアップロード者だけ絞り込んで、家計の傾向をまるっと把握しちゃお。
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fetchSummary(resolvedYear)}
            className="inline-flex items-center gap-2 rounded-xl border border-washi-300 bg-white px-4 py-2 text-sm font-semibold text-sumi-600 hover:bg-washi-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isRefreshing}
          >
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw size={16} />}
            {isRefreshing ? '更新中…' : '最新データに更新'}
          </button>
        </div>
        {error && (
          <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </header>

      <section className="rounded-3xl border border-washi-300 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label htmlFor="analytics-year" className="text-xs font-semibold text-sumi-500 uppercase tracking-wide">
              集計年
            </label>
            <select
              id="analytics-year"
              value={resolvedYear}
              onChange={handleYearChange}
              className="rounded-2xl border border-washi-300 bg-washi-50 px-4 py-2 text-sm font-semibold text-sumi-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              {(summary?.availableYears ?? [resolvedYear]).map((yearOption) => (
                <option key={yearOption} value={yearOption}>
                  {yearOption}年
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <span className="text-xs font-semibold text-sumi-500 uppercase tracking-wide">アップロード者フィルター</span>
            <div className="flex flex-wrap gap-2">
              {availableUploaders.length === 0 && (
                <span className="rounded-xl border border-dashed border-washi-300 px-3 py-2 text-xs text-sumi-400">
                  データを読み込み中…
                </span>
              )}
              {availableUploaders.map((uploader) => {
                const active = isUploaderActive(uploader)
                return (
                  <button
                    key={uploader}
                    type="button"
                    onClick={() => handleUploaderToggle(uploader)}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition-colors ${
                      active
                        ? 'border-teal-400 bg-teal-50 text-teal-700'
                        : 'border-washi-300 bg-white text-sumi-500 hover:border-teal-200'
                    }`}
                  >
                    <span className="text-base">{uploader === '夫' ? '🤵' : uploader === '嫁' ? '👰' : '👤'}</span>
                    {uploader}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-washi-300 bg-white py-24 text-sumi-500 shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          <p className="mt-3 text-sm">分析データを集計中…ちょっと待っててね！</p>
        </div>
      ) : summary ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<BarChart3 className="text-teal-600" size={20} />}
            title="年間支出合計"
            value={currency(totalAmount)}
            subText={`${resolvedYear}年 / ${totalReceipts.toLocaleString()} 件`}
          />
          <SummaryCard
            icon={<PieChart className="text-indigo-500" size={20} />}
            title="月平均支出"
            value={currency(averageMonthly)}
            subText={`${activeMonths}ヶ月ベース`}
          />
            <SummaryCard
              icon={<Users className="text-sakura-500" size={20} />}
              title="トップアップロード者"
              value={activeUploader ? `${activeUploader.uploader} — ${currency(activeUploader.totalAmount)}` : 'データなし'}
              subText={activeUploader ? `${activeUploader.categories[0]?.category ?? '未分類'} が最多カテゴリ` : '—'}
            />
          <SummaryCard
            icon={<Trophy className="text-gold-500" size={20} />}
            title="人気カテゴリ"
            value={activeCategory ? `${activeCategory.category} — ${currency(activeCategory.totalAmount)}` : 'データなし'}
            subText={activeCategory ? `${activeCategory.receiptCount.toLocaleString()} 件` : '—'}
          />
          </section>

          <section className="grid gap-6 lg:grid-cols-[2.2fr_1fr]">
            <div className="rounded-3xl border border-washi-300 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-sumi-900">月別×アップロード者の支出</h2>
                  <p className="text-xs text-sumi-500">選択した年の月別推移。ボタンでアップロード者をオン・オフできるよ。</p>
                </div>
              </div>
              <div className="mt-4">
                <MonthlySpendChart data={monthlyData} selectedUploaders={selectedUploaders} />
              </div>
            </div>

            <div className="rounded-3xl border border-washi-300 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-sumi-900 mb-4">カテゴリTOP5 (全体)</h2>
              {topOverall.length > 0 ? (
                <TopCategoryChart categories={topOverall} />
              ) : (
                <p className="text-xs text-sumi-500">まだカテゴリデータがありません。</p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-washi-300 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-sumi-900">アップロード者別カテゴリ内訳</h2>
                <p className="text-xs text-sumi-500">金額の大きい順にカテゴリを表示。ギュッと支出のクセを掴もう。</p>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-washi-200 text-sm">
                <thead className="bg-washi-100">
                  <tr className="text-xs uppercase tracking-wide text-sumi-500">
                    <th className="px-4 py-3 text-left">アップロード者</th>
                    <th className="px-4 py-3 text-left">カテゴリ</th>
                    <th className="px-4 py-3 text-right">金額</th>
                    <th className="px-4 py-3 text-right">レシート数</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-washi-100 bg-white">
                  {selectedYearSummary?.uploaderBreakdown.map((uploader) => (
                    <Fragment key={uploader.uploader}>
                      {uploader.categories.map((category, index) => (
                        <tr key={`${uploader.uploader}-${category.category}`} className="hover:bg-washi-50/80">
                          {index === 0 && (
                            <td className="px-4 py-3 align-top font-semibold text-sumi-900" rowSpan={uploader.categories.length}>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{uploader.uploader === '夫' ? '🤵' : uploader.uploader === '嫁' ? '👰' : '👤'}</span>
                                <div>
                                  <p>{uploader.uploader}</p>
                                  <p className="text-xs text-sumi-500">合計 {currency(uploader.totalAmount)}</p>
                                </div>
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-3 text-sumi-700">{category.category}</td>
                          <td className="px-4 py-3 text-right font-semibold text-sumi-900">{currency(category.totalAmount)}</td>
                          <td className="px-4 py-3 text-right text-sumi-600">{category.receiptCount.toLocaleString()} 件</td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-3xl border border-washi-300 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-sumi-900 mb-4">アップロード者別カテゴリTOP5</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {availableUploaders.map((uploader) => (
                <div key={`top-${uploader}`} className="rounded-2xl border border-washi-200 bg-washi-50/60 p-4">
                  <p className="text-sm font-semibold text-sumi-700 mb-2 flex items-center gap-2">
                    <span className="text-lg">{uploader === '夫' ? '🤵' : uploader === '嫁' ? '👰' : '👤'}</span>
                    {uploader}
                  </p>
                  {(() => {
                    const categories = topByUploader.filter((entry) => entry.uploader === uploader)
                    if (categories.length === 0) {
                      return <p className="text-xs text-sumi-500">まだカテゴリデータがありません。</p>
                    }
                    return <TopCategoryChart categories={categories} />
                  })()}
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="rounded-3xl border border-washi-300 bg-white px-6 py-12 text-center text-sumi-500 shadow-sm">
          データがまだ登録されていません。レシートをアップロードすると、ここで分析できるようになります。
        </div>
      )}
    </div>
  )
}

interface SummaryCardProps {
  icon: ReactNode
  title: string
  value: string
  subText?: string
}

function SummaryCard({ icon, title, value, subText }: SummaryCardProps) {
  return (
    <article className="rounded-3xl border border-washi-300 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-washi-100 text-lg">
          {icon}
        </span>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-sumi-500">{title}</p>
          <p className="text-xl font-bold text-sumi-900">{value}</p>
          {subText && <p className="text-xs text-sumi-500">{subText}</p>}
        </div>
      </div>
    </article>
  )
}
