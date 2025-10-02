import { Sidebar } from "@/components/layout/sidebar"
import { SettingsContent } from "@/components/settings/settings-content"

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <SettingsContent />
      </main>
    </div>
  )
}
