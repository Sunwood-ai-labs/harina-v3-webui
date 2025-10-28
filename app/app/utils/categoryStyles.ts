export interface CategoryStyle {
  bg: string;
  text: string;
  border: string;
}

const FALLBACK_STYLE: CategoryStyle = {
  bg: "bg-washi-200",
  text: "text-sumi-600",
  border: "border-washi-300",
};

const PALETTE_TOKENS: CategoryStyle[] = [
  { bg: "bg-matcha-50", text: "text-matcha-700", border: "border-matcha-200" },
  { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  { bg: "bg-sakura-50", text: "text-sakura-700", border: "border-sakura-200" },
  { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
];

const CATEGORY_ALIASES: Record<string, number> = {
  "食料品": 0,
  "食品": 0,
  "日用品": 1,
  "生活用品": 1,
  "外食": 2,
  "レストラン": 2,
  "交通": 3,
  "移動": 3,
  "住居": 4,
  "家賃": 4,
  "光熱費": 5,
  "公共料金": 5,
  "医療": 6,
  "ヘルスケア": 6,
  "教育": 7,
  "学習": 7,
  "エンタメ": 2,
  "娯楽": 2,
  "通信": 5,
  "ファッション": 6,
  "ギフト": 7,
};

const computedAssignments = new Map<string, number>();

const normalizeCategory = (category?: string): string | undefined => {
  if (!category) return undefined;
  const trimmed = category.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const hashCategory = (category: string): number => {
  let hash = 0;
  for (let i = 0; i < category.length; i += 1) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  }
  return hash;
};

export const getCategoryStyle = (category?: string): CategoryStyle => {
  const normalized = normalizeCategory(category);
  if (!normalized) {
    return FALLBACK_STYLE;
  }

  const aliasIndex = CATEGORY_ALIASES[normalized];
  if (typeof aliasIndex === "number") {
    return PALETTE_TOKENS[aliasIndex % PALETTE_TOKENS.length] ?? FALLBACK_STYLE;
  }

  const cachedIndex = computedAssignments.get(normalized);
  if (typeof cachedIndex === "number") {
    return PALETTE_TOKENS[cachedIndex % PALETTE_TOKENS.length] ?? FALLBACK_STYLE;
  }

  const hashedIndex = hashCategory(normalized) % PALETTE_TOKENS.length;
  computedAssignments.set(normalized, hashedIndex);
  return PALETTE_TOKENS[hashedIndex] ?? FALLBACK_STYLE;
};

export const getCategoryBadgeClasses = (category?: string): string => {
  const palette = getCategoryStyle(category);
  return `${palette.bg} ${palette.text} border ${palette.border}`;
};

export const getCategoryLabel = (category?: string): string => {
  const normalized = normalizeCategory(category);
  return normalized ?? "未分類";
};
