export interface CategoryCatalogEntry {
  name: string
  subcategories: string[]
}

export const CATEGORY_CATALOG: CategoryCatalogEntry[] = [
  {
    name: '食品・飲料',
    subcategories: [
      '肉類',
      '魚介類',
      '野菜・果物',
      '乳製品',
      'パン・米・麺類',
      '調味料・スパイス',
      '冷凍食品',
      'お菓子・デザート',
      '飲み物',
      'アルコール',
      'その他',
    ],
  },
  {
    name: '日用品・雑貨',
    subcategories: [
      '洗剤・清掃用品',
      'トイレットペーパー・ティッシュ',
      'バス・ボディケア',
      'オーラルケア',
      '化粧品・スキンケア',
      '文房具',
      'キッチン用品',
      '雑貨・小物',
      'その他',
    ],
  },
  {
    name: '医薬品・健康',
    subcategories: ['医薬品', 'サプリメント', '医療用品', 'その他'],
  },
  {
    name: '衣類・ファッション',
    subcategories: ['衣類', '靴・靴下', 'アクセサリー', 'その他'],
  },
  {
    name: '家電・電子機器',
    subcategories: ['家電製品', '電子機器', '電池・充電器', 'その他'],
  },
  {
    name: '書籍・メディア',
    subcategories: ['書籍・雑誌', 'CD・DVD', 'その他'],
  },
  {
    name: '光熱費',
    subcategories: ['ガス料金', '電気料金', '水道料金', 'その他光熱費', 'その他'],
  },
  {
    name: '通信・サービス',
    subcategories: ['インターネット', '電話・携帯', 'サブスクリプション', 'その他'],
  },
  {
    name: '交通',
    subcategories: ['公共交通機関', 'タクシー・ライドシェア', 'ガソリン', '駐車場', 'その他'],
  },
  {
    name: '開発・個人プロジェクト',
    subcategories: [
      'ソフトウェア・サービス利用料',
      'ハードウェア・機材',
      'ケーブル・アクセサリ',
      '外注・委託費',
      '学習・イベント参加費',
      'その他',
    ],
  },
  {
    name: 'その他',
    subcategories: ['ギフト・プレゼント', 'ペット用品', '園芸用品', 'その他'],
  },
]

export const ALL_CATEGORIES = CATEGORY_CATALOG.map((entry) => entry.name)

export const getSubcategoriesForCategory = (category?: string): string[] => {
  if (!category) return []
  return CATEGORY_CATALOG.find((entry) => entry.name === category)?.subcategories ?? []
}
