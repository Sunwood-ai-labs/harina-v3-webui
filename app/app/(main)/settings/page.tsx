import CategorySyncCard from './CategorySyncCard'
import ProcessingPromptSettings from './ProcessingPromptSettings'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-washi-100 px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-sumi-900 mb-2">設定</h1>
          <p className="text-sumi-500 text-sm">
            HARINA サーバーのカテゴリ同期や、レシート処理時の追加プロンプトを管理できます。必要に応じてルールを追記したり、最新の分類へ更新してね。
          </p>
        </header>

        <CategorySyncCard />
        <ProcessingPromptSettings />
      </div>
    </div>
  )
}
