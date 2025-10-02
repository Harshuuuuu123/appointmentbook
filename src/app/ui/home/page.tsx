"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check JWT token on page load
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleRedirect = (path: string) => {
    if (!isLoggedIn) {
      router.push("/ui/login"); // Redirect to your login page
    } else {
      router.push(path);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ---------- HEADER ---------- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side: Logo + Nav */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">DocCare</span>
              </div>

              <nav className="hidden md:flex items-center gap-6">
                <Link href="/ui/home" className="text-blue-600 font-medium">
                  Home
                </Link>
                <Link
                  href="/ui/search-dr"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Find Doctors
                </Link>
                <Link
                  href="/ui/doctors"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Specialists
                </Link>
                <Link
                  href="/ui/profiles"
                  className="text-gray-600 hover:text-gray-900"
                >
                  About
                </Link>
              </nav>
            </div>

            {/* Right Side: Auth Buttons */}
            <div className="flex items-center gap-3">
              {!isLoggedIn ? (
                <>
                  <Link
                    href="/ui/signup"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
                  >
                    Sign Up
                  </Link>
                <Link
                    href="/ui/signup"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    setIsLoggedIn(false);
                    router.push("/ui/login");
                  }}
                  className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div
            className="rounded-2xl p-8 md:p-12"
            style={{
              background: "#2563eb",
              backgroundImage: "linear-gradient(to right, #2563eb, #1d4ed8)",
              color: "white",
            }}
          >
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Find & Book Appointments with Top Doctors
              </h1>
              <p className="mb-6 text-lg" style={{ color: "#dbeafe" }}>
                Connect with qualified healthcare professionals and manage your
                health appointments seamlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="px-6 py-3 bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  onClick={() => handleRedirect("/ui/appointments")}
                >
                  Book Appointment
                </button>
                <button
                  className="px-6 py-3 rounded-lg font-medium transition-colors"
                  style={{
                    border: "2px solid white",
                    color: "white",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.color = "#2563eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "white";
                  }}
                  onClick={() => handleRedirect("/ui/emergency")}
                >
                  Emergency Care
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Other sections like Upcoming Appointments can also use handleRedirect for buttons */}
      </main>
    </div>
  );
}
