export interface CategoryStyle {
  bg: string
  text: string
  border: string
}

const FALLBACK_STYLE: CategoryStyle = {
  bg: 'bg-zinc-100',
  text: 'text-zinc-700',
  border: 'border-zinc-200',
}

const PALETTE_TOKENS: CategoryStyle[] = [
  { bg: 'bg-matcha-50', text: 'text-matcha-700', border: 'border-matcha-200' },
  { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  { bg: 'bg-sakura-50', text: 'text-sakura-700', border: 'border-sakura-200' },
  { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200' },
  { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200' },
  { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
]

const CATEGORY_PRIORITIES: Record<string, number> = {
  '食品・飲料': 0,
  '外食': 14,
  'レストラン': 14,
  'カフェ': 14,
  'ファストフード': 14,
  'テイクアウト・デリバリー': 14,
  'テイクアウト': 14,
  'デリバリー': 14,
  '日用品・雑貨': 1,
  '医薬品・健康': 2,
  '衣類・ファッション': 3,
  '家電・電子機器': 4,
  '書籍・メディア': 5,
  '光熱費': 6,
  '通信・サービス': 7,
  '交通': 8,
  '開発・個人プロジェクト': 9,
  '割引': 10,
  'その他': 11,
  'エンタメ': 12,
  '娯楽': 12,
  '教育': 13,
  '学習': 13,
  '医療': 2,
  'ヘルスケア': 2,
  'ギフト': 11,
  'ギフト・プレゼント': 11,
  'ペット用品': 11,
  '園芸用品': 11,
  'ファッション': 3,
  '光熱費・公共料金': 6,
  '通信': 7,
  'インターネット': 7,
  '電話・携帯': 7,
  'ソフトウェア': 9,
  '学習・イベント参加費': 9,
  '値引き': 10,
  'クーポン': 10,
  'ポイント利用': 10,
  '公共交通機関': 8,
  'タクシー・ライドシェア': 8,
  'ガソリン': 8,
  '駐車場': 8,
  'エネルギー': 6,
  '家賃': 6,
  '住居': 6,
  '生活用品': 1,
  '食料品': 0,
  '食品': 0,
}

const computedAssignments = new Map<string, number>()

const normalizeCategory = (category?: string): string | undefined => {
  if (!category) return undefined
  const trimmed = category.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const hashCategory = (category: string): number => {
  let hash = 0
  for (let i = 0; i < category.length; i += 1) {
    hash = (hash * 33 + category.charCodeAt(i)) >>> 0
  }
  return hash
}

const getPaletteIndex = (category: string): number => {
  if (CATEGORY_PRIORITIES[category] !== undefined) {
    return CATEGORY_PRIORITIES[category] % PALETTE_TOKENS.length
  }

  const cachedIndex = computedAssignments.get(category)
  if (cachedIndex !== undefined) {
    return cachedIndex
  }

  const hashedIndex = hashCategory(category) % PALETTE_TOKENS.length
  computedAssignments.set(category, hashedIndex)
  return hashedIndex
}

export const getCategoryStyle = (category?: string): CategoryStyle => {
  const normalized = normalizeCategory(category)
  if (!normalized) {
    return FALLBACK_STYLE
  }

  const palette = PALETTE_TOKENS[getPaletteIndex(normalized)]
  return palette ?? FALLBACK_STYLE
}

export const getCategoryBadgeClasses = (category?: string): string => {
  const palette = getCategoryStyle(category)
  return `${palette.bg} ${palette.text} border ${palette.border}`
}

export const getCategoryLabel = (category?: string): string => {
  const normalized = normalizeCategory(category)
  return normalized ?? '未分類'
}
