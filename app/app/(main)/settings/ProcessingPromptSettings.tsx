'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, RotateCcw, Save } from 'lucide-react'
import { toast } from 'react-toastify'

export default function ProcessingPromptSettings() {
  const [prompt, setPrompt] = useState('')
  const [initialPrompt, setInitialPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const isDirty = useMemo(
    () => prompt.trim() !== initialPrompt.trim(),
    [prompt, initialPrompt]
  )

  useEffect(() => {
    let mounted = true

    const loadPrompt = async () => {
      try {
        const response = await fetch('/api/settings/processing-prompt')

        if (!response.ok) {
          throw new Error('追加プロンプトの取得に失敗しました')
        }

        const data = await response.json()
        if (!mounted) return
        setPrompt(data.prompt ?? '')
        setInitialPrompt(data.prompt ?? '')
      } catch (error) {
        console.error(error)
        toast.error(
          error instanceof Error
            ? error.message
            : '追加プロンプトの取得に失敗しました'
        )
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    void loadPrompt()

    return () => {
      mounted = false
    }
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/settings/processing-prompt', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || '追加プロンプトの更新に失敗しました')
      }

      const data = await response.json()
      setPrompt(data.prompt ?? '')
      setInitialPrompt(data.prompt ?? '')
      toast.success('追加プロンプトを保存しました')
    } catch (error) {
      console.error(error)
      toast.error(
        error instanceof Error
          ? error.message
          : '追加プロンプトの更新に失敗しました'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setPrompt(initialPrompt)
  }

  return (
    <section className="rounded-3xl border border-washi-300 bg-white shadow-sm p-6 space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-sumi-900">追加プロンプト</h2>
        <p className="text-sm text-sumi-600">
          HARINA へ渡すシステムプロンプトに追記したい指示を入力してください。
          1行に1つのルールを記載できます（例: 「ガス会社は光熱費にして」）。
        </p>
      </div>

      <div>
        <label htmlFor="processing-prompt" className="sr-only">
          追加プロンプト
        </label>
        <textarea
          id="processing-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          disabled={isLoading || isSaving}
          rows={8}
          placeholder="例: ガス会社は光熱費にして"
          className="w-full rounded-2xl border border-washi-300 bg-washi-50 px-4 py-3 text-sm text-sumi-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading || isSaving || !isDirty}
          className="inline-flex items-center gap-2 rounded-xl border border-washi-300 px-4 py-2 text-sm text-sumi-600 hover:bg-washi-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw size={16} />
          リセット
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading || isSaving || !isDirty}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          保存
        </button>
      </div>
    </section>
  )
}
