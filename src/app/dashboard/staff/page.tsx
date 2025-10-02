import Sidebar from "@/components/layout/sidebar"
import StaffContent from "@/components/staff/staff-content"

export default function StaffPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <StaffContent />
      </main>
    </div>
  )
}
