"use client";

import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { toast } from "react-toastify";

import ReceiptUpload from "../../components/ReceiptUpload";
import CameraCapture from "../../components/CameraCapture";
import UploaderSelector from "../../components/UploaderSelector";
import { ReceiptData } from "../../types";
import { getCategoryBadgeClasses, getCategoryLabel } from "../../utils/categoryStyles";

type ExportFormat = "csv" | "json" | "zip";

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
      toast.success(`インポート成功: レシート${result.newReceipts}件 / 商品${result.newItems}件`);
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
              />
              <div className="hidden sm:flex gap-2 text-xs text-sumi-500">
                <span className="px-2 py-1 rounded-full bg-washi-200">2025年</span>
                <span className="px-2 py-1 rounded-full bg-washi-200">先月</span>
                <span className="px-2 py-1 rounded-full bg-washi-200 lg:inline-flex hidden">未整理</span>
              </div>
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
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 text-white shadow-sm hover:bg-teal-600"
              onClick={() => setShowFabPop((prev) => !prev)}
            >
              <Upload size={16} />
              レシートを追加
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="総レシート数" value={`${stats.totalReceipts.toLocaleString()} 件`} tone="indigo" />
          <StatCard title="総支出額" value={`¥${stats.totalAmount.toLocaleString()}`} tone="teal" />
          <StatCard title="平均レシート額" value={`¥${stats.avgAmount.toLocaleString()}`} tone="matcha" />
          <StatCard
            title="商品登録数"
            value={`${stats.totalItems.toLocaleString()} 点`}
            tone="sakura"
          />
        </section>

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
                    <td colSpan={6} className="px-3 py-10 text-center text-sumi-500">
                      データを読み込み中...
                    </td>
                  </tr>
                ) : receipts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-sumi-500">
                      レシートがありません。右下のボタンからレシートを追加してください。
                    </td>
                  </tr>
                ) : (
                  receipts.slice(0, 6).map((receipt) => {
                    const primaryCategory = resolvePrimaryCategory(receipt);
                    const categoryLabel = getCategoryLabel(primaryCategory);
                    const categoryClasses = getCategoryBadgeClasses(primaryCategory);

                    return (
                      <tr
                        key={receipt.id}
                        className="hover:bg-washi-100 cursor-pointer"
                        onClick={() => receipt.id && router.push(`/receipts/${receipt.id}`)}
                      >
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
          ) : receipts.length === 0 ? (
            <div className="text-center py-20 text-sumi-500">
              レシートがありません。右下のアクションから追加してください。
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {receipts.map((receipt) => {
                const primaryCategory = resolvePrimaryCategory(receipt);
                const categoryLabel = getCategoryLabel(primaryCategory);
                const categoryClasses = getCategoryBadgeClasses(primaryCategory);

                return (
                  <article
                    key={receipt.id}
                    className="bg-white border border-washi-300 rounded-3xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col gap-4"
                    onClick={() => receipt.id && router.push(`/receipts/${receipt.id}`)}
                  >
                    <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-washi-200 border border-washi-300">
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
