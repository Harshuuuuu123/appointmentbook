import Sidebar from "@/components/layout/sidebar"
import StatusUpdate from "@/components/status/status-update"

export default function StatusPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <StatusUpdate />
      </main>
    </div>
  )
}
