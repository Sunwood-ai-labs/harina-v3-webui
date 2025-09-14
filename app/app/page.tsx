"use client";

import { useState, useEffect } from "react";
import { Search, MoreHorizontal, FileText } from "lucide-react";
import ReceiptUpload from "./components/ReceiptUpload";
import CameraCapture from "./components/CameraCapture";
import UploaderSelector from "./components/UploaderSelector";
import { ReceiptData } from "./types";
import { toast } from "react-toastify";
import dynamic from 'next/dynamic'; // 👈 dynamic をインポート

// ▼▼▼ DashboardCharts コンポーネントを動的にインポート ▼▼▼
const DynamicDashboardCharts = dynamic(() => import('./components/DashboardCharts'), {
  ssr: false, // サーバーサイドレンダリングを無効化
  loading: () => (
    <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="panel bg-white border border-gray-200 rounded-2xl p-4 shadow-sm lg:col-span-2 h-[320px] flex justify-center items-center">
        <p className="text-gray-500">グラフを読み込み中...</p>
      </div>
      <div className="panel bg-white border border-gray-200 rounded-2xl p-4 shadow-sm lg:col-span-3 h-[320px] flex justify-center items-center">
        <p className="text-gray-500">グラフを読み込み中...</p>
      </div>
    </section>
  ),
});

