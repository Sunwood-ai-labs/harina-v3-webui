import ProcessingPromptSettings from './ProcessingPromptSettings'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-washi-100 px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-sumi-900 mb-2">設定</h1>
          <p className="text-sumi-500 text-sm">
            レシート処理時の追加プロンプトを管理できます。ルールを追記して、分類の精度を高めましょう。
          </p>
        </header>

        <ProcessingPromptSettings />
      </div>
    </div>
  )
}
