import Sidebar from "@/components/layout/sidebar"
import PatientDetails from "@/components/patients/patient-details"

interface PatientPageProps {
  params: { id: string }
}

export default function PatientPage({ params }: PatientPageProps) {
  const patientId = params.id

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <PatientDetails patientId={patientId} />
      </main>
    </div>
  )
}
