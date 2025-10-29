"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  MoreHorizontal,
  FileText,
  Menu,
  Download,
  Upload,
  Camera,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  X,
  SlidersHorizontal,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";

import ReceiptUpload from "../../components/ReceiptUpload";
import CameraCapture from "../../components/CameraCapture";
import UploaderSelector from "../../components/UploaderSelector";
import { ReceiptData } from "../../types";
import { getCategoryBadgeClasses, getCategoryLabel } from "../../utils/categoryStyles";
import { ALL_CATEGORIES, getSubcategoriesForCategory } from "../../utils/categoryCatalog";

type ExportFormat = "csv" | "json" | "zip";

type FiltersState = {
  searchTerm: string;
  category: string;
  subcategory: string;
  store: string;
  uploader: string;
  dateFrom: string;
  dateTo: string;
};

const DEFAULT_FILTERS: FiltersState = {
  searchTerm: "",
  category: "",
  subcategory: "",
  store: "",
  uploader: "",
  dateFrom: "",
  dateTo: "",
};

const FILTER_STORAGE_KEY = "harina.receipts.filters.v1";

const filtersAreActive = (filters: FiltersState) =>
  Boolean(
    filters.category ||
      filters.subcategory ||
      filters.store ||
      filters.uploader ||
      filters.dateFrom ||
      filters.dateTo
  );

const EXPORT_FORMATS: Array<{ value: ExportFormat; label: string; description: string }> = [
  { value: "csv", label: "CSV (再インポート用)", description: "インポート機能と完全互換の形式" },
  { value: "json", label: "JSON (構造化データ)", description: "レシートとアイテム情報をそのまま保存" },
  { value: "zip", label: "ZIP (CSV + JSON セット)", description: "CSVとJSONをまとめたバックアップ" },
];

const EXPORT_LABEL_MAP: Record<ExportFormat, string> = {
  csv: "CSV",
  json: "JSON",
  zip: "ZIP",
};

interface StatsState {
  totalReceipts: number;
  totalAmount: number;
  totalItems: number;
  avgAmount: number;
  userStats: { uploader: string; totalAmount: number; receiptCount: number }[];
}

