import type { Metadata, Viewport } from 'next'
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
  title: 'HARINA v3 — レシート管理 Web UI',
  description: 'AI搭載レシート認識システム。Gemini、GPT-4o、Claudeに対応したモダンなレシート管理アプリ',
  keywords: 'レシート認識, AI, OCR, 家計簿, 経費管理, HARINA',
  authors: [{ name: 'HARINA Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={inter.variable}>
      <head>
        <link rel="icon" href='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="%23fff"/><g transform="translate(6,10)"><path d="M8 20 L12 10 L16 20 L20 9 L24 20 L28 8 L32 20 L36 10 L40 20" stroke="%2322232a" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="26" cy="28" rx="22" ry="14" fill="%2322232a"/><circle cx="42.2" cy="27" r="1.1" fill="%2322232a"/><circle cx="38.2" cy="27" r="1.1" fill="%2322232a"/><circle cx="44.8" cy="31.6" r="1.4" fill="%2322232a"/><rect x="2" y="30" width="8" height="4" rx="2" fill="%23fff"/></g></svg>' />
      </head>
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
