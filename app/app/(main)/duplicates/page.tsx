"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  AlertCircle,
  CheckSquare,
  FileSearch,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";

type DuplicateReceiptSummary = {
  id: number;
  filename: string | null;
  store_name: string | null;
  transaction_date: string | null;
  transaction_time: string | null;
  total_amount: number | null;
  uploader: string | null;
  processed_at: string | null;
  image_path: string | null;
  model_used: string | null;
};

type DuplicateGroup = {
  transactionDate: string | null;
  storeName: string | null;
  totalAmount: number;
  receipts: DuplicateReceiptSummary[];
};

export default function DuplicatesPage() {
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalDuplicateReceipts = useMemo(
    () => groups.reduce((acc, group) => acc + group.receipts.length, 0),
    [groups]
  );

  const formatModel = (model?: string | null) =>
    model?.trim() || "gemini/gemini-2.5-flash";

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const fetchDuplicates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/receipts/duplicates");
      if (!response.ok) {
        throw new Error("重複レシートの取得に失敗しました");
      }
      const data = await response.json();
      setGroups(Array.isArray(data.groups) ? data.groups : []);
      setSelectedIds([]);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "重複レシートの取得に失敗しました"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchDuplicates();
  }, []);

  const toggleSelection = (receiptId: number) => {
    setSelectedIds((prev) =>
      prev.includes(receiptId)
        ? prev.filter((id) => id !== receiptId)
        : [...prev, receiptId]
    );
  };

  const toggleGroupSelection = (group: DuplicateGroup) => {
    const ids = group.receipts.map((receipt) => receipt.id);
    const hasAllSelected = ids.every((id) => selectedIdSet.has(id));

    setSelectedIds((prev) => {
      if (hasAllSelected) {
        return prev.filter((id) => !ids.includes(id));
      }
      const merged = new Set([...prev, ...ids]);
      return Array.from(merged);
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      toast.info("削除するレシートを選択してください");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch("/api/receipts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "レシートの削除に失敗しました");
      }

      toast.success("選択したレシートを削除しました");
      await fetchDuplicates();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "レシートの削除に失敗しました"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-washi-100 px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-sumi-900">重複チェック</h1>
        <p className="text-sumi-500 text-sm">
          重複が疑われるレシートを自動抽出したよ。グループごとに比較して、不要なレシートを削除してね。
        </p>
      </header>

      <section className="bg-white border border-washi-300 rounded-3xl shadow-sm p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sumi-700">
            <FileSearch className="text-teal-600" size={22} />
            <div>
              <p className="text-sm font-semibold">検出された重複グループ</p>
              <p className="text-xs text-sumi-500">
                {groups.length} グループ / {totalDuplicateReceipts} 件のレシート
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={fetchDuplicates}
              className="inline-flex items-center gap-2 rounded-xl border border-washi-300 bg-white px-4 py-2 text-sm font-semibold text-sumi-600 hover:bg-washi-100 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              {isLoading ? "スキャン中..." : "重複スキャンを再実行"}
            </button>
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={selectedIds.length === 0 || isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={16} />}
              {isDeleting ? "削除中..." : `選択した${selectedIds.length}件を削除`}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatTile
            icon={<FileSearch size={18} />}
            label="重複グループ"
            value={`${groups.length}`}
          />
          <StatTile
            icon={<CheckSquare size={18} />}
            label="選択中のレシート"
            value={`${selectedIds.length}`}
          />
          <StatTile
            icon={<AlertCircle size={18} />}
            label="検出されたレシート"
            value={`${totalDuplicateReceipts}`}
          />
          <StatTile
            icon={<RefreshCw size={18} />}
            label="最終スキャン状況"
            value={isLoading ? "スキャン中" : "最新"}
          />
        </div>
      </section>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-sumi-500">
          <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
          <p className="mt-4 text-sm">重複をチェック中だよ〜</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-20 text-sumi-500">
          <p className="text-lg font-semibold">重複レシートは検出されなかったよ！</p>
          <p className="text-sm mt-2">新しいレシートが追加されたら、またスキャンしてみてね。</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group, index) => {
            const groupIds = group.receipts.map((receipt) => receipt.id);
            const groupSelectedCount = groupIds.filter((id) => selectedIdSet.has(id)).length;
            const isAllGroupSelected = groupSelectedCount === groupIds.length;

            return (
              <section
                key={`${group.transactionDate}-${group.storeName}-${group.totalAmount}-${index}`}
                className="bg-white border border-washi-300 rounded-3xl shadow-sm"
              >
                <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-washi-200">
                  <div>
                    <h2 className="text-lg font-semibold text-sumi-900">
                      {group.storeName || "店舗名不明"} / {group.transactionDate || "日付不明"}
                    </h2>
                    <p className="text-sm text-sumi-500">
                      合計金額: ¥{group.totalAmount.toLocaleString()} / {group.receipts.length} 件
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleGroupSelection(group)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                      isAllGroupSelected
                        ? "bg-teal-500 text-white hover:bg-teal-600"
                        : "bg-washi-200 text-sumi-600 hover:bg-washi-300"
                    }`}
                  >
                    <CheckSquare size={14} />
                    {isAllGroupSelected ? "グループ選択解除" : "グループを選択"}
                  </button>
                </header>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-washi-200">
                    <thead className="bg-washi-100 text-xs uppercase tracking-wide text-sumi-500">
                      <tr>
                        <th className="px-4 py-3 text-left">選択</th>
                        <th className="px-4 py-3 text-left">レシートID</th>
                        <th className="px-4 py-3 text-left">アップロード者</th>
                        <th className="px-4 py-3 text-left">登録日時</th>
                        <th className="px-4 py-3 text-left">備考</th>
                        <th className="px-4 py-3 text-left">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-washi-100 text-sm text-sumi-700">
                      {group.receipts.map((receipt) => {
                        const isChecked = selectedIdSet.has(receipt.id);
                        return (
                          <tr key={receipt.id} className="hover:bg-washi-100/70">
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-washi-400 text-teal-600 focus:ring-teal-500"
                                checked={isChecked}
                                onChange={() => toggleSelection(receipt.id)}
                              />
                            </td>
                            <td className="px-4 py-3 font-semibold text-sumi-900">#{receipt.id}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1">
                                {receipt.uploader === "夫" ? "🤵" : receipt.uploader === "嫁" ? "👰" : "👤"}
                                <span>{receipt.uploader || "—"}</span>
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs">
                              <p>{receipt.processed_at ? new Date(receipt.processed_at).toLocaleString() : "—"}</p>
                              <p className="text-sumi-500">
                                {receipt.transaction_time ? `取引時刻: ${receipt.transaction_time}` : ""}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-xs text-sumi-500 space-y-1">
                              <div>{receipt.filename || receipt.image_path || "—"}</div>
                              <div className="inline-flex items-center gap-1 rounded-lg bg-washi-200 px-2 py-1 text-[11px] font-semibold text-sumi-600">
                                <AlertCircle size={11} className="text-teal-600" />
                                {formatModel(receipt.model_used)}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Link
                                href={`/receipts/${receipt.id}`}
                                className="inline-flex items-center gap-1 rounded-lg border border-washi-300 px-3 py-1 text-xs font-semibold text-sumi-600 hover:border-teal-300 hover:text-teal-600"
                              >
                                詳細を開く
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-washi-300 bg-white px-4 py-3 shadow-sm">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-washi-200 text-sumi-600">
        {icon}
      </span>
      <div>
        <p className="text-xs text-sumi-500 uppercase tracking-wide">{label}</p>
        <p className="text-lg font-semibold text-sumi-900">{value}</p>
      </div>
    </div>
  );
}
