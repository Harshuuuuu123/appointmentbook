import Sidebar from "@/components/layout/sidebar"
import StaffProfile from "@/components/staff/staff-profile"

interface StaffProfilePageProps {
  params: {
    id: string
  }
}

export default function StaffProfilePage({ params }: StaffProfilePageProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <StaffProfile staffId={params.id} />
      </main>
    </div>
  )
}
