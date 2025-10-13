"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Utility function for debounce
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const filters = [
    { id: "availability", label: "Available Today" },
    { id: "rating", label: "4+ Rating" },
    { id: "experience", label: "10+ Years" },
    { id: "insurance", label: "Insurance Accepted" },
  ];

  const specialties = [
    "General Medicine",
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Pediatrics",
    "Psychiatry",
    "Orthopedics",
    "Gynecology",
  ];

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (selectedSpecialties.length)
        params.append("specialties", selectedSpecialties.join(","));

      const res = await fetch(`/api/doctors?${params.toString()}`);
      let doctors = (await res.json()).data || [];

      // Filter out incomplete data
      doctors = doctors.filter(
        (doc: any) =>
          doc.id &&
          doc.name &&
          doc.experience &&
          doc.qualification &&
          doc.email &&
          doc.phone &&
          doc.bio
      );

      // Remove duplicates
      doctors = doctors.filter(
        (doc: any, index: number, self: any[]) =>
          index === self.findIndex((d) => d.id === doc.id)
      );

      // Filter by availability
      if (selectedFilters.includes("availability")) {
        const today = new Date().toISOString().split("T")[0];
        const availabilityPromises = doctors.map(async (doctor: any) => {
          const availRes = await fetch(
            `/api/doctors/${doctor.id}/availability?date=${today}`
          );
          const availData = await availRes.json();
          return {
            ...doctor,
            available: availData.data?.availableSlots?.length > 0,
          };
        });
        doctors = await Promise.all(availabilityPromises);
        doctors = doctors.filter((d: any) => d.available);
      }

      // Filter by rating
      if (selectedFilters.includes("rating")) {
        doctors = doctors.filter((d: any) => d.rating >= 4);
      }

      // Filter by experience
      if (selectedFilters.includes("experience")) {
        doctors = doctors.filter((d: any) => d.experience >= 10);
      }

      // Filter by insurance
      if (selectedFilters.includes("insurance")) {
        doctors = doctors.filter((d: any) => d.insuranceAccepted);
      }

      setSearchResults(doctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setSearchResults([]);
    }
    setLoading(false);
  };

  const debouncedFetch = debounce(fetchDoctors, 500);

  useEffect(() => {
    debouncedFetch();
  }, [searchQuery, selectedFilters, selectedSpecialties]);

  // Navigation handlers
  const handleNavBookings = () => router.push("/ui/booking");
  const handleNavProfile = () => router.push("/ui/patientprofile");
  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("loggedInUserId");
      router.push("/ui/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔝 Navbar */}
      <nav className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-blue-600">MedApp</h1>

            <div className="hidden md:block">
              <h2 className="text-lg font-semibold text-gray-900">
                Find Doctors
              </h2>
            </div>

            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={handleNavBookings}
                className="px-3 py-1 text-gray-700 hover:text-blue-600"
              >
                My Bookings
              </button>
              <button
                onClick={handleNavProfile}
                className="px-3 py-1 text-gray-700 hover:text-blue-600"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>

            <button
              className="md:hidden text-gray-700 text-2xl"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ☰
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t">
            <nav className="flex flex-col p-4 space-y-2">
              <button
                onClick={handleNavBookings}
                className="text-gray-700 hover:text-blue-600 text-left"
              >
                My Bookings
              </button>
              <button
                onClick={handleNavProfile}
                className="text-gray-700 hover:text-blue-600 text-left"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 text-left"
              >
                Logout
              </button>
            </nav>
          </div>
        )}
      </nav>

      {/* 🔍 Search + Filters */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col lg:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by doctor name, specialty, or condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Filters
              </h3>

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Quick Filters</h4>
                <div className="space-y-2">
                  {filters.map((filter) => (
                    <label
                      key={filter.id}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFilters.includes(filter.id)}
                        onChange={() => toggleFilter(filter.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {filter.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Specialties</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {specialties.map((specialty) => (
                    <label
                      key={specialty}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSpecialties.includes(specialty)}
                        onChange={() => toggleSpecialty(specialty)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* 👨‍⚕️ Doctor Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <p className="text-gray-600">Loading doctors...</p>
            ) : searchResults.length === 0 ? (
              <p className="text-gray-600">No doctors found</p>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {searchResults.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {/* ✅ Updated: Show profile image */}
                      {doctor.profile_image ? (
                        <img
                          src={doctor.profile_image}
                          alt={doctor.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {doctor.name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                              {doctor.name}
                            </h3>
                            <p className="text-blue-600 font-medium">
                              {doctor.specialty}
                              {doctor.qualification
                                ? ` - ${doctor.qualification}`
                                : ""}
                            </p>
                            <p className="text-gray-600 text-sm sm:text-base mt-1">
                              Experience: {doctor.experience} years
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          <Link
                            href={`/ui/profiles?doctorId=${doctor.id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                          >
                            Book Appointment
                          </Link>
                          <Link
                            href={`/ui/profiles?doctorId=${doctor.id}`}
                            className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
