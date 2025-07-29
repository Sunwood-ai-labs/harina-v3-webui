import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Receipt AI - レシート認識アプリ',
  description: '最新のAI技術でレシートを瞬時に認識・データ化。Gemini、GPT-4o、Claudeに対応したモダンなレシート管理アプリ',
  keywords: 'レシート認識, AI, OCR, 家計簿, 経費管理',
  authors: [{ name: 'Receipt AI Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={inter.variable}>
      <body className="font-sans">
        {children}
        <ToastContainer
          position="top-center"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastClassName="backdrop-blur-sm bg-white/90 border border-slate-200 shadow-lg"
          bodyClassName="text-slate-800"
          progressClassName="bg-gradient-to-r from-blue-500 to-indigo-500"
        />
      </body>
    </html>
  )
}