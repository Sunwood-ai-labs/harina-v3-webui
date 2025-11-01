'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { AlertCircle, Loader2, RotateCcw, Save, Sparkles } from 'lucide-react'
import { ReceiptData, ReceiptItem } from '../../types'
import { getCategoryBadgeClasses, getCategoryLabel } from '../../utils/categoryStyles'
import { ALL_CATEGORIES, getSubcategoriesForCategory } from '../../utils/categoryCatalog'
import { buildReceiptDiffEntries, type ReceiptDiffEntry } from '../utils/receiptDiff'

interface ReceiptItemsTableProps {
  receiptId: number
  initialReceipt: ReceiptData
  items: ReceiptItem[]
}

type ItemRowState = ReceiptItem & {
  draftCategory: string
  draftSubcategory: string
  isSaving: boolean
}

const mapItemsToRows = (itemList: ReceiptItem[]): ItemRowState[] =>
  itemList.map(item => ({
    ...item,
    draftCategory: item.category ?? '',
    draftSubcategory: item.subcategory ?? '',
    isSaving: false,
  }))

export default function ReceiptItemsTable({ items, receiptId, initialReceipt }: ReceiptItemsTableProps) {
  const reprocessSteps = [
    {
      label: '画像を準備中',
      description: '過去のアップロード画像を引っ張ってくるよ',
    },
    {
      label: 'AIが解析中',
      description: 'HARINAが最新プロンプトで再読込してる〜',
    },
    {
      label: '結果を保存中',
      description: 'データベースに反映してUIを更新してるよ',
    },
  ]
  const stepDurations = [4, 9, 3] // seconds per step (rough estimate)
  const expectedTotalSeconds = stepDurations.reduce((sum, value) => sum + value, 0)
  const [rows, setRows] = useState<ItemRowState[]>(() => mapItemsToRows(items))
  const [bulkCategory, setBulkCategory] = useState('')
  const [bulkSubcategory, setBulkSubcategory] = useState('')
  const [isBulkSaving, setIsBulkSaving] = useState(false)
  const [isReprocessing, setIsReprocessing] = useState(false)
  const [isReprocessModalOpen, setIsReprocessModalOpen] = useState(false)
  const [reprocessStep, setReprocessStep] = useState(0)
  const [reprocessError, setReprocessError] = useState<string | null>(null)
  const [isReprocessComplete, setIsReprocessComplete] = useState(false)
  const [reprocessStartAt, setReprocessStartAt] = useState<number | null>(null)
  const [reprocessElapsedMs, setReprocessElapsedMs] = useState(0)
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptData>(initialReceipt)
  const [diffEntries, setDiffEntries] = useState<ReceiptDiffEntry[]>([])
  const router = useRouter()

  const elapsedSeconds = reprocessStartAt ? Math.max(0, reprocessElapsedMs / 1000) : 0

  const minimumProgress = reprocessSteps.length > 0
    ? Math.min(reprocessStep, reprocessSteps.length) / reprocessSteps.length
    : 0

  let progressValue = reprocessError ? 1 : minimumProgress
  if (!reprocessError && reprocessStartAt) {
    const cumulativeDurations = stepDurations.reduce<number[]>((acc, duration, index) => {
      const previous = acc[index - 1] ?? 0
      acc.push(previous + duration)
      return acc
    }, [])
    const currentStepIndex = Math.min(reprocessStep, reprocessSteps.length - 1)
    const completedSeconds = cumulativeDurations[currentStepIndex - 1] ?? 0
    const currentDuration = stepDurations[currentStepIndex] ?? stepDurations.at(-1) ?? 1
    const raw = (Math.min(elapsedSeconds, completedSeconds + currentDuration)) / expectedTotalSeconds
    progressValue = Math.max(minimumProgress, Math.min(1, raw))
  }

  const progressPercent = Math.round(progressValue * 100)
  const remainingSeconds = reprocessError
    ? 0
    : Math.max(0, Math.ceil(expectedTotalSeconds - elapsedSeconds))

useEffect(() => {
  if (!isReprocessModalOpen) {
    setReprocessElapsedMs(0)
    return
  }

    const interval = window.setInterval(() => {
      setReprocessElapsedMs(reprocessStartAt ? Date.now() - reprocessStartAt : 0)
    }, 300)

    return () => {
      window.clearInterval(interval)
    }
}, [isReprocessModalOpen, reprocessStartAt])

useEffect(() => {
  setCurrentReceipt(initialReceipt)
  setRows(mapItemsToRows(initialReceipt.items ?? items))
}, [initialReceipt, items])

  const suggestedCategories = useMemo(() => {
    const set = new Set<string>(ALL_CATEGORIES)
    items.forEach(item => {
      if (item.category) {
        set.add(item.category)
      }
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ja'))
  }, [items])
  const bulkSubcategoryOptions = useMemo(() => {
    if (!bulkCategory) return []
    return getSubcategoriesForCategory(bulkCategory)
  }, [bulkCategory])

  const updateRow = (id: number | undefined, updater: (row: ItemRowState) => ItemRowState) => {
    if (!id) return
    setRows(prev => prev.map(row => (row.id === id ? updater(row) : row)))
  }

  const handleCategoryChange = (id: number | undefined, category: string) => {
    updateRow(id, row => {
      const availableSubcategories = getSubcategoriesForCategory(category)
      const nextSubcategory = availableSubcategories.includes(row.draftSubcategory) ? row.draftSubcategory : ''
      return {
        ...row,
        draftCategory: category,
        draftSubcategory: nextSubcategory,
      }
    })
  }

  const handleSubcategoryChange = (id: number | undefined, subcategory: string) => {
    updateRow(id, row => ({
      ...row,
      draftSubcategory: subcategory,
    }))
  }

  const handleReset = (id: number | undefined) => {
    updateRow(id, row => ({
      ...row,
      draftCategory: row.category ?? '',
      draftSubcategory: row.subcategory ?? '',
    }))
  }

  const persistRowUpdate = async (row: ItemRowState) => {
    if (!row.id) {
      throw new Error('IDの無いレコードは更新できません')
    }
    const trimmedCategory = row.draftCategory.trim()
    const trimmedSubcategory = row.draftSubcategory.trim()
    const payload: { category?: string | null; subcategory?: string | null } = {}
    if (trimmedCategory !== (row.category ?? '')) {
      payload.category = trimmedCategory || null
    }
    if (trimmedSubcategory !== (row.subcategory ?? '')) {
      payload.subcategory = trimmedSubcategory || null
    }
    if (Object.keys(payload).length === 0) {
      return null
    }

    const response = await fetch(`/api/receipt-items/${row.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => null)
      throw new Error(error?.error || '更新に失敗しました')
    }

    const updated: ReceiptItem = await response.json()
    return updated
  }

  const handleSave = async (id: number | undefined) => {
    if (!id) return

    const row = rows.find(r => r.id === id)
    if (!row) return

    const trimmedCategory = row.draftCategory.trim()
    const trimmedSubcategory = row.draftSubcategory.trim()

    const isCategoryChanged = trimmedCategory !== (row.category ?? '')
    const isSubcategoryChanged = trimmedSubcategory !== (row.subcategory ?? '')

    if (!isCategoryChanged && !isSubcategoryChanged) {
      toast.info('変更はありません')
      return
    }

    setRows(prev =>
      prev.map(r => (r.id === id ? { ...r, isSaving: true } : r))
    )

    try {
      const updated = await persistRowUpdate(row)

      if (!updated) {
        setRows(prev =>
          prev.map(r => (r.id === id ? { ...r, isSaving: false } : r))
        )
        toast.info('変更はありません')
        return
      }
      setRows(prev =>
        prev.map(r =>
          r.id === id
            ? {
                ...r,
                category: updated.category,
                subcategory: updated.subcategory,
                draftCategory: updated.category ?? '',
                draftSubcategory: updated.subcategory ?? '',
                isSaving: false,
              }
            : r
        )
      )

      toast.success('カテゴリを更新しました')
    } catch (error) {
      console.error('Failed to update receipt item category:', error)
      toast.error(
        error instanceof Error ? error.message : 'カテゴリの更新に失敗しました'
      )
      setRows(prev =>
        prev.map(r => (r.id === id ? { ...r, isSaving: false } : r))
      )
    }
  }

  const handleBulkCategorySelection = (value: string) => {
    setBulkCategory(value)
    if (!value) {
      setBulkSubcategory('')
      return
    }
    const options = getSubcategoriesForCategory(value)
    if (!options.includes(bulkSubcategory)) {
      setBulkSubcategory('')
    }
  }

  const handleBulkApply = () => {
    if (!bulkCategory) {
      toast.warn('カテゴリを選択してください')
      return
    }
    const availableSubcategories = getSubcategoriesForCategory(bulkCategory)
    const subcategoryToApply =
      bulkSubcategory && availableSubcategories.includes(bulkSubcategory)
        ? bulkSubcategory
        : ''

    setRows(prev =>
      prev.map(row => ({
        ...row,
        draftCategory: bulkCategory,
        draftSubcategory: subcategoryToApply,
      }))
    )
    toast.success('全ての商品にカテゴリを適用しました')
  }

  const handleBulkSave = async () => {
    const dirtyRows = rows.filter(
      row =>
        row.id &&
        (row.draftCategory.trim() !== (row.category ?? '') ||
          row.draftSubcategory.trim() !== (row.subcategory ?? ''))
    )

    if (dirtyRows.length === 0) {
      toast.info('保存対象がありません')
      return
    }

    const dirtyIds = new Set(dirtyRows.map(row => row.id as number))
    setIsBulkSaving(true)
    setRows(prev =>
      prev.map(row =>
        row.id && dirtyIds.has(row.id) ? { ...row, isSaving: true } : row
      )
    )

    try {
      for (const row of dirtyRows) {
        const updated = await persistRowUpdate(row)
        if (updated) {
          setRows(prev =>
            prev.map(r =>
              r.id === row.id
                ? {
                    ...r,
                    category: updated.category,
                    subcategory: updated.subcategory,
                    draftCategory: updated.category ?? '',
                    draftSubcategory: updated.subcategory ?? '',
                    isSaving: false,
                  }
                : r
            )
          )
        } else {
          setRows(prev =>
            prev.map(r => (r.id === row.id ? { ...r, isSaving: false } : r))
          )
        }
      }
      toast.success('カテゴリを一括更新しました')
    } catch (error) {
      console.error('Failed to bulk update receipt items:', error)
      toast.error(
        error instanceof Error ? error.message : '一括更新に失敗しました'
      )
      setRows(prev =>
        prev.map(row =>
          row.id && dirtyIds.has(row.id) ? { ...row, isSaving: false } : row
        )
      )
    } finally {
      setIsBulkSaving(false)
    }
  }

  const handleRefreshRows = (updatedItems: ReceiptItem[]) => {
    setRows(mapItemsToRows(updatedItems))
  }

  const handleReprocess = async () => {
    const advanceStep = (step: number) => setReprocessStep(step)
    setDiffEntries([])
    setIsReprocessComplete(false)
    setReprocessError(null)
    setIsReprocessModalOpen(true)
    advanceStep(0)
    setReprocessStartAt(Date.now())
    setIsReprocessing(true)
    try {
      advanceStep(1)
      const response = await fetch(`/api/receipts/${receiptId}/reprocess`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.error || 'レシートの再解析に失敗しました')
      }

      advanceStep(2)
      const result = await response.json()
      const refreshedReceipt: ReceiptData | undefined = result?.receipt

      const previousReceipt = currentReceipt
      if (refreshedReceipt?.items) {
        handleRefreshRows(refreshedReceipt.items)
      }
      if (refreshedReceipt) {
        setCurrentReceipt(refreshedReceipt)
        const diffs = buildReceiptDiffEntries(previousReceipt, refreshedReceipt)
        setDiffEntries(diffs)
      } else {
        setDiffEntries([])
      }
      setIsReprocessComplete(true)

      toast.success('レシートを再解析したよ！最新のAI結果を反映したからチェックしてね💖')
      router.refresh()
    } catch (error) {
      console.error('Failed to reprocess receipt:', error)
      const message = error instanceof Error ? error.message : 'レシートの再解析に失敗しました'
      setReprocessError(message)
      toast.error(message)
      setDiffEntries([])
      setIsReprocessComplete(false)
    } finally {
      setIsReprocessing(false)
    }
  }

  const handleModalClose = () => {
    if (isReprocessing && !reprocessError) {
      return
    }
    setIsReprocessModalOpen(false)
    setReprocessError(null)
    setDiffEntries([])
    setIsReprocessComplete(false)
    setReprocessElapsedMs(0)
    setReprocessStartAt(null)
    setReprocessStep(0)
  }

  if (rows.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-sumi-500">
        商品データが登録されていません。
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      {isReprocessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl border border-washi-300 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-sumi-500">AI Reprocess</p>
                <h3 className="text-xl font-bold text-sumi-900">レシートを再解析中…</h3>
                <div className="mt-2 space-y-1 text-sm text-sumi-500">
                  <p>ちょっと待ってね！最新ロジックで帳尻合わせ中だよ。</p>
                  {!reprocessError && (
                    <p className="text-xs text-sumi-400">
                      進捗 {progressPercent}% ・推定残り {remainingSeconds} 秒
                    </p>
                  )}
                  {reprocessError && (
                    <p className="text-xs text-rose-500">エラーが発生したので途中でストップしたよ</p>
                  )}
                </div>
              </div>
              <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                {reprocessError ? <AlertCircle className="h-6 w-6" /> : <Sparkles className="h-6 w-6 animate-pulse" />}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-washi-200">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${reprocessError ? 'bg-rose-500' : 'bg-indigo-500'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <ul className="space-y-2">
                {reprocessSteps.map((step, index) => {
                  const isActive = index === reprocessStep && !reprocessError
                  const isDone = index < reprocessStep && !reprocessError
                  const isError = reprocessError && index === reprocessStep
                  return (
                    <li
                      key={step.label}
                      className={`rounded-2xl border px-3 py-2 text-sm ${
                        isError
                          ? 'border-rose-200 bg-rose-50 text-rose-600'
                          : isActive
                          ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                          : isDone
                          ? 'border-teal-200 bg-teal-50 text-teal-700'
                          : 'border-washi-200 bg-washi-100 text-sumi-500'
                      }`}
                    >
                      <p className="font-semibold">{step.label}</p>
                      <p className="text-xs">{step.description}</p>
                    </li>
                  )
                })}
              </ul>

              {isReprocessComplete && (
                <div className="rounded-2xl border border-teal-200 bg-teal-50/60 px-3 py-3">
                  <p className="text-xs font-semibold text-teal-700">差分プレビュー</p>
                  {diffEntries.length > 0 ? (
                    <ul className="mt-2 space-y-2">
                      {diffEntries.map(diff => (
                        <li key={diff.label} className="rounded-xl bg-white px-3 py-2 text-xs text-sumi-600 shadow-sm">
                          <p className="font-semibold text-sumi-700">{diff.label}</p>
                          <div className="mt-1 grid grid-cols-2 gap-2 text-[11px]">
                            <div className="rounded-lg border border-washi-200 bg-washi-100 px-2 py-1">
                              <span className="block text-[10px] font-semibold text-sumi-500">Before</span>
                              <span className="block text-sumi-700">{diff.before}</span>
                            </div>
                            <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1">
                              <span className="block text-[10px] font-semibold text-indigo-500">After</span>
                              <span className="block text-indigo-700">{diff.after}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-sumi-500">変更点はありませんでした。</p>
                  )}
                </div>
              )}

              {reprocessError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
                  {reprocessError}
                </div>
              ) : (
                <p className="text-xs text-sumi-400">
                  解析が終わったら変更点をチェックして閉じてね！
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleModalClose}
                  disabled={isReprocessing && !reprocessError}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-washi-300 bg-white px-4 py-2 text-sm font-semibold text-sumi-600 hover:bg-washi-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {(isReprocessing && !reprocessError) ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      解析中…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      閉じる
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3 px-4 pb-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="bulk-category" className="text-xs font-semibold text-sumi-500">
              カテゴリ一括適用
            </label>
            <select
              id="bulk-category"
              value={bulkCategory}
              onChange={event => handleBulkCategorySelection(event.target.value)}
              className="min-w-[160px] rounded-xl border border-washi-300 px-3 py-2 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
            >
              <option value="">選択してください</option>
              {suggestedCategories.map(option => (
                <option key={`bulk-${option}`} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="bulk-subcategory" className="text-xs font-semibold text-sumi-500">
              サブカテゴリ
            </label>
            <select
              id="bulk-subcategory"
              value={bulkSubcategory}
              onChange={event => setBulkSubcategory(event.target.value)}
              className="min-w-[160px] rounded-xl border border-washi-300 px-3 py-2 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
              disabled={!bulkCategory}
            >
              <option value="">選択なし</option>
              {bulkSubcategoryOptions.map(option => (
                <option key={`bulk-sub-${option}`} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleBulkApply}
            className="inline-flex items-center gap-2 rounded-xl border border-washi-300 bg-white px-4 py-2 text-sm font-semibold text-sumi-600 hover:bg-washi-100"
          >
            すべてに適用
          </button>
          <button
            type="button"
            onClick={handleBulkSave}
            disabled={isBulkSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBulkSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
            一括保存
          </button>
          <button
            type="button"
            onClick={handleReprocess}
            disabled={isBulkSaving || isReprocessing}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isReprocessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles size={16} />}
            AI再解析
          </button>
        </div>
      </div>
      <table className="min-w-full divide-y divide-washi-200">
        <thead className="bg-washi-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-sumi-500 uppercase tracking-wide">商品名</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-sumi-500 uppercase tracking-wide">カテゴリ</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-sumi-500 uppercase tracking-wide">サブカテゴリ</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-sumi-500 uppercase tracking-wide">数量</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-sumi-500 uppercase tracking-wide">単価</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-sumi-500 uppercase tracking-wide">金額</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-sumi-500 uppercase tracking-wide">操作</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-washi-100">
          {rows.map(row => {
            const isDirty =
              row.draftCategory.trim() !== (row.category ?? '') ||
              row.draftSubcategory.trim() !== (row.subcategory ?? '')

            const badgeClasses = getCategoryBadgeClasses(
              row.draftCategory.trim() || row.category
            )

            return (
              <tr key={row.id ?? `${row.name}-${row.quantity ?? 0}`}>
                <td className="px-4 py-3 text-sm text-sumi-900 font-medium">
                  {row.name}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-col gap-2">
                    <select
                      value={row.draftCategory}
                      onChange={event => handleCategoryChange(row.id, event.target.value)}
                      className="w-full rounded-xl border border-washi-300 px-3 py-2 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                    >
                      <option value="">カテゴリを選択</option>
                      {suggestedCategories.map(option => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${badgeClasses}`}>
                      <span className="inline-block h-2 w-2 rounded-full bg-current opacity-80" />
                      {getCategoryLabel(row.draftCategory || row.category)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <select
                    value={row.draftSubcategory}
                    onChange={event => handleSubcategoryChange(row.id, event.target.value)}
                    className="w-full rounded-xl border border-washi-300 px-3 py-2 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                    disabled={!row.draftCategory}
                  >
                    <option value="">
                      {row.draftCategory ? 'サブカテゴリを選択' : 'カテゴリを選択してください'}
                    </option>
                    {(() => {
                      const options = getSubcategoriesForCategory(row.draftCategory)
                      const uniqueOptions = new Set(options)
                      if (row.draftSubcategory && !uniqueOptions.has(row.draftSubcategory)) {
                        uniqueOptions.add(row.draftSubcategory)
                      }
                      return Array.from(uniqueOptions)
                    })().map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-sm text-sumi-900 text-right">{row.quantity ?? 1}</td>
                <td className="px-4 py-3 text-sm text-sumi-900 text-right">
                  ¥{(row.unit_price ?? 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-sumi-900 text-right">
                  ¥{(row.total_price ?? 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleReset(row.id)}
                      disabled={row.isSaving || !isDirty}
                      className="inline-flex items-center gap-1 rounded-xl border border-washi-300 px-3 py-2 text-xs text-sumi-600 hover:bg-washi-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <RotateCcw size={14} />
                      リセット
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave(row.id)}
                      disabled={row.isSaving || !isDirty}
                      className="inline-flex items-center gap-1 rounded-xl bg-teal-500 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {row.isSaving ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      保存
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
