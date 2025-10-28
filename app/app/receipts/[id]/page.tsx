import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getReceiptById } from '../../lib/database'

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
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">レシート詳細</h1>
            <p className="text-gray-500 text-sm">ID: {receipt.id}</p>
          </div>
          <Link
            href="/"
            className="text-teal-600 hover:text-teal-700 text-sm font-medium"
          >
            ← ダッシュボードへ戻る
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">基本情報</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-gray-500">店舗名</dt>
                <dd className="text-gray-900 font-medium">{receipt.store_name || '不明'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">アップロード者</dt>
                <dd className="text-gray-900 font-medium">{receipt.uploader || '不明'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">取引日</dt>
                <dd className="text-gray-900">{receipt.transaction_date || '不明'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">取引時間</dt>
                <dd className="text-gray-900">{receipt.transaction_time || '不明'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">支払方法</dt>
                <dd className="text-gray-900">{receipt.payment_method || '不明'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">レシート番号</dt>
                <dd className="text-gray-900">{receipt.receipt_number || '不明'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-gray-500">住所</dt>
                <dd className="text-gray-900">{receipt.store_address || '不明'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-gray-500">電話番号</dt>
                <dd className="text-gray-900">{receipt.store_phone || '不明'}</dd>
              </div>
            </dl>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">合計</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">小計</span>
                <span className="text-gray-900 font-medium">{totalFormatter.format(receipt.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">税額</span>
                <span className="text-gray-900 font-medium">{totalFormatter.format(receipt.tax || 0)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2">
                <span className="text-gray-500">合計</span>
                <span className="text-gray-900 font-semibold text-lg">{totalFormatter.format(receipt.total_amount || 0)}</span>
              </div>
            </div>
            {receipt.image_path && (
              <div className="relative w-full aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden">
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

        <section className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">購入商品</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品名</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリ</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">単価</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {receipt.items && receipt.items.length > 0 ? (
                  receipt.items.map((item, index) => (
                    <tr key={`${item.name}-${index}`}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.category || '未分類'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity ?? 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{totalFormatter.format(item.unit_price ?? 0)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{totalFormatter.format(item.total_price ?? 0)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={5}>
                      商品データが登録されていません。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
