import { Sidebar } from "@/components/layout/sidebar"
import { ReportsContent } from "@/components/reports/reports-content"

export default function ReportsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <ReportsContent />
      </main>
    </div>
  )
}
