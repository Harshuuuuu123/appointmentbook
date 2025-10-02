import { Sidebar } from "@/components/layout/sidebar"
import { PatientsContent } from "@/components/patients/patients-content"

export default function PatientsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <PatientsContent />
      </main>
    </div>
  )
}
