"use client";

import { useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { ReceiptData } from "../../types";
import { toast } from "react-toastify";
import { TrendingUp, PieChart, CalendarDays, Users } from "lucide-react";

const DynamicDashboardCharts = dynamic(() => import("../../components/DashboardCharts"), {
  ssr: false,
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

type StatsState = {
  totalReceipts: number;
  totalAmount: number;
  totalItems: number;
  avgAmount: number;
  userStats: { uploader: string; totalAmount: number; receiptCount: number }[];
};

export default function DashboardPage() {
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [stats, setStats] = useState<StatsState>({
    totalReceipts: 0,
    totalAmount: 0,
    totalItems: 0,
    avgAmount: 0,
    userStats: [],
  });
  const [categorySpending, setCategorySpending] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const response = await fetch("/api/receipts?stats=true");
      if (!response.ok) {
        throw new Error("ダッシュボードデータの取得に失敗しました");
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

      const spending: Record<string, number> = {};
      (data.receipts || []).forEach((receipt: ReceiptData) => {
        receipt.items?.forEach((item) => {
          if (!item.category) return;
          spending[item.category] = (spending[item.category] || 0) + (item.total_price || 0);
        });
      });
      const sorted = Object.fromEntries(
        Object.entries(spending).sort(([, a], [, b]) => b - a)
      );
      setCategorySpending(sorted);
    } catch (error) {
      console.error(error);
      toast.error("ダッシュボードデータの読み込みに失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-washi-100 px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold text-sumi-900">ダッシュボード</h1>
        <p className="text-sumi-500 text-sm">
          家計とレシートのハイライトをリアルタイムに確認できます。
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="総支出額"
          value={`¥${stats.totalAmount.toLocaleString()}`}
          description="今月の累計"
          icon={<TrendingUp size={20} />}
          tone="teal"
        />
        <MetricCard
          title="平均レシート額"
          value={`¥${stats.avgAmount.toLocaleString()}`}
          description="1レシートあたり"
          icon={<PieChart size={20} />}
          tone="indigo"
        />
        <MetricCard
          title="登録レシート"
          value={`${stats.totalReceipts.toLocaleString()} 件`}
          description="累計枚数"
          icon={<CalendarDays size={20} />}
          tone="matcha"
        />
        <MetricCard
          title="登録者"
          value={`${stats.userStats.length.toLocaleString()} 名`}
          description="アクティブユーザー"
          icon={<Users size={20} />}
          tone="sakura"
        />
      </section>

      <DynamicDashboardCharts
        receipts={receipts}
        categorySpending={categorySpending}
        stats={stats}
      />

      <section className="bg-white border border-washi-300 rounded-3xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-sumi-900 mb-4">最近追加されたレシート</h2>
        {receipts.slice(0, 5).map((receipt) => (
          <div
            key={receipt.id}
            className="flex items-center justify-between py-3 border-b border-washi-200 last:border-none"
          >
            <div>
              <p className="font-semibold text-sumi-900">{receipt.store_name || "店舗名不明"}</p>
              <p className="text-xs text-sumi-500">{receipt.transaction_date} / {receipt.payment_method}</p>
            </div>
            <span className="text-sm font-semibold text-teal-600">
              ¥{receipt.total_amount?.toLocaleString() || "0"}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon,
  tone = "teal",
}: {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  tone?: "teal" | "indigo" | "matcha" | "sakura";
}) {
  const palette: Record<string, { bg: string; text: string; border: string }> = {
    teal: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
    matcha: { bg: "bg-matcha-50", text: "text-matcha-900", border: "border-matcha-300" },
    sakura: { bg: "bg-sakura-50", text: "text-sakura-700", border: "border-sakura-200" },
  };
  const tonePalette = palette[tone] ?? palette.teal;

  return (
    <div className={`bg-white border border-washi-300 rounded-3xl p-5 shadow-sm flex gap-4 items-center`}>
      <span className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${tonePalette.bg} ${tonePalette.border} border text-xl`}>{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wide text-sumi-500">{title}</p>
        <p className={`text-2xl font-bold ${tonePalette.text}`}>{value}</p>
        <p className="text-xs text-sumi-500 mt-1">{description}</p>
      </div>
    </div>
  );
}
