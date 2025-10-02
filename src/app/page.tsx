"use client"

import Link from "next/link"

export default function HomePage() {
  const handleSignupAlert = () => {
    alert("Please sign up or log in to book an appointment.")
  }

  // Hardcoded doctors array
  const doctors = [
    {
      id: 1,
      fullName: "Dr. Laura White",
      specialty: "Psychologist",
      clinicName: "Lark Hospital",
      profileImage: "", // leave blank to use initials fallback
    },
    {
      id: 2,
      fullName: "Dr. David H. Brown",
      specialty: "Cardiologist",
      clinicName: "Lark Hospital",
      profileImage: "", // leave blank
    },
    {
      id: 3,
      fullName: "Dr. Brian Clark",
      specialty: "Neurologist",
      clinicName: "City Medical Center",
      profileImage: "", // leave blank
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ---------- HEADER ---------- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">DocCare</span>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/ui/signup"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
              >
                Sign Up
              </Link>
              <Link
                href="/ui/login"
                className="px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div
            className="rounded-2xl p-8 md:p-12 text-white"
            style={{
              background: "#2563eb",
              backgroundImage: "linear-gradient(to right, #2563eb, #1d4ed8)",
            }}
          >
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Find & Book Appointments with Top Doctors
              </h1>
              <p className="mb-6 text-lg text-blue-100">
                Connect with qualified healthcare professionals and manage your health appointments seamlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleSignupAlert}
                  className="px-6 py-3 bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Book Appointment
                </button>
                <button
                  onClick={handleSignupAlert}
                  className="px-6 py-3 rounded-lg font-medium transition-colors"
                  style={{
                    border: "2px solid white",
                    color: "white",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "white"
                    e.currentTarget.style.color = "#2563eb"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.color = "white"
                  }}
                >
                  Emergency Care
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Doctors */}
        <section>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  {doc.profileImage ? (
                    <img
                      src={doc.profileImage}
                      alt={doc.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-lg font-bold text-blue-600">
                      {doc.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{doc.fullName}</h3>
                    <p className="text-gray-600">{doc.specialty}</p>
                    <p className="text-sm text-gray-500">{doc.clinicName}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignupAlert}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