export default function ReceiptsPage() {
  const router = useRouter();
  const readStoredFilters = (): FiltersState => {
    if (typeof window === "undefined") {
      return { ...DEFAULT_FILTERS };
    }
    const raw = window.sessionStorage.getItem(FILTER_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_FILTERS };
    }
    try {
      const parsed = JSON.parse(raw) as Partial<FiltersState>;
      return { ...DEFAULT_FILTERS, ...parsed };
    } catch (error) {
      console.warn("Failed to parse stored receipt filters", error);
      return { ...DEFAULT_FILTERS };
    }
  };
  const hasHydratedFiltersRef = useRef(false);
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [stats, setStats] = useState<StatsState>({
    totalReceipts: 0,
    totalAmount: 0,
    totalItems: 0,
    avgAmount: 0,
    userStats: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showFabPop, setShowFabPop] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [processingSteps, setProcessingSteps] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [selectedUploader, setSelectedUploader] = useState("夫");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({ ...DEFAULT_FILTERS });
  const [showFilters, setShowFilters] = useState(false);
  const [listBulkCategory, setListBulkCategory] = useState("");
  const [listBulkSubcategory, setListBulkSubcategory] = useState("");
  const [isListBulkSaving, setIsListBulkSaving] = useState(false);
  useEffect(() => {
    const stored = readStoredFilters();
    setFilters(stored);
    setShowFilters(filtersAreActive(stored));
    hasHydratedFiltersRef.current = true;
  }, []);
  useEffect(() => {
    if (!hasHydratedFiltersRef.current) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    window.sessionStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);
  const hasActiveFilters = filtersAreActive(filters);
  const categoryOptions = useMemo(() => {
    const merged = new Set<string>(ALL_CATEGORIES);
    receipts.forEach((receipt) =>
      receipt.items?.forEach((item) => {
        if (item.category) {
          merged.add(item.category);
        }
      })
    );
    return Array.from(merged).sort((a, b) => a.localeCompare(b, "ja"));
  }, [receipts]);
  const storeOptions = useMemo(() => {
    const set = new Set<string>();
    receipts.forEach((receipt) => {
      if (receipt.store_name) {
        set.add(receipt.store_name);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ja"));
  }, [receipts]);
  const uploaderOptions = useMemo(() => {
    const set = new Set<string>();
    receipts.forEach((receipt) => {
      if (receipt.uploader) {
        set.add(receipt.uploader);
      }
    });
    return Array.from(set).sort();
  }, [receipts]);
  const subcategoryOptions = useMemo(() => {
    if (!filters.category) return [];
    const base = new Set<string>(getSubcategoriesForCategory(filters.category));
    receipts.forEach((receipt) => {
      receipt.items?.forEach((item) => {
        if (item.category === filters.category && item.subcategory) {
          base.add(item.subcategory);
        }
      });
    });
    return Array.from(base).sort((a, b) => a.localeCompare(b, "ja"));
  }, [filters.category, receipts]);
  const listBulkSubcategoryOptions = useMemo(() => {
    if (!listBulkCategory) return [];
    return getSubcategoriesForCategory(listBulkCategory);
  }, [listBulkCategory]);

  useEffect(() => {
    fetchReceipts();
  }, []);

  useEffect(() => {
    if (!showExportMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showExportMenu]);

  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      const searchTerm = filters.searchTerm.trim().toLowerCase();

      if (searchTerm) {
        const storeHit = receipt.store_name?.toLowerCase().includes(searchTerm);
        const receiptNumberHit = receipt.receipt_number?.toLowerCase().includes(searchTerm);
        const itemHit = receipt.items?.some((item) =>
          item.name?.toLowerCase().includes(searchTerm)
        );

        if (!storeHit && !receiptNumberHit && !itemHit) {
          return false;
        }
      }

      if (filters.store && receipt.store_name !== filters.store) {
        return false;
      }

      if (filters.uploader && receipt.uploader !== filters.uploader) {
        return false;
      }

      if (filters.dateFrom) {
        if (!receipt.transaction_date || receipt.transaction_date < filters.dateFrom) {
          return false;
        }
      }

      if (filters.dateTo) {
        if (!receipt.transaction_date || receipt.transaction_date > filters.dateTo) {
          return false;
        }
      }

      const categories = new Set(
        receipt.items?.map((item) => item.category?.trim()).filter(Boolean) as string[] ?? []
      );

      if (filters.category && !categories.has(filters.category)) {
        return false;
      }

      if (filters.subcategory) {
        const hasSubcategory = receipt.items?.some(
          (item) =>
            item.category?.trim() === filters.category &&
            item.subcategory?.trim() === filters.subcategory
        );
        if (!hasSubcategory) {
          return false;
        }
      }

      return true;
    });
  }, [filters, receipts]);

  const filteredStats = useMemo(() => {
    const totalReceipts = filteredReceipts.length;
    const totalAmount = filteredReceipts.reduce(
      (acc, receipt) => acc + (receipt.total_amount ?? 0),
      0
    );
    const totalItems = filteredReceipts.reduce((acc, receipt) => {
      const itemsCount =
        receipt.items?.reduce((itemAcc, item) => itemAcc + (item.quantity ?? 0), 0) ?? 0;
      return acc + itemsCount;
    }, 0);

    return {
      totalReceipts,
      totalAmount,
      totalItems,
      avgAmount: totalReceipts > 0 ? Math.round(totalAmount / totalReceipts) : 0,
    };
  }, [filteredReceipts]);

  const allSelectableIds = useMemo(
    () =>
      filteredReceipts
        .map((receipt) => receipt.id)
        .filter((id): id is number => typeof id === "number"),
    [filteredReceipts]
  );
  const isAllSelected = allSelectableIds.length > 0 && selectedIds.length === allSelectableIds.length;
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const hasSelection = selectedIds.length > 0;

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => allSelectableIds.includes(id)));
  }, [allSelectableIds]);

  const fetchReceipts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/receipts?stats=true");
      if (!response.ok) {
        throw new Error("レシート一覧の取得に失敗しました");
      }
      const data = await response.json();
      setReceipts(data.receipts || []);
      if (data.stats) {
        setStats({
          totalReceipts: data.stats.totalReceipts,
          totalAmount: data.stats.totalAmount,
          totalItems: data.stats.totalItems,
          avgAmount: data.stats.totalReceipts > 0
            ? Math.round(data.stats.totalAmount / data.stats.totalReceipts)
            : 0,
          userStats: data.stats.userStats || [],
        });
      }
      setSelectedIds([]);
      if (Array.isArray(data.receipts)) {
        setFilters((prev) => {
          const next: FiltersState = {
            ...prev,
            store:
              prev.store && data.receipts.some((receipt: ReceiptData) => receipt.store_name === prev.store)
                ? prev.store
                : "",
            uploader:
              prev.uploader && data.receipts.some((receipt: ReceiptData) => receipt.uploader === prev.uploader)
                ? prev.uploader
                : "",
            subcategory:
              prev.category && getSubcategoriesForCategory(prev.category).includes(prev.subcategory)
                ? prev.subcategory
                : "",
          };
          if (
            next.store === prev.store &&
            next.uploader === prev.uploader &&
            next.subcategory === prev.subcategory
          ) {
            return prev;
          }
          return next;
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("レシートデータの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReceiptProcessed = (receipt: ReceiptData) => {
    if (receipt?.id) {
      router.push(`/receipts/${receipt.id}`);
    }
    fetchReceipts();
  };

  const toggleSelectionMode = () => {
    setSelectionMode((prev) => {
      const next = !prev;
      if (!next) {
        setSelectedIds([]);
      }
      return next;
    });
  };

  const handleSelect = (id: number, checked: boolean) => {
    if (!Number.isFinite(id)) return;
    setSelectedIds((prev) => {
      if (checked) {
        if (prev.includes(id)) {
          return prev;
        }
        return [...prev, id];
      }
      return prev.filter((existingId) => existingId !== id);
    });
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((existingId) => existingId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allSelectableIds);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      setIsDeleting(true);
      const response = await fetch("/api/receipts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: "削除に失敗しました" }));
        throw new Error(error || "削除に失敗しました");
      }

      const result = await response.json().catch(() => null);
      toast.success(
        result?.deletedReceipts
          ? `${result.deletedReceipts}件のレシートを削除しました`
          : "レシートを削除しました"
      );
      await fetchReceipts();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "レシートの削除に失敗しました");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileUpload = async (files: File | File[]) => {
    const fileArray = Array.isArray(files) ? files : [files];

    setShowFabPop(false);
    setIsProcessing(true);
    setProcessingSteps(1);
    setProcessingMessage(`${fileArray.length}件のファイルをアップロード中...`);

    try {
      let processedCount = 0;

      for (let i = 0; i < fileArray.length; i += 1) {
        const file = fileArray[i];
        setProcessingSteps(2);
        setProcessingMessage(`${i + 1}/${fileArray.length}: ${file.name} を解析中...`);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("model", "gemini");
        formData.append("uploader", selectedUploader);

        const response = await fetch("/api/process-receipt", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "レシートの解析に失敗しました");
        }

        const result = await response.json();
        processedCount += 1;
        setProcessingSteps(3);
        setProcessingMessage(`${i + 1}/${fileArray.length}: データを保存中...`);
        handleReceiptProcessed(result);
      }

      toast.success(`${processedCount}件のレシートを処理しました`);
    } catch (error) {
      console.error(error);
      toast.error("レシート処理中にエラーが発生しました");
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingSteps(1);
        setProcessingMessage("");
      }, 1200);
    }
  };

  const handleCsvUpload = async (file: File) => {
    setShowFabPop(false);
    setIsProcessing(true);
    setProcessingSteps(1);
    setProcessingMessage("CSVをアップロード中...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/import-csv", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "CSVインポートに失敗しました");
      }

      setProcessingSteps(3);
      setProcessingMessage("インポート完了！");
      const duplicateMessage =
        result.duplicatesSkipped && result.duplicatesSkipped > 0
          ? ` / 重複スキップ${result.duplicatesSkipped}件`
          : "";

      if (result.duplicatesSkipped && result.duplicatesSkipped > 0 && result.newReceipts === 0) {
        toast.info(`すでに登録済みのレシートが${result.duplicatesSkipped}件あったよ`, {
          position: "top-center",
          autoClose: 4000,
        });
      } else {
        toast.success(
          `インポート成功: レシート${result.newReceipts}件 / 商品${result.newItems}件${duplicateMessage}`,
          {
            position: "top-center",
            autoClose: 4000,
          }
        );
      }
      fetchReceipts();
    } catch (error) {
      console.error(error);
      toast.error("CSVインポート中にエラーが発生しました");
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingSteps(1);
        setProcessingMessage("");
      }, 1200);
    }
  };

  const handleExport = async (format: ExportFormat) => {
    try {
      setExportingFormat(format);
      setIsExporting(true);
      const response = await fetch(`/api/export?format=${format}`);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "エクスポートに失敗しました");
      }

      const blob = await response.blob();
      const filename = `harina_receipts_${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}.${format}`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${EXPORT_LABEL_MAP[format]} 形式でエクスポートしました`);
    } catch (error) {
      console.error(error);
      toast.error("エクスポートに失敗しました");
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
      setShowExportMenu(false);
    }
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => {
      if (key === "category") {
        return {
          ...prev,
          category: value,
          subcategory: "",
        };
      }
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const resetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
    setShowFilters(false);
  };

  const handleListBulkCategoryChange = (value: string) => {
    setListBulkCategory(value);
    if (!value) {
      setListBulkSubcategory("");
      return;
    }
    const options = getSubcategoriesForCategory(value);
    if (!options.includes(listBulkSubcategory)) {
      setListBulkSubcategory("");
    }
  };

  const handleListBulkSave = async () => {
    if (selectedIds.length === 0) {
      toast.info("レシートを選択してください");
      return;
    }
    const trimmedCategory = listBulkCategory.trim();
    if (!trimmedCategory) {
      toast.warn("カテゴリを選択してください");
      return;
    }
    const trimmedSubcategory = listBulkSubcategory.trim();
    setIsListBulkSaving(true);
    try {
      const response = await fetch("/api/receipt-items/bulk-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiptIds: selectedIds,
          category: trimmedCategory,
          subcategory: trimmedSubcategory,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "レシートの更新に失敗しました");
      }

      const result = await response.json().catch(() => ({}));
      const updatedItems =
        typeof result.updatedItems === "number" ? result.updatedItems : undefined;
      const selectedSet = new Set(selectedIds);
      setReceipts((prev) =>
        prev.map((receipt) =>
          receipt.id && selectedSet.has(receipt.id)
            ? {
                ...receipt,
                items: receipt.items?.map((item) => ({
                  ...item,
                  category: trimmedCategory,
                  subcategory: trimmedSubcategory || "",
                })),
              }
            : receipt
        )
      );
      toast.success(
        updatedItems !== undefined
          ? `カテゴリを更新しました（${updatedItems}件）`
          : "カテゴリを更新しました"
      );
    } catch (error) {
      console.error("Failed to bulk update receipts:", error);
      toast.error(
        error instanceof Error ? error.message : "レシートの更新に失敗しました"
      );
    } finally {
      setIsListBulkSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-washi-100">
      <header className="sticky top-0 z-30 border-b border-washi-300 bg-white/90 backdrop-blur">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <button
              type="button"
              className="rounded-lg border border-washi-300 bg-white p-2 text-sumi-600 hover:bg-washi-100 lg:hidden"
              onClick={() => window.dispatchEvent(new Event("toggle-sidebar"))}
            >
              <Menu size={18} />
            </button>
            <div className="flex-1 flex items-center gap-2 bg-white border border-washi-300 rounded-xl px-3 py-2">
              <Search size={16} className="text-sumi-400" />
              <input
                className="flex-1 bg-transparent border-none text-sm text-sumi-700 focus:outline-none"
                placeholder="店舗名・金額・メモで検索..."
                value={filters.searchTerm}
                onChange={(event) => handleFilterChange("searchTerm", event.target.value)}
              />
              <div className="hidden sm:flex gap-2 text-xs text-sumi-500">
                <span className="px-2 py-1 rounded-full bg-washi-200">カテゴリ</span>
                <span className="px-2 py-1 rounded-full bg-washi-200">店舗</span>
                <span className="px-2 py-1 rounded-full bg-washi-200 lg:inline-flex hidden">期間</span>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-washi-300 bg-white px-3 py-1.5 text-xs font-semibold text-sumi-600 hover:bg-washi-100"
                onClick={() => setShowFilters((prev) => !prev)}
                aria-pressed={showFilters}
              >
                <SlidersHorizontal size={14} />
                <span className="hidden sm:inline">詳細</span>
                {hasActiveFilters ? (
                  <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-teal-500" aria-hidden="true" />
                ) : null}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative" ref={exportMenuRef}>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-washi-300 bg-white text-sumi-700 hover:bg-washi-100"
                onClick={() => setShowExportMenu((prev) => !prev)}
              >
                <Download size={16} />
                {isExporting ? "エクスポート中" : "エクスポート"}
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-washi-300 rounded-xl shadow-xl p-2 z-50">
                  <p className="text-xs text-sumi-500 px-2 pb-2">形式を選択してください</p>
                  <div className="grid gap-2">
                    {EXPORT_FORMATS.map((format) => (
                      <button
                        key={format.value}
                        className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                          exportingFormat === format.value
                            ? "border-teal-500 bg-teal-50 text-teal-700"
                            : "border-washi-300 hover:border-teal-200 hover:bg-teal-50"
                        }`}
                        onClick={() => handleExport(format.value)}
                        disabled={isExporting}
                      >
                        <p className="text-sm font-semibold">{format.label}</p>
                        <p className="text-xs text-sumi-500">{format.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-washi-300 ${
                selectionMode ? "bg-sumi-900 text-white border-sumi-900" : "bg-white text-sumi-700 hover:bg-washi-100"
              }`}
              onClick={toggleSelectionMode}
            >
              {selectionMode ? <X size={16} /> : <CheckSquare size={16} />}
              {selectionMode ? "選択モード終了" : "一括選択"}
            </button>

            <button
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 text-white shadow-sm hover:bg-teal-600"
              onClick={() => setShowFabPop((prev) => !prev)}
            >
              <Upload size={16} />
              レシートを追加
            </button>
          </div>
        </div>
        {(showFilters || hasActiveFilters) && (
          <div className="px-4 sm:px-6 lg:px-8 pb-3">
            <div className="rounded-2xl border border-washi-300 bg-white px-4 py-4 shadow-sm">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <div className="flex flex-col gap-1">
                  <label htmlFor="filter-category" className="text-xs font-semibold text-sumi-500">
                    カテゴリ
                  </label>
                  <select
                    id="filter-category"
                    value={filters.category}
                    onChange={(event) => handleFilterChange("category", event.target.value)}
                    className="rounded-xl border border-washi-300 px-3 py-2 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                  >
                    <option value="">すべて</option>
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="filter-subcategory" className="text-xs font-semibold text-sumi-500">
                    サブカテゴリ
                  </label>
                  <select
                    id="filter-subcategory"
                    value={filters.subcategory}
                    onChange={(event) => handleFilterChange("subcategory", event.target.value)}
                    className="rounded-xl border border-washi-300 px-3 py-2 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                    disabled={!filters.category}
                  >
                    <option value="">すべて</option>
                    {subcategoryOptions.map((subcategory) => (
                      <option key={subcategory} value={subcategory}>
                        {subcategory}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="filter-store" className="text-xs font-semibold text-sumi-500">
                    店舗
                  </label>
                  <select
                    id="filter-store"
                    value={filters.store}
                    onChange={(event) => handleFilterChange("store", event.target.value)}
                    className="rounded-xl border border-washi-300 px-3 py-2 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                  >
                    <option value="">すべて</option>
                    {storeOptions.map((store) => (
                      <option key={store} value={store}>
                        {store}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="filter-uploader" className="text-xs font-semibold text-sumi-500">
                    アップロード者
                  </label>
                  <select
                    id="filter-uploader"
                    value={filters.uploader}
                    onChange={(event) => handleFilterChange("uploader", event.target.value)}
                    className="rounded-xl border border-washi-300 px-3 py-2 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                  >
                    <option value="">すべて</option>
                    {uploaderOptions.map((uploader) => (
                      <option key={uploader} value={uploader}>
                        {uploader}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="filter-date-from" className="text-xs font-semibold text-sumi-500">
                    日付（開始）
                  </label>
                  <input
                    id="filter-date-from"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(event) => handleFilterChange("dateFrom", event.target.value)}
                    className="rounded-xl border border-washi-300 px-3 py-2 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="filter-date-to" className="text-xs font-semibold text-sumi-500">
                    日付（終了）
                  </label>
                  <input
                    id="filter-date-to"
                    type="date"
                    value={filters.dateTo}
                    onChange={(event) => handleFilterChange("dateTo", event.target.value)}
                    className="rounded-xl border border-washi-300 px-3 py-2 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 rounded-xl border border-washi-300 bg-white px-4 py-2 text-sm font-semibold text-sumi-600 hover:bg-washi-100"
                >
                  フィルターをリセット
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="総レシート数" value={`${filteredStats.totalReceipts.toLocaleString()} 件`} tone="indigo" />
          <StatCard title="総支出額" value={`¥${filteredStats.totalAmount.toLocaleString()}`} tone="teal" />
          <StatCard title="平均レシート額" value={`¥${filteredStats.avgAmount.toLocaleString()}`} tone="matcha" />
          <StatCard
            title="商品登録数"
            value={`${filteredStats.totalItems.toLocaleString()} 点`}
            tone="sakura"
          />
        </section>

        {selectionMode && (
          <section className="bg-white border border-washi-300 rounded-3xl shadow-sm px-5 py-4 space-y-4">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div className="flex items-center gap-3 text-sm text-sumi-600">
                <CheckSquare size={16} className="text-teal-600" />
                <span>
                  {hasSelection
                    ? `${selectedIds.length}件のレシートを選択中`
                    : "操作したいレシートを選択してください"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-washi-300 text-sumi-600 hover:bg-washi-100 text-xs sm:text-sm"
                  onClick={handleSelectAll}
                >
                  {isAllSelected ? (
                    <>
                      <X size={14} />
                      全選択解除
                    </>
                  ) : (
                    <>
                      <Square size={14} />
                      全選択
                    </>
                  )}
                </button>
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white shadow-sm hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                  onClick={handleBulkDelete}
                  disabled={!hasSelection || isDeleting}
                >
                  <Trash2 size={16} />
                  {isDeleting ? "削除中..." : "選択したレシートを削除"}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1 min-w-[160px]">
                <label htmlFor="list-bulk-category" className="text-xs font-semibold text-sumi-500">
                  選択レシートのカテゴリ
                </label>
                <select
                  id="list-bulk-category"
                  value={listBulkCategory}
                  onChange={(event) => handleListBulkCategoryChange(event.target.value)}
                  className="rounded-xl border border-washi-300 px-3 py-2 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                >
                  <option value="">選択してください</option>
                  {categoryOptions.map((category) => (
                    <option key={`bulk-list-${category}`} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1 min-w-[160px]">
                <label htmlFor="list-bulk-subcategory" className="text-xs font-semibold text-sumi-500">
                  サブカテゴリ
                </label>
                <select
                  id="list-bulk-subcategory"
                  value={listBulkSubcategory}
                  onChange={(event) => setListBulkSubcategory(event.target.value)}
                  className="rounded-xl border border-washi-300 px-3 py-2 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                  disabled={!listBulkCategory}
                >
                  <option value="">選択なし</option>
                  {listBulkSubcategoryOptions.map((subcategory) => (
                    <option key={`bulk-list-sub-${subcategory}`} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleListBulkSave}
                disabled={!hasSelection || isListBulkSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isListBulkSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                選択レシートを更新
              </button>
            </div>
          </section>
        )}

        <section className="panel bg-white border border-washi-300 rounded-3xl shadow-sm">
          <div className="px-6 py-4 border-b border-washi-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-sumi-900">最近のレシート</h2>
            <button
              className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700"
              onClick={() => router.push('/receipts')}
            >
              すべて表示
              <MoreHorizontal size={16} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-2 p-3">
              <thead>
                <tr className="text-xs text-sumi-500 text-left">
                  {selectionMode && <th className="px-3 w-12">選択</th>}
                  <th className="px-3">日付</th>
                  <th className="px-3">店舗</th>
                  <th className="px-3">アップロード者</th>
                  <th className="px-3">カテゴリ</th>
                  <th className="px-3 text-right">金額</th>
                  <th className="px-3">状態</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={selectionMode ? 7 : 6} className="px-3 py-10 text-center text-sumi-500">
                      データを読み込み中...
                    </td>
                  </tr>
                ) : filteredReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={selectionMode ? 7 : 6} className="px-3 py-10 text-center text-sumi-500">
                      条件に一致するレシートがありません。フィルターを調整してください。
                    </td>
                  </tr>
                ) : (
                  filteredReceipts.slice(0, 6).map((receipt) => {
                    const primaryCategory = resolvePrimaryCategory(receipt);
                    const categoryLabel = getCategoryLabel(primaryCategory);
                    const categoryClasses = getCategoryBadgeClasses(primaryCategory);
                    const id = receipt.id ?? 0;
                    const isChecked = id ? selectedIdSet.has(id) : false;

                    const handleRowClick = () => {
                      if (!id) return;
                      if (selectionMode) {
                        handleToggleSelect(id);
                      } else {
                        router.push(`/receipts/${id}`);
                      }
                    };

                    return (
                      <tr
                        key={receipt.id}
                        className="hover:bg-washi-100 cursor-pointer"
                        onClick={handleRowClick}
                      >
                        {selectionMode && (
                          <td className="px-3 py-3 text-sm">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-washi-400 text-teal-600 focus:ring-teal-500"
                              checked={isChecked}
                              onChange={(event) => {
                                event.stopPropagation();
                                handleSelect(id, event.target.checked);
                              }}
                              onClick={(event) => event.stopPropagation()}
                              disabled={!id}
                            />
                          </td>
                        )}
                        <td className="px-3 py-3 text-sm text-sumi-700">{receipt.transaction_date || "日付不明"}</td>
                        <td className="px-3 py-3 text-sm text-sumi-700">{receipt.store_name || "店舗名不明"}</td>
                        <td className="px-3 py-3 text-sm text-sumi-700">
                          <span className="inline-flex items-center gap-1">
                            {receipt.uploader === "夫" ? "🤵" : "👰"}
                            <span>{receipt.uploader || "夫"}</span>
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-sumi-600">
                          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${categoryClasses}`}>
                            <span className="inline-block h-2 w-2 rounded-full bg-current opacity-80" />
                            {categoryLabel}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-sumi-900 text-right font-semibold">
                          ¥{receipt.total_amount?.toLocaleString() || "0"}
                        </td>
                        <td className="px-3 py-3 text-sm">
                          <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2 py-1 text-xs text-teal-700">
                            確定
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-sumi-900">レシート一覧</h2>
            <button
              className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700"
              onClick={() => setShowFabPop(true)}
            >
              <Plus size={16} />
              レシートを追加
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-20 text-sumi-500">データを読み込み中...</div>
          ) : filteredReceipts.length === 0 ? (
            <div className="text-center py-20 text-sumi-500">
              条件に一致するレシートがありません。フィルターを変更して再検索してください。
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReceipts.map((receipt) => {
                const primaryCategory = resolvePrimaryCategory(receipt);
                const categoryLabel = getCategoryLabel(primaryCategory);
                const categoryClasses = getCategoryBadgeClasses(primaryCategory);
                const id = receipt.id ?? 0;
                const isChecked = id ? selectedIdSet.has(id) : false;

                const handleCardClick = () => {
                  if (!id) return;
                  if (selectionMode) {
                    handleToggleSelect(id);
                  } else {
                    router.push(`/receipts/${id}`);
                  }
                };

                return (
                  <article
                    key={receipt.id}
                    className={`bg-white border rounded-3xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col gap-4 ${
                      isChecked ? "border-teal-300 ring-2 ring-teal-200" : "border-washi-300"
                    }`}
                    onClick={handleCardClick}
                  >
                    <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-washi-200 border border-washi-300">
                      {selectionMode && (
                        <div className="absolute top-3 right-3 z-10">
                          <input
                            type="checkbox"
                            className="h-5 w-5 rounded border-washi-400 text-teal-600 focus:ring-teal-500 bg-white"
                            checked={isChecked}
                            onChange={(event) => {
                              event.stopPropagation();
                              handleSelect(id, event.target.checked);
                            }}
                            onClick={(event) => event.stopPropagation()}
                            disabled={!id}
                          />
                        </div>
                      )}
                      {receipt.image_path ? (
                        <Image
                          src={receipt.image_path}
                          alt={`レシート - ${receipt.store_name}`}
                          fill
                          className="object-cover object-top"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          onError={(event) => {
                            const target = event.currentTarget;
                            if (target.src !== "/placeholder-receipt.png") {
                              target.src = "/placeholder-receipt.png";
                            }
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-sumi-400">
                          <FileText className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sumi-900 truncate">{receipt.store_name || "店舗名不明"}</p>
                        <p className="text-sm text-sumi-500">{receipt.transaction_date || "日付不明"}</p>
                      </div>
                      <span className="text-lg font-bold text-teal-600">
                        ¥{receipt.total_amount?.toLocaleString() || "0"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-sumi-500">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-washi-200 text-sumi-600">
                        {receipt.uploader || "夫"}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${categoryClasses}`}>
                        <span className="inline-block h-2 w-2 rounded-full bg-current opacity-80" />
                        {categoryLabel}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {showFabPop && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={() => setShowFabPop(false)}
        >
          <div
            className="max-w-sm w-full bg-white rounded-3xl border border-washi-300 shadow-xl p-6 space-y-4"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-sumi-900">レシートを追加</h3>
            <p className="text-sm text-sumi-500">
              解析したいレシート画像をアップロードするか、カメラで撮影してください。
            </p>

            <div className="grid gap-3">
              <button
                className="flex items-center gap-3 p-3 border border-washi-300 rounded-2xl hover:border-teal-300 hover:bg-teal-50 text-sumi-700"
                onClick={() => {
                  setShowFabPop(false);
                  setShowCamera(true);
                }}
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-100 text-teal-600">
                  <Camera size={18} />
                </span>
                <span>スマホのカメラで撮影する</span>
              </button>

              <ReceiptUpload onUpload={handleFileUpload} />

              <div
                className="flex items-center gap-3 p-3 border border-dashed border-teal-200 rounded-2xl bg-teal-50 text-teal-700 cursor-pointer hover:bg-teal-100"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".csv";
                  input.onchange = (event) => {
                    const file = (event.target as HTMLInputElement).files?.[0];
                    if (file) handleCsvUpload(file);
                  };
                  input.click();
                }}
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white text-teal-600 border border-teal-200">
                  <Upload size={18} />
                </span>
                <span>CSVをインポートする</span>
              </div>
            </div>

            <div className="grid gap-3">
              <h4 className="text-sm font-semibold text-sumi-600">アップロード者</h4>
              <UploaderSelector
                selectedUploader={selectedUploader}
                setSelectedUploader={setSelectedUploader}
              />
            </div>
          </div>
        </div>
      )}

      {showCamera && (
        <CameraCapture
          onCapture={(file) => {
            handleFileUpload(file);
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}

      {isProcessing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-washi-300 shadow-xl p-8 max-w-md w-full space-y-6 text-center">
            <div className="mx-auto w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <p className="text-sm text-sumi-500">ステップ {processingSteps} / 4</p>
              <p className="text-lg font-semibold text-sumi-900 mt-1">{processingMessage}</p>
            </div>
          </div>
        </div>
      )}

      <button
        className="fixed bottom-6 right-6 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-teal-500 text-white shadow-xl hover:bg-teal-600 lg:hidden"
        onClick={() => setShowFabPop((prev) => !prev)}
        aria-label="レシートを追加"
      >
        <Plus size={22} />
      </button>
    </div>
  );
}

function resolvePrimaryCategory(receipt: ReceiptData): string | undefined {
  const firstWithCategory = receipt.items?.find((item) => item.category && item.category.trim().length > 0);
  if (firstWithCategory?.category) {
    return firstWithCategory.category;
  }
  return receipt.items?.[0]?.category ?? undefined;
}

function StatCard({
  title,
  value,
  tone = "indigo",
}: {
  title: string;
  value: string;
  tone?: "indigo" | "teal" | "matcha" | "sakura";
}) {
  const palette: Record<string, { bg: string; text: string; border: string }> = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
    teal: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
    matcha: { bg: "bg-matcha-50", text: "text-matcha-900", border: "border-matcha-300" },
    sakura: { bg: "bg-sakura-50", text: "text-sakura-700", border: "border-sakura-200" },
  };

  const paletteToken = palette[tone] ?? palette.indigo;

  return (
    <div className={`bg-white border border-washi-300 rounded-3xl p-5 shadow-sm flex flex-col gap-2`}>
      <span className="text-xs uppercase tracking-wide text-sumi-500">{title}</span>
      <span className={`text-2xl font-bold ${paletteToken.text}`}>{value}</span>
      <span className={`inline-flex items-center w-fit px-3 py-1 text-xs rounded-full ${paletteToken.bg} ${paletteToken.border} border`}>更新済み</span>
    </div>
  );
}
