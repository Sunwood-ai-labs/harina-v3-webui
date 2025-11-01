"use client";

import { useEffect, useState, type ReactNode, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Settings as SettingsIcon,
  Menu,
  X,
  CopyCheck,
  Scan,
} from "lucide-react";

type NavIcon = ComponentType<{ size?: number | string }>;

type NavItem = {
  href: string;
  label: string;
  icon: NavIcon;
  external?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/receipts", label: "レシート一覧", icon: Receipt },
  { href: "/duplicates", label: "重複チェック", icon: CopyCheck },
  { href: "/analytics", label: "分析・レポート", icon: BarChart3 },
  { href: "/settings", label: "設定", icon: SettingsIcon },
];

const DEFAULT_DISCORD_CHANNEL_URL =
  "https://discord.com/channels/1208743618345435226/1432639380522143754";

const DISCORD_CHANNEL_URL =
  process.env.NEXT_PUBLIC_DISCORD_CHANNEL_URL || DEFAULT_DISCORD_CHANNEL_URL;

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navItems: NavItem[] = DISCORD_CHANNEL_URL
    ? [
        ...NAV_ITEMS,
        {
          href: DISCORD_CHANNEL_URL,
          label: "Discordチャンネル",
          icon: Scan,
          external: true,
        },
      ]
    : NAV_ITEMS;
  const ScanButton = ({ className = "" }: { className?: string }) => {
    if (!DISCORD_CHANNEL_URL) return null;
    return (
      <a
        href={DISCORD_CHANNEL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-teal-600 ${className}`}
        aria-label="Discordでスキャンする"
      >
        <Scan size={18} />
        スキャン
      </a>
    );
  };
  const FloatingScanButton = () => {
    if (!DISCORD_CHANNEL_URL) return null;
    return (
      <a
        href={DISCORD_CHANNEL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-teal-500 px-5 py-3 text-base font-bold text-white shadow-2xl hover:bg-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label="Discordでスキャンする"
      >
        <Scan size={22} />
        スキャン
      </a>
    );
  };

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
            {navItems.map((item) => {
              const isActive = !item.external && pathname === item.href;
              const Icon = item.icon;
              const baseClass = `flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                isActive ? "bg-teal-500 text-white shadow" : "text-sumi-600 hover:bg-washi-200"
              }`;

              if (item.external) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${baseClass} hover:text-teal-600`}
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/60 border border-washi-300">
                      <Icon size={18} />
                    </span>
                    <span className="font-semibold text-sm">{item.label}</span>
                  </a>
                );
              }

              return (
                <Link key={item.href} href={item.href} className={baseClass}>
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
            {DISCORD_CHANNEL_URL && (
              <ScanButton className="mt-2 justify-center w-full" />
            )}
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
        <FloatingScanButton />
      </div>
    </div>
  );
}
