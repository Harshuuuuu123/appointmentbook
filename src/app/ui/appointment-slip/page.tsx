"use client"
import Link from "next/link"
import Image from "next/image"

export default function AppointmentSlip() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/ui/appointment-details" className="text-gray-600 hover:text-gray-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Appointment Slip</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          {/* Appointment Date & Time */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Friday, 25th August 2023</h2>
            <p className="text-gray-600">at 11:00 AM</p>
          </div>

          <hr className="my-6" />

          {/* Doctor Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-16 h-16">
              <Image
                src="/images/doctor-avatar-1.jpg"
                alt="Dr. Avneet Kaur"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Avneet Kaur</h3>
              <p className="text-blue-600">Pediatrician</p>
            </div>
          </div>

          {/* Clinic Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Avneet Kaur clinic</h4>
            <p className="text-sm text-gray-600 mb-4">11:00 AM to 12:00 PM • 1h</p>

            <div className="flex justify-between items-center">
              <span className="text-gray-700">Total</span>
              <span className="text-red-600 font-semibold">$10</span>
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Location</h4>
            <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
              <span className="text-gray-500">Map View</span>
            </div>
          </div>

          {/* Action Button */}
          <Link
            href="/ui/review"
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors text-center block"
          >
            Add a Review
          </Link>
        </div>
      </main>
    </div>
  )
}
