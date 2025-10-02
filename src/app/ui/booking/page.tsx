"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Clock, MapPin, Star, Filter, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface Booking {
  id: number;
  doctorName: string;
  specialization: string;
  qualification?: string;
  experience?: number;
  phone?: string;
  email?: string;
  bio?: string;
  profileImage?: string | null;
  rating: number;
  date: string;
  time: string;
  location?: string;
  fees: number;
  status: "upcoming" | "completed" | "cancelled";
}

export default function BookingPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentView, setCurrentView] = useState<"list" | "details">("list");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "upcoming" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ---------------- FETCH BOOKINGS ----------------
  const fetchBookings = async () => {
    const patientId = localStorage.getItem("loggedInUserId");
    if (!patientId) {
      setError("Patient info not available");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/appointments?patientId=${patientId}`);
      const data = await res.json();

      if (res.ok && data.success) {
        const formatted = data.appointments.map((appt: any) => ({
          id: appt.id,
          doctorName: appt.doctor?.fullName || "Unknown Doctor",
          specialization: appt.doctor?.specialization || "N/A",
          qualification: appt.doctor?.qualification || "",
          experience: appt.doctor?.experience || 0,
          phone: appt.doctor?.phone || "",
          email: appt.doctor?.email || "",
          bio: appt.doctor?.bio || "",
          profileImage: appt.doctor?.profileImage || null,
          rating: appt.doctor?.rating || 0,
          date: appt.appointmentDate,
          time: appt.time,
          fees: appt.doctor?.consultationFee || 0,
          location: appt.location || "",
          status: appt.status || "upcoming",
        }));

        setBookings(formatted);
      } else {
        setError(data.message || "Failed to fetch bookings");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setCurrentView("details");
  };

  const handleBackClick = () => {
    if (currentView === "details") {
      setCurrentView("list");
      setSelectedBooking(null);
    } else {
      router.push("/ui/search-dr");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeFilter !== "all" && booking.status !== activeFilter) return false;
    if (searchQuery) {
      return (
        booking.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.specialization.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const BookingList = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackClick}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by doctor or specialty"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter("upcoming")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === "upcoming"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveFilter("completed")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === "completed"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Completed
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Loading appointments...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : filteredBookings.length === 0 ? (
          <p className="text-center text-gray-600">No appointments found</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => handleBookingClick(booking)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {booking.profileImage ? (
                        <img
                          src={booking.profileImage}
                          alt={booking.doctorName}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {booking.doctorName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                      )}
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.doctorName}
                        </h3>
                        <p className="text-blue-600 font-medium">
                          {booking.specialization} {booking.qualification ? `- ${booking.qualification}` : ""}
                        </p>
                        <div className="flex items-center mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {booking.rating} | Exp: {booking.experience} yrs
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === "upcoming"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "completed"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">{booking.date}</span>
                      <Clock className="w-4 h-4 ml-4 mr-2" />
                      <span className="text-sm">{booking.time}</span>
                    </div>

                    {booking.location && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm truncate">{booking.location}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-lg font-semibold text-gray-900">
                        ₹{booking.fees}/hr
                      </span>

                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const BookingDetails = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <button
        onClick={handleBackClick}
        className="flex items-center gap-2 mb-6 text-gray-700 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      {selectedBooking && (
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto space-y-4">
          <div className="flex items-center space-x-4">
            {selectedBooking.profileImage ? (
              <img
                src={selectedBooking.profileImage}
                alt={selectedBooking.doctorName}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                {selectedBooking.doctorName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedBooking.doctorName}</h2>
              <p className="text-blue-600 font-medium">
                {selectedBooking.specialization} {selectedBooking.qualification ? `- ${selectedBooking.qualification}` : ""}
              </p>
              <div className="flex items-center mt-1 space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-600">{selectedBooking.rating} | Exp: {selectedBooking.experience} yrs</span>
              </div>
            </div>
          </div>

          {selectedBooking.bio && (
            <p className="text-gray-700">{selectedBooking.bio}</p>
          )}

          <div className="space-y-2">
            <div className="flex items-center text-gray-700">
              <Calendar className="w-5 h-5 mr-2" />
              <span>{selectedBooking.date}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Clock className="w-5 h-5 mr-2" />
              <span>{selectedBooking.time}</span>
            </div>
            {selectedBooking.location && (
              <div className="flex items-center text-gray-700">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{selectedBooking.location}</span>
              </div>
            )}
            <div className="flex items-center text-gray-700">
              <span className="font-semibold">Fees: </span> ₹{selectedBooking.fees}/hr
            </div>
            <div className="flex items-center text-gray-700">
              <span className="font-semibold">Status: </span>{" "}
              {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
            </div>
            {selectedBooking.phone && (
              <div className="flex items-center text-gray-700">
                <span className="font-semibold">Phone: </span> {selectedBooking.phone}
              </div>
            )}
            {selectedBooking.email && (
              <div className="flex items-center text-gray-700">
                <span className="font-semibold">Email: </span> {selectedBooking.email}
              </div>
            )}
          </div>

          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Start Appointment / Video Call
          </button>
        </div>
      )}
    </div>
  );

  return currentView === "list" ? <BookingList /> : <BookingDetails />;
}
