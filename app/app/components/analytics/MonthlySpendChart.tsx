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
import type { AnalyticsMonthlySummary } from '../../types'

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend)

const PALETTE = [
  '#0ea5a4',
  '#4a90c2',
  '#739f54',
  '#e85d5d',
  '#f59e0b',
  '#a855f7',
  '#ec4899',
  '#14b8a6',
]

interface MonthlySpendChartProps {
  data: AnalyticsMonthlySummary[]
  selectedUploaders: string[]
}

function MonthlySpendChartComponent({ data, selectedUploaders }: MonthlySpendChartProps) {
  const { labels, datasets } = useMemo(() => {
    const labels = data.map((entry) => entry.label)
    const uploaderSet = new Set<string>()

    data.forEach((entry) => {
      entry.uploaderBreakdown.forEach((uploader) => {
        uploaderSet.add(uploader.uploader)
      })
    })

    const activeUploaders = selectedUploaders.length > 0 ? selectedUploaders : Array.from(uploaderSet)

    const datasets = activeUploaders.map((uploader, index) => {
      const color = PALETTE[index % PALETTE.length]
      return {
        label: uploader,
        data: data.map((entry) => {
          const breakdown = entry.uploaderBreakdown.find((item) => item.uploader === uploader)
          return breakdown ? breakdown.totalAmount : 0
        }),
        backgroundColor: color,
        borderRadius: 10,
        maxBarThickness: 42,
        stack: 'monthly-uploader',
      }
    })

    return { labels, datasets }
  }, [data, selectedUploaders])

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = Number(context.parsed.y ?? context.parsed ?? 0)
            return `${context.dataset.label}: ¥${value.toLocaleString()}`
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          font: { size: 12 },
        },
      },
      y: {
        stacked: true,
        ticks: {
          callback: (value: string | number) => `¥${Number(value).toLocaleString()}`,
        },
      },
    },
  }), [])

  return (
    <div className="relative h-80">
      <Bar data={{ labels, datasets }} options={options} />
    </div>
  )
}

export const MonthlySpendChart = memo(MonthlySpendChartComponent)