// サイドバーコンポーネント
const Sidebar = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const navItems = [
    { id: "dashboard", label: "ダッシュボード" },
    { id: "receipts", label: "レシート一覧" },
    { id: "categories", label: "カテゴリ分類" },
    { id: "analytics", label: "分析・レポート" },
    { id: "budget", label: "予算とアラート" },
    { id: "stores", label: "店舗・仕入先" },
    { id: "settings", label: "設定" },
  ];

  return (
    <aside className="bg-white border-r border-gray-200 sticky top-0 h-screen p-5 flex flex-col">
      <div className="brand flex items-center gap-2 font-extrabold text-lg mb-4 mx-2">
        🦔 HARINA
        <span className="badge bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          v3
        </span>
        <span className="ml-1 text-gray-500 font-semibold text-sm">Web UI</span>
      </div>

      <nav className="nav grid gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-2 text-left px-3 py-2 rounded-lg transition-colors ${
              activeTab === item.id ? "bg-gray-100" : "hover:bg-gray-50"
            }`}
          >
            {item.label}
            {item.id === "settings" && (
              <MoreHorizontal className="ml-auto text-gray-400" size={16} />
            )}
          </button>
        ))}
      </nav>

      <div className="quota mt-auto pt-4 p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-xs">
        今月のクラウド保存：72% 使用（3.6GB / 5GB）
        <div className="h-2 bg-gray-200 rounded-md mt-2">
          <div className="w-3/4 h-2 bg-gradient-to-r from-teal-500 to-green-400 rounded-md"></div>
        </div>
      </div>
    </aside>
  );
};

// ヘッダーコンポーネント
const Header = ({
  showExportBtn = true,
  showNewBtn = true,
}: {
  showExportBtn?: boolean;
  showNewBtn?: boolean;
}) => (
  <header className="sticky top-0 bg-gray-50 border-b border-gray-200 p-3 z-10 flex items-center gap-3 justify-between">
    <div className="search flex items-center gap-2 flex-1 bg-white p-2 rounded-lg border border-gray-200">
      <Search size={16} />
      <input
        placeholder="店舗名、金額、メモで検索…"
        className="border-none outline-none bg-transparent w-full text-sm"
      />
      <div className="chip bg-gray-100 px-2 py-1 rounded text-xs">2025年</div>
      <div className="chip bg-gray-100 px-2 py-1 rounded text-xs">先月</div>
      <div className="chip bg-gray-100 px-2 py-1 rounded text-xs">未整理</div>
    </div>

    <div className="toolbar flex gap-2">
      {showExportBtn && (
        <button className="btn secondary bg-white text-gray-800 px-3 py-2 rounded-lg border border-gray-200 font-semibold">
          エクスポート
        </button>
      )}
      {showNewBtn && (
        <button className="btn accent bg-teal-500 text-white px-3 py-2 rounded-lg font-semibold">
          + 手入力
        </button>
      )}
    </div>
  </header>
);

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptData | null>(
    null
  );
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [showFabPop, setShowFabPop] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [processingSteps, setProcessingSteps] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState("");
  const [selectedUploader, setSelectedUploader] = useState("夫"); // 👈 ユーザー選択状態を追加

  const [stats, setStats] = useState({
    totalReceipts: 0,
    totalAmount: 0,
    totalItems: 0,
    avgAmount: 0,
    userStats: [] as { uploader: string; totalAmount: number; receiptCount: number }[],
  });
  const [isLoading, setIsLoading] = useState(true);

  // ▼▼▼ カテゴリ別支出データを保持するStateを追加 ▼▼▼
  const [categorySpending, setCategorySpending] = useState<{ [key: string]: number }>({});

  // データベースからレシートと統計情報を取得
  const fetchReceipts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/receipts?stats=true");
      if (response.ok) {
        const data = await response.json();
        setReceipts(data.receipts || []);
        if (data.stats) {
          setStats({
            totalReceipts: data.stats.totalReceipts,
            totalAmount: data.stats.totalAmount,
            totalItems: data.stats.totalItems,
            avgAmount:
              data.stats.totalReceipts > 0
                ? data.stats.totalAmount / data.stats.totalReceipts
                : 0,
            userStats: data.stats.userStats || [],
          });
        }
      }
    } catch (error) {
      console.error("Error fetching receipts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  // ▼▼▼ レシートデータからカテゴリ別支出を集計するuseEffectを追加 ▼▼▼
  useEffect(() => {
    if (receipts.length > 0) {
      const spending: { [key: string]: number } = {};
      receipts.forEach(receipt => {
        receipt.items?.forEach(item => {
          const category = item.category || '未分類';
          const price = item.total_price || 0;
          if (spending[category]) {
            spending[category] += price;
          } else {
            spending[category] = price;
          }
        });
      });
      // 金額の大きい順にソート
      const sortedSpending = Object.fromEntries(
        Object.entries(spending).sort(([, a], [, b]) => b - a)
      );
      setCategorySpending(sortedSpending);
    }
  }, [receipts]);

  // レシート処理完了時のハンドラー
  const handleReceiptProcessed = (receipt: ReceiptData) => {
    setCurrentReceipt(receipt);
    setShowModal(true);
    setShowFabPop(false);
  };

  const handleFileUpload = async (files: File | File[]) => {
    setShowFabPop(false);
    setIsProcessing(true);
    setProcessingSteps(1);
    
    const fileArray = Array.isArray(files) ? files : [files];
    setProcessingMessage(`${fileArray.length}件のファイルをアップロード中...`);

    try {
      let processedCount = 0;
      
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        
        setProcessingSteps(2);
        setProcessingMessage(`${i + 1}/${fileArray.length}: ${file.name} を解析中...`);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("model", "gemini"); // デフォルトモデル
        formData.append("uploader", selectedUploader);

        const response = await fetch("/api/process-receipt", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          setProcessingSteps(3);
          setProcessingMessage(`${i + 1}/${fileArray.length}: データを処理中...`);

          const result = await response.json();
          handleReceiptProcessed(result);
          processedCount++;
        } else {
          console.error(`Failed to process ${file.name}`);
          toast.error(`${file.name} の処理に失敗しました`);
        }
      }

      setProcessingSteps(4);
      setProcessingMessage("データベースを更新中...");

      // データを再取得して統計を更新
      await fetchReceipts();

      setProcessingMessage(`${processedCount}件の処理が完了しました！`);
      
      if (processedCount === fileArray.length) {
        toast.success(`${processedCount}件のレシートを正常に処理しました！`);
      } else {
        toast.warning(`${processedCount}/${fileArray.length}件の処理が完了しました`);
      }
      
    } catch (error) {
      console.error("Error processing receipts:", error);
      toast.error("レシート処理中にエラーが発生しました");
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingSteps(1);
        setProcessingMessage("");
      }, 2000);
    }
  };

  const handleCameraCapture = (file: File) => {
    setShowCamera(false);
    handleFileUpload(file);
  };

  // CSVアップロード処理用のハンドラを追加
  const handleCsvUpload = async (file: File) => {
    setShowFabPop(false);
    setIsProcessing(true);
    setProcessingSteps(1); // ステップ表示を流用
    setProcessingMessage("CSVファイルをアップロード中...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      setProcessingSteps(2);
      setProcessingMessage("データをインポート中...");

      const response = await fetch("/api/import-csv", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setProcessingSteps(4);
        setProcessingMessage("インポート完了！");
        toast.success(
          `インポート完了: 新規レシート${result.newReceipts}件、商品${result.newItems}件`
        );
        await fetchReceipts(); // データを再取得して画面を更新
      } else {
        throw new Error(result.error || "CSVインポートに失敗しました");
      }
    } catch (error) {
      console.error("Error importing CSV:", error);
      toast.error(
        error instanceof Error ? error.message : "CSVインポート中にエラーが発生しました"
      );
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingSteps(1);
        setProcessingMessage("");
      }, 2000);
    }
  };

  const confirmReceipt = () => {
    if (currentReceipt) {
      // データベースに既に保存されているので、UIを更新
      fetchReceipts();
      setShowModal(false);
      setCurrentReceipt(null);
    }
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <main className="p-5 grid gap-4">
            {/* 統計カード */}
            <section className="cards grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 合計支出カード */}
              <div className="card bg-white border border-gray-200 rounded-2xl p-4 shadow-sm md:col-span-2">
                <h4 className="text-sm text-gray-500 font-semibold mb-1">
                  総支出額
                </h4>
                <div className="value text-3xl font-extrabold mb-2">
                  {isLoading ? "..." : `¥${stats.totalAmount.toLocaleString()}`}
                </div>
                <div className="trend text-xs text-gray-500">
                  合計: {stats.totalReceipts}件のレシート
                </div>
              </div>

              {/* ユーザーごとの支出カード */}
              {isLoading ? (
                Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="card bg-white border border-gray-200 rounded-2xl p-4 shadow-sm animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))
              ) : (
                stats.userStats.map(userStat => (
                  <div key={userStat.uploader} className="card bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <h4 className="text-sm text-gray-500 font-semibold mb-1 flex items-center gap-2">
                      {userStat.uploader === '夫' ? '🤵' : '👰'}
                      {userStat.uploader} の支出額
                    </h4>
                    <div className="value text-3xl font-extrabold mb-2">
                      ¥{userStat.totalAmount.toLocaleString()}
                    </div>
                    <div className="trend text-xs text-gray-500">
                      {userStat.receiptCount}件のレシート
                    </div>
                  </div>
                ))
              )}
            </section>

            {/* ▼▼▼ 動的にインポートしたグラフコンポーネントを配置 ▼▼▼ */}
            <DynamicDashboardCharts
              userStats={stats.userStats}
              categorySpending={categorySpending}
              isLoading={isLoading}
            />
            
            {/* メインコンテンツ */}
            <section className="content-grid w-full">
              <div className="panel bg-white border border-gray-200 rounded-2xl shadow-sm w-full">
                <h3 className="text-lg font-bold p-3 pb-0">最近のレシート</h3>
                <div className="table-wrap overflow-auto">
                  <table className="w-full border-separate border-spacing-y-2 p-3">
                    <thead>
                      <tr>
                        <th className="text-xs text-gray-500 text-left px-2">
                          日付
                        </th>
                        <th className="text-xs text-gray-500 text-left px-2">
                          店舗
                        </th>
                        <th className="text-xs text-gray-500 text-left px-2">
                          アップロード者
                        </th>
                        <th className="text-xs text-gray-500 text-left px-2">
                          カテゴリ
                        </th>
                        <th className="text-xs text-gray-500 text-right px-2">
                          金額
                        </th>
                        <th className="text-xs text-gray-500 text-left px-2">
                          状態
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-2 py-8 text-center text-gray-500"
                          >
                            データを読み込み中...
                          </td>
                        </tr>
                      ) : receipts.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-2 py-8 text-center text-gray-500"
                          >
                            レシートがありません。右下のボタンからレシートを追加してください。
                          </td>
                        </tr>
                      ) : (
                        receipts.map((receipt) => (
                          <tr
                            key={receipt.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setCurrentReceipt(receipt)
                              setShowModal(true)
                            }}
                          >
                            <td className="px-2 py-3 border-t border-b border-l border-gray-200 rounded-l-lg text-sm">
                              {receipt.transaction_date || "日付不明"}
                            </td>
                            <td className="px-2 py-3 border-t border-b border-gray-200 text-sm">
                              {receipt.store_name || "店舗名不明"}
                            </td>
                            <td className="px-2 py-3 border-t border-b border-gray-200 text-sm">
                              <span className="inline-flex items-center gap-1">
                                {receipt.uploader === '夫' ? '🤵' : '👰'}
                                <span>{receipt.uploader || '夫'}</span>
                              </span>
                            </td>
                            <td className="px-2 py-3 border-t border-b border-gray-200 text-sm">
                              {receipt.items?.[0]?.category || "未分類"}
                            </td>
                            <td className="px-2 py-3 border-t border-b border-gray-200 text-sm text-right font-bold">
                              ¥{receipt.total_amount?.toLocaleString() || "0"}
                            </td>
                            <td className="px-2 py-3 border-t border-b border-r border-gray-200 rounded-r-lg text-sm">
                              <span className="status paid bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-1 rounded-full">
                                確定
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>


            </section>
          </main>
        );

      case "receipts":
        return (
          <main className="p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                レシート一覧 ({stats.totalReceipts}件)
              </h2>
              <button
                onClick={() => setShowFabPop(true)}
                className="btn accent bg-teal-500 text-white px-4 py-2 rounded-lg font-semibold"
              >
                + レシート追加
              </button>
            </div>

            {/* 👇 ここからテーブルをグリッドレイアウトに変更 */}
            {isLoading ? (
              <div className="text-center py-20 text-gray-500">
                データを読み込み中...
              </div>
            ) : receipts.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                レシートがありません。右下のボタンから追加してください。
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {receipts.map((receipt) => (
                  <div
                    key={receipt.id}
                    className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      setCurrentReceipt(receipt);
                      setShowModal(true);
                    }}
                  >
                    {/* 画像サムネイル */}
                    <div className="aspect-w-3 aspect-h-4 mb-4 rounded-lg bg-gray-100 flex items-center justify-center">
                      {receipt.image_path ? (
                        <img
                          src={receipt.image_path}
                          alt={`レシート - ${receipt.store_name}`}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => { e.currentTarget.src = '/placeholder-receipt.png' }}
                        />
                      ) : (
                        // 画像がない場合は、lucide-reactのアイコンを表示
                        <FileText className="text-gray-400 w-16 h-16" />
                      )}
                    </div>
                    {/* レシート情報 */}
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-800 truncate">{receipt.store_name || "店舗名不明"}</p>
                        <p className="text-sm text-gray-500">{receipt.transaction_date || "日付不明"}</p>
                      </div>
                      <span className="text-lg font-bold text-teal-600">
                        ¥{receipt.total_amount?.toLocaleString() || "0"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        );

      default:
        return (
          <main className="p-5">
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {activeTab === "categories" && "カテゴリ分類"}
                {activeTab === "analytics" && "分析・レポート"}
                {activeTab === "budget" && "予算とアラート"}
                {activeTab === "stores" && "店舗・仕入先"}
                {activeTab === "settings" && "設定"}
              </h2>
              <p className="text-gray-600">この機能は開発中です</p>
            </div>
          </main>
        );
    }
  };

  return (
    <div className="app grid grid-cols-[280px_1fr] min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <section className="overflow-y-auto">
        <Header />
        {renderMainContent()}
      </section>

      {/* FAB with embedded popover */}
      <div className="fabwrap fixed right-6 bottom-6 z-40">
        <button
          className="fab fixed right-6 bottom-6 z-40 px-4 py-3 rounded-full font-extrabold bg-teal-500 text-white border-none shadow-lg cursor-pointer"
          onClick={() => setShowFabPop(!showFabPop)}
        >
          🦔 スキャン/アップロード
        </button>

        {showFabPop && (
          <div className="fab-pop absolute right-0 bottom-16 w-96 bg-white border border-gray-200 rounded-2xl shadow-lg p-3">
            <header className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold">レシートの取り込み（複数対応）</h4>
              <button
                className="btn ghost border border-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
                onClick={() => setShowFabPop(false)}
              >
                閉じる
              </button>
            </header>

            {/* 👇 ユーザー選択UIを追加 */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-600 mb-2 block">アップロード者</label>
              <UploaderSelector
                selectedUploader={selectedUploader}
                setSelectedUploader={setSelectedUploader}
              />
            </div>

            <div className="fab-actions grid grid-cols-1 gap-2">
              <div
                className="act flex gap-2 items-center justify-center p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-white"
                onClick={() => setShowCamera(true)}
              >
                📷 カメラで撮影
              </div>
              <div
                className="act flex gap-2 items-center justify-center p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-white"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.multiple = true; // 複数ファイル選択を有効化
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files && files.length > 0) {
                      handleFileUpload(Array.from(files));
                    }
                  };
                  input.click();
                }}
              >
                🗂 画像ファイルを選択（複数可）
              </div>
              {/* CSVインポートボタンを追加 */}
              <div
                className="act flex gap-2 items-center justify-center p-3 border border-dashed border-gray-300 rounded-lg bg-blue-50 text-blue-700 cursor-pointer hover:bg-white"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".csv";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleCsvUpload(file);
                  };
                  input.click();
                }}
              >
                📄 CSVをインポート
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 結果確認モーダル */}
      {showModal && currentReceipt && (
        <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="sheet bg-white rounded-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <header className="flex items-center justify-between p-4 border-b">
              <strong className="text-lg font-bold">抽出結果を確認</strong>
              <button
                className="btn ghost border border-gray-200 text-gray-700 px-3 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                閉じる
              </button>
            </header>

            <div className="body p-4 space-y-6">
              {/* レシート画像 */}
              {currentReceipt.image_path && (
                <div className="bg-gradient-to-r from-sakura-50 to-indigo-50 p-4 rounded-lg border border-washi-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">📄</span>
                    レシート画像
                  </h3>
                  <div className="flex justify-center">
                    <div className="relative group">
                      <img
                        src={currentReceipt.image_path}
                        alt={`レシート - ${currentReceipt.store_name}`}
                        className="max-w-full max-h-64 object-contain rounded-lg shadow-md border border-washi-300"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-receipt.png'
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* 店舗情報 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-3">🏪 店舗情報</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">店舗名</label>
                    <p className="text-lg font-bold text-gray-800">{currentReceipt.store_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">住所</label>
                    <p className="text-gray-700">{currentReceipt.store_address || '住所不明'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">電話番号</label>
                    <p className="text-gray-700">{currentReceipt.store_phone || '電話番号不明'}</p>
                  </div>
                </div>
              </div>

              {/* 取引情報 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-3">📅 取引情報</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">取引日</label>
                    <p className="text-lg font-bold text-gray-800">{currentReceipt.transaction_date}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">取引時刻</label>
                    <p className="text-lg font-bold text-gray-800">{currentReceipt.transaction_time}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">レシート番号</label>
                    <p className="text-gray-700">{currentReceipt.receipt_number || '番号不明'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">支払方法</label>
                    <p className="text-gray-700">{currentReceipt.payment_method}</p>
                  </div>
                </div>
              </div>

              {/* 商品一覧 */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-3">🛒 購入商品 ({currentReceipt.items?.length || 0}点)</h3>
                <div className="space-y-3">
                  {currentReceipt.items?.map((item, index) => (
                    <div key={index} className="bg-white p-3 rounded border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">{item.name}</p>
                          <div className="flex gap-4 text-sm text-gray-600 mt-1">
                            <span className="bg-blue-100 px-2 py-1 rounded text-xs">{item.category}</span>
                            {item.subcategory && (
                              <span className="bg-gray-100 px-2 py-1 rounded text-xs">{item.subcategory}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {item.quantity}個 × ¥{item.unit_price?.toLocaleString()}
                          </p>
                          <p className="font-bold text-lg text-gray-800">
                            ¥{item.total_price?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 金額情報 */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-3">💰 金額詳細</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">小計</span>
                    <span className="font-semibold">¥{currentReceipt.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">税額</span>
                    <span className="font-semibold">¥{currentReceipt.tax?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-lg font-bold text-gray-800">合計金額</span>
                    <span className="text-2xl font-bold text-green-600">¥{currentReceipt.total_amount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                  onClick={() => setShowModal(false)}
                >
                  閉じる
                </button>
                <button
                  className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-semibold"
                  onClick={confirmReceipt}
                >
                  ✅ 確定して保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* プログレスバーモーダル */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center space-y-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mx-auto"></div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-800">レシート処理中</h3>
                <p className="text-gray-600">{processingMessage}</p>
              </div>
              
              {/* プログレスバー */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(processingSteps / 4) * 100}%` }}
                ></div>
              </div>
              
              {/* ステップ表示 */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                {[
                  { id: 1, label: "アップロード" },
                  { id: 2, label: "AI解析" },
                  { id: 3, label: "データ処理" },
                  { id: 4, label: "保存" },
                ].map((step) => (
                  <div
                    key={step.id}
                    className={`text-center p-2 rounded ${
                      processingSteps >= step.id
                        ? "bg-teal-100 text-teal-700 font-semibold"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {step.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* カメラモーダル */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
