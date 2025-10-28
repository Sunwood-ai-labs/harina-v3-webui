"use client";

import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import { ReceiptData } from '../types';

// Chart.js の必要なモジュールを登録
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

// --- 円グラフコンポーネント ---
const UserSpendingPieChart = ({ userStats }: { userStats: { uploader: string; totalAmount: number }[] }) => {
  const data = {
    labels: userStats.map(stat => stat.uploader),
    datasets: [
      {
        label: '支出額',
        data: userStats.map(stat => stat.totalAmount),
        backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // アスペクト比を維持しない
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false },
    },
  };

  return <Doughnut data={data} options={options} />;
};

// --- 折れ線グラフコンポーネント ---
const CategorySpendingLineChart = ({ categorySpending }: { categorySpending: { [key: string]: number } }) => {
  const data = {
    labels: Object.keys(categorySpending),
    datasets: [
      {
        label: 'カテゴリ別支出',
        data: Object.values(categorySpending),
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.3,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false, // アスペクト比を維持しない
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => `¥${Number(value).toLocaleString()}`
        }
      }
    }
  };

  return <Line data={data} options={options} />;
};


// --- 上記2つのグラフをまとめるコンポーネント ---
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
        <h3 className="text-lg font-bold mb-4">ユーザー別支出割合</h3>
        <div className="relative h-64">
          <UserSpendingPieChart userStats={userStats} />
        </div>
      </div>
      <div className="panel bg-white border border-gray-200 rounded-2xl p-4 shadow-sm lg:col-span-3">
        <h3 className="text-lg font-bold mb-4">カテゴリ別支出</h3>
        <div className="relative h-64">
          <CategorySpendingLineChart categorySpending={categorySpending} />
        </div>
      </div>
    </section>
  );
}
