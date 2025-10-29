import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, Download, MapPin, Phone, Store, Wallet } from 'lucide-react'
import { getReceiptById } from '../../lib/database'
import ReceiptItemsTable from './ReceiptItemsTable'

interface ReceiptDetailPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ReceiptDetailPageProps): Promise<Metadata> {
  const id = Number(params.id)

  if (!Number.isFinite(id) || id <= 0) {
    return {
      title: 'レシートが見つかりません'
    }
  }

  const receipt = await getReceiptById(id)

  if (!receipt) {
    return {
      title: 'レシートが見つかりません'
    }
  }

  return {
    title: `${receipt.store_name || 'レシート'} | HARINA Receipt`
  }
}

export default async function ReceiptDetailPage({ params }: ReceiptDetailPageProps) {
  const id = Number(params.id)

  if (!Number.isFinite(id) || id <= 0) {
    notFound()
  }

  const receipt = await getReceiptById(id)

  if (!receipt) {
    notFound()
  }

  const totalFormatter = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY'
  })

  return (
    <main className="min-h-screen bg-washi-100 text-sumi-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex flex-wrap items-center gap-2 text-sm text-sumi-500 mb-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-washi-200 text-sumi-700 border border-washi-300">
                ID: {receipt.id}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                {receipt.uploader || 'アップローダー不明'}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {receipt.model_used || 'gemini/gemini-2.5-flash'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-sumi-900 tracking-tight">
              レシート詳細
            </h1>
            <p className="text-sumi-500 text-sm mt-1">
              {receipt.transaction_date} {receipt.transaction_time}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/api/receipts/${receipt.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-washi-300 text-sumi-600 hover:text-teal-600 hover:border-teal-200 transition-colors"
            >
              <Download size={16} />
              JSONを確認
            </Link>
            <Link
              href="/receipts"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 text-white shadow-sm hover:bg-teal-600 transition-colors"
            >
              <ChevronLeft size={16} />
              レシート一覧へ戻る
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <section className="bg-white/90 backdrop-blur-sm border border-washi-300 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-50 text-teal-600">
                <Store size={26} />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-sumi-900">
                  {receipt.store_name || '店舗名不明'}
                </h2>
                <p className="text-sm text-sumi-500">{receipt.payment_method || '支払方法不明'}</p>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-2xl bg-washi-100 border border-washi-300">
                <dt className="text-sumi-500 text-xs uppercase tracking-wide">アップロード者</dt>
                <dd className="mt-1 text-sumi-900 font-medium">{receipt.uploader || '不明'}</dd>
              </div>
              <div className="p-4 rounded-2xl bg-washi-100 border border-washi-300">
                <dt className="text-sumi-500 text-xs uppercase tracking-wide">レシート番号</dt>
                <dd className="mt-1 text-sumi-900 font-medium">{receipt.receipt_number || '未設定'}</dd>
              </div>
              <div className="p-4 rounded-2xl bg-washi-100 border border-washi-300">
                <dt className="text-sumi-500 text-xs uppercase tracking-wide">使用モデル</dt>
                <dd className="mt-1 text-sumi-900 font-medium">{receipt.model_used || 'gemini/gemini-2.5-flash'}</dd>
              </div>
              <div className="p-4 rounded-2xl bg-washi-100 border border-washi-300">
                <dt className="text-sumi-500 text-xs uppercase tracking-wide">店舗住所</dt>
                <dd className="mt-1 text-sumi-900 font-medium inline-flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 text-teal-500" />
                  <span>{receipt.store_address || '住所不明'}</span>
                </dd>
              </div>
              <div className="p-4 rounded-2xl bg-washi-100 border border-washi-300">
                <dt className="text-sumi-500 text-xs uppercase tracking-wide">電話番号</dt>
                <dd className="mt-1 text-sumi-900 font-medium inline-flex items-center gap-2">
                  <Phone size={14} className="text-teal-500" />
                  <span>{receipt.store_phone || '不明'}</span>
                </dd>
              </div>
            </dl>
          </section>

          <section className="bg-white/90 backdrop-blur-sm border border-washi-300 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-sumi-900 mb-1">支払サマリー</h2>
                <p className="text-xs text-sumi-500">取引日時: {receipt.transaction_date || '不明'} {receipt.transaction_time}</p>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-sm">
                <Wallet size={16} /> {receipt.payment_method || '不明'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center p-3 rounded-2xl bg-washi-100 border border-washi-300 text-sm">
                <span className="text-sumi-500">小計</span>
                <span className="text-sumi-900 font-semibold">{totalFormatter.format(receipt.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-2xl bg-washi-100 border border-washi-300 text-sm">
                <span className="text-sumi-500">税額</span>
                <span className="text-sumi-900 font-semibold">{totalFormatter.format(receipt.tax || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-matcha-50 border border-matcha-300 text-base font-bold text-matcha-900">
                <span>合計</span>
                <span>{totalFormatter.format(receipt.total_amount || 0)}</span>
              </div>
            </div>

            {receipt.image_path && (
              <div className="relative w-full aspect-[3/4] bg-washi-200 border border-washi-400 rounded-3xl overflow-hidden">
                <Image
                  src={receipt.image_path}
                  alt="レシート画像"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
          </section>
        </div>

        <section className="bg-white/95 backdrop-blur-sm border border-washi-300 rounded-3xl shadow-sm">
          <div className="px-6 py-4 border-b border-washi-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-sumi-900">購入商品</h2>
            <span className="text-sm text-sumi-500">{receipt.items?.length || 0} 件</span>
          </div>
          <ReceiptItemsTable items={receipt.items ?? []} />
        </section>
      </div>
    </main>
  )
}
