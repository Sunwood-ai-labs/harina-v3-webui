"use client";

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Title,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { ReceiptData } from '../types';

// Chart.js の必要なモジュールを登録
ChartJS.register(
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Title
);

interface StatsState {
  totalReceipts: number;
  totalAmount: number;
  totalItems: number;
  avgAmount: number;
  userStats: { uploader: string; totalAmount: number; receiptCount: number }[];
}

interface DashboardChartsProps {
  receipts: ReceiptData[];
  categorySpending: { [key: string]: number };
  stats: StatsState;
}

export default function DashboardCharts({ receipts, categorySpending, stats }: DashboardChartsProps) {
  const userStats = stats.userStats ?? [];

  const isLoading = receipts.length === 0 && userStats.length === 0 && Object.keys(categorySpending).length === 0;

  const colorPalette = [
    'rgba(56, 189, 248, 0.7)',
    'rgba(96, 165, 250, 0.7)',
    'rgba(192, 132, 252, 0.7)',
    'rgba(244, 114, 182, 0.7)',
    'rgba(16, 185, 129, 0.7)',
    'rgba(251, 191, 36, 0.7)',
    'rgba(244, 63, 94, 0.7)',
    'rgba(165, 180, 252, 0.7)',
  ];

  const categoryEntries = Object.entries(categorySpending)
    .filter(([, value]) => Number.isFinite(value) && value > 0)
    .slice(0, 8);

  const categoryLabels = categoryEntries.map(([category]) => category);
  const categoryValues = categoryEntries.map(([, value]) => value);

  const categoryData = {
    labels: categoryLabels,
    datasets: [
      {
        label: 'カテゴリ別支出',
        data: categoryValues,
        backgroundColor: categoryLabels.map((_, index) => colorPalette[index % colorPalette.length]),
        borderRadius: 12,
        maxBarThickness: 48,
      },
    ],
  };

  const categoryOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const parsed = context.parsed as unknown;
            const value =
              typeof parsed === 'object' && parsed !== null && 'y' in parsed
                ? Number((parsed as { y: number }).y)
                : Number(parsed ?? 0);
            return `¥${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#475467', maxRotation: 45, minRotation: 0 },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#475467',
          callback: (value) => `¥${Number(value).toLocaleString()}`,
        },
        grid: { color: 'rgba(148, 163, 184, 0.2)' },
      },
    },
  };

  const monthlyTotals = receipts.reduce((acc, receipt) => {
    if (!receipt.transaction_date) return acc;

    const [year, month] = receipt.transaction_date.split('-');
    if (!year || !month) return acc;

    const key = `${year}-${month}`;
    const amount = receipt.total_amount ?? 0;

    return acc.set(key, (acc.get(key) ?? 0) + amount);
  }, new Map<string, number>());

  const monthlyEntries = Array.from(monthlyTotals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6); // 直近6ヶ月を表示

  const monthlyLabels = monthlyEntries.map(([key]) => {
    const [year, month] = key.split('-');
    const monthNumber = Number(month);
    return `${Number(year)}年${monthNumber}月`;
  });

  const monthlyValues = monthlyEntries.map(([, value]) => value);

  const monthlyData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: '月別支出',
        data: monthlyValues,
        backgroundColor: monthlyLabels.map((_, index) => colorPalette[(index + 2) % colorPalette.length]),
        borderRadius: 12,
        maxBarThickness: 48,
      },
    ],
  };

  const monthlyOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const parsed = context.parsed as unknown;
            const value =
              typeof parsed === 'object' && parsed !== null && 'y' in parsed
                ? Number((parsed as { y: number }).y)
                : Number(parsed ?? 0);
            return `¥${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#475467' },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#475467',
          callback: (value) => `¥${Number(value).toLocaleString()}`,
        },
        grid: { color: 'rgba(148, 163, 184, 0.2)' },
      },
    },
  };

  const topUploaders = [...userStats]
    .sort((a, b) => (b.totalAmount ?? 0) - (a.totalAmount ?? 0))
    .slice(0, 3);

  if (isLoading) {
    return (
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="panel bg-white border border-gray-200 rounded-2xl p-4 shadow-sm lg:col-span-2 animate-pulse h-[320px]"></div>
        <div className="panel bg-white border border-gray-200 rounded-2xl p-4 shadow-sm lg:col-span-3 animate-pulse h-[320px]"></div>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="panel bg-white border border-gray-200 rounded-2xl p-4 shadow-sm lg:col-span-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-sumi-900">カテゴリ別支出 (棒グラフ)</h3>
          <span className="text-xs text-sumi-500">上位 {categoryLabels.length} カテゴリ</span>
        </div>
        <div className="relative h-64">
          {categoryLabels.length > 0 ? (
            <Bar data={categoryData} options={categoryOptions} />
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-sumi-500">
              カテゴリ別の支出データがありません。
            </p>
          )}
        </div>
      </div>
      <div className="panel bg-white border border-gray-200 rounded-2xl p-4 shadow-sm lg:col-span-3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-sumi-900">月別支出 (棒グラフ)</h3>
          <span className="text-xs text-sumi-500">直近6ヶ月</span>
        </div>
        <div className="relative h-64">
          {monthlyLabels.length > 0 ? (
            <Bar data={monthlyData} options={monthlyOptions} />
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-sumi-500">
              月別の支出データがありません。
            </p>
          )}
        </div>
        {topUploaders.length > 0 && (
          <div className="border border-washi-200 rounded-2xl p-4 bg-washi-50">
            <p className="text-sm font-semibold text-sumi-700 mb-2">アップロード者別トップ3</p>
            <ul className="space-y-2 text-sm text-sumi-600">
              {topUploaders.map((stat) => (
                <li key={stat.uploader} className="flex items-center justify-between">
                  <span>{stat.uploader || "不明"}</span>
                  <span className="font-semibold text-sumi-900">
                    ¥{(stat.totalAmount ?? 0).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
