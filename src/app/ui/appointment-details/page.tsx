"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function AppointmentDetails() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!id) return

    const fetchAppointment = async () => {
      try {
        const res = await fetch(`/api/appointment/${id}`)
        const data = await res.json()
        if (res.ok) {
          setAppointment(data.data)
        } else {
          console.error(data.message)
        }
      } catch (error) {
        console.error("Failed to fetch appointment:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointment()
  }, [id])

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>
  }

  if (!appointment) {
    return <p className="text-center mt-10 text-red-500">Appointment not found</p>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/ui/appointment-date" className="text-gray-600 hover:text-gray-900">
              ← Back
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Appointment Details</h1>
            <div></div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Doctor Card */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <img
                  src="/images/doctor-avatar-1.jpg"
                  alt={appointment.doctor_name || "Doctor"}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{appointment.doctor_name}</h2>
                <p className="text-sm sm:text-base text-gray-600">{appointment.hospital || "Apollo Hospital"}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <span className="text-amber-600">★</span>
                    <span className="text-sm sm:text-base font-medium ml-1">4.8</span>
                  </div>
                  <span className="text-sm sm:text-base font-medium text-gray-900">
                    Hourly Rate: ${appointment.payment_amount || 25}
                  </span>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Date</span>
                  <p className="font-medium">{appointment.date}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Time</span>
                  <p className="font-medium">{appointment.time}</p>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Message</h3>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a message for the doctor"
                className="w-full p-4 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <Link
              href={`/ui/payment?id=${appointment.id}`}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-6 block text-center"
            >
              Next
            </Link>
          </div>

          {/* Appointment Summary */}
          <div className="flex-1 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Appointment Summary</h3>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Doctor Information</h4>
                <p className="text-sm sm:text-base text-gray-600">{appointment.doctor_name} - Pediatrician</p>
                <p className="text-sm sm:text-base text-gray-600">{appointment.hospital || "Apollo Hospital"}</p>
                <p className="text-sm sm:text-base text-gray-600">Rating: 4.8/5 ★</p>
              </div>

              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Appointment Details</h4>
                <p className="text-sm sm:text-base text-gray-600">Date: {appointment.date}</p>
                <p className="text-sm sm:text-base text-gray-600">Time: {appointment.time}</p>
                <p className="text-sm sm:text-base text-gray-600">
                  Duration: {appointment.consultation_duration || 30} minutes
                </p>
              </div>

              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Payment Information</h4>
                <p className="text-sm sm:text-base text-gray-600">
                  Consultation Fee: ${appointment.payment_amount || 25.0}
                </p>
                <p className="text-sm sm:text-base text-gray-600">Platform Fee: $2.00</p>
                <p className="text-sm sm:text-base font-medium text-gray-900 border-t pt-2 mt-2">
                  Total: ${(appointment.payment_amount || 25.0) + 2}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
