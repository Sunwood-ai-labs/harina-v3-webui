'use client'

import { memo, useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import type { AnalyticsTopCategory } from '../../types'

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend)

interface TopCategoryChartProps {
  categories: AnalyticsTopCategory[]
  title?: string
}

function TopCategoryChartComponent({ categories, title }: TopCategoryChartProps) {
  const chartData = useMemo(() => {
    const sorted = [...categories].sort((a, b) => b.totalAmount - a.totalAmount)
    const labels = sorted.map((item) => `${item.category} (${item.uploader === 'All' ? '全体' : item.uploader})`)
    const data = sorted.map((item) => item.totalAmount)

    return {
      labels,
      datasets: [
        {
          label: '金額',
          data,
          backgroundColor: '#f18a8a',
          borderRadius: 10,
          maxBarThickness: 36,
        },
      ],
    }
  }, [categories])

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: Boolean(title),
        text: title ?? '',
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `¥${Number(context.parsed.x ?? 0).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: (value: string | number) => `¥${Number(value).toLocaleString()}`,
        },
      },
      y: {
        ticks: {
          font: { size: 12 },
        },
      },
    },
  }), [title])

  return (
    <div className="relative h-72">
      <Bar data={chartData} options={options} />
    </div>
  )
}

export const TopCategoryChart = memo(TopCategoryChartComponent)
