"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Settings as SettingsIcon,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/receipts", label: "レシート一覧", icon: Receipt },
  { href: "/analytics", label: "分析・レポート", icon: BarChart3 },
  { href: "/settings", label: "設定", icon: SettingsIcon },
];

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const listener = () => setIsSidebarOpen((prev) => !prev);
    window.addEventListener("toggle-sidebar" as any, listener as EventListener);
    return () => window.removeEventListener("toggle-sidebar" as any, listener as EventListener);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen bg-washi-100 text-sumi-900">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-washi-300 bg-white/95 backdrop-blur-xl shadow-xl transition-transform duration-200 ease-in-out lg:translate-x-0 lg:shadow-none lg:z-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="px-5 pt-5 pb-6 h-full flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🦔</span>
              <div>
                <p className="text-sm font-semibold text-sumi-500 uppercase tracking-wide">HARINA v3</p>
                <p className="text-lg font-bold text-sumi-900">Receipt Center</p>
              </div>
            </div>
            <button
              type="button"
              className="lg:hidden rounded-full border border-washi-300 p-1 text-sumi-500"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="メニューを閉じる"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                    isActive
                      ? "bg-teal-500 text-white shadow"
                      : "text-sumi-600 hover:bg-washi-200"
                  }`}
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/60 border border-washi-300">
                    <Icon size={18} />
                  </span>
                  <span className="font-semibold text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="rounded-2xl border border-washi-300 bg-washi-200/60 px-4 py-3 text-xs text-sumi-600">
            <p className="font-semibold mb-1">今日のヒント</p>
            <p>Discordからアップロードしたレシートは、自動的にタグ付けされて検索が簡単になります。</p>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 min-h-screen lg:ml-72">
        <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-washi-300 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            className="rounded-xl border border-washi-300 bg-white p-2 text-sumi-600"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="メニューを開く"
          >
            <Menu size={18} />
          </button>
          <p className="text-sm font-semibold text-sumi-600">メニュー</p>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
