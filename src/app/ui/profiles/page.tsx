"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

type Doctor = {
  id: number
  name: string
  email: string
  phone?: string
  specialization: string
  experience: string
  qualification?: string
  profile_image?: string
  hospital?: string
  hospital_address?: string
  fees?: string
  languages?: string[]
  rating?: number
  reviews_count?: number
  available_days?: string[]
  bio?: string
  certifications?: string[]
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export default function ProfilePage() {
  const searchParams = useSearchParams()
  const doctorId = searchParams.get("doctorId")

  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!doctorId) return
    const fetchDoctor = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/doctors/${doctorId}`)
        const data = await res.json()
        if (data.success) {
          setDoctor(data.data)
        } else {
          setError(data.message || "Failed to load doctor")
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchDoctor()
  }, [doctorId])

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading doctor profile...</p>
      </div>
    )

  if (error || !doctor)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error || "Doctor not found"}</p>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/ui/search-dr" className="text-gray-600 hover:text-gray-900 text-sm sm:text-base">
              ← Back
            </Link>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900">Doctor Profile</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-6">
          {/* Doctor Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
            <img
              src={doctor.profile_image || "/images/doctor-avatar-1.jpg"}
              alt={doctor.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-500 mx-auto sm:mx-0"
            />
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{doctor.name}</h2>
              <p className="text-blue-600 font-medium">{doctor.specialization}</p>
              {doctor.rating && (
                <p className="text-sm text-gray-600">
                  ⭐ {doctor.rating} ({doctor.reviews_count || 0} reviews)
                </p>
              )}
            </div>
          </div>

          {/* Doctor Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm sm:text-base">
            {doctor.experience && (
              <p>
                <span className="font-semibold">Experience:</span> {doctor.experience} years
              </p>
            )}
            {doctor.qualification && (
              <p>
                <span className="font-semibold">Qualification:</span> {doctor.qualification}
              </p>
            )}
            {doctor.email && (
              <p>
                <span className="font-semibold">Email:</span> {doctor.email}
              </p>
            )}
            {doctor.phone && (
              <p>
                <span className="font-semibold">Phone:</span> {doctor.phone}
              </p>
            )}
            {doctor.hospital && (
              <p>
                <span className="font-semibold">Hospital:</span> {doctor.hospital}
              </p>
            )}
            {doctor.hospital_address && (
              <p>
                <span className="font-semibold">Address:</span> {doctor.hospital_address}
              </p>
            )}
            {doctor.fees && (
              <p>
                <span className="font-semibold">Consultation Fees:</span> {doctor.fees}
              </p>
            )}
            {doctor.languages && doctor.languages.length > 0 && (
              <p>
                <span className="font-semibold">Languages:</span> {doctor.languages.join(", ")}
              </p>
            )}
            {doctor.available_days && doctor.available_days.length > 0 && (
              <p>
                <span className="font-semibold">Available Days:</span> {doctor.available_days.join(", ")}
              </p>
            )}
            {doctor.certifications && doctor.certifications.length > 0 && (
              <p>
                <span className="font-semibold">Certifications:</span> {doctor.certifications.join(", ")}
              </p>
            )}
          </div>

          {/* Bio */}
          {doctor.bio && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About Doctor</h3>
              <p className="text-gray-700 text-sm sm:text-base">{doctor.bio}</p>
            </div>
          )}

          {/* Book Appointment */}
          <Link
            href={`/ui/appointment-date?doctorId=${doctor.id}`}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base sm:text-lg font-semibold rounded-lg transition-colors block text-center"
          >
            BOOK APPOINTMENT
          </Link>
        </div>
      </main>
    </div>
  )
}
