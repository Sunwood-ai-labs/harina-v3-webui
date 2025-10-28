'use client'

import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Loader2, RotateCcw, Save } from 'lucide-react'
import { ReceiptItem } from '../../types'
import { getCategoryBadgeClasses, getCategoryLabel } from '../../utils/categoryStyles'
import { ALL_CATEGORIES, CATEGORY_CATALOG, getSubcategoriesForCategory } from '../../utils/categoryCatalog'

interface ReceiptItemsTableProps {
  items: ReceiptItem[]
}

type ItemRowState = ReceiptItem & {
  draftCategory: string
  draftSubcategory: string
  isSaving: boolean
}

export default function ReceiptItemsTable({ items }: ReceiptItemsTableProps) {
  const [rows, setRows] = useState<ItemRowState[]>(() =>
    items.map(item => ({
      ...item,
      draftCategory: item.category ?? '',
      draftSubcategory: item.subcategory ?? '',
      isSaving: false,
    }))
  )

  const suggestedCategories = useMemo(() => {
    const set = new Set<string>(ALL_CATEGORIES)
    items.forEach(item => {
      if (item.category) {
        set.add(item.category)
      }
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ja'))
  }, [items])

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
      const response = await fetch(`/api/receipt-items/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: isCategoryChanged ? trimmedCategory || null : undefined,
          subcategory: isSubcategoryChanged ? trimmedSubcategory || null : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error || '更新に失敗しました')
      }

      const updated: ReceiptItem = await response.json()

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

  if (rows.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-sumi-500">
        商品データが登録されていません。
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
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
