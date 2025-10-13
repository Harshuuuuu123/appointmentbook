"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AppointmentDate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorIdParam = searchParams.get("doctorId");
  const doctorId = doctorIdParam ? Number(doctorIdParam) : null;

  const [doctor, setDoctor] = useState<any | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [errorDoctor, setErrorDoctor] = useState("");

  const [patient, setPatient] = useState<any | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");

  // Fetch doctor info
  useEffect(() => {
    if (!doctorId) {
      setErrorDoctor("No doctor selected");
      setLoadingDoctor(false);
      return;
    }

    setLoadingDoctor(true);
    fetch(`/api/doctors/${doctorId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.success) setErrorDoctor(data.message || "Doctor not found");
        else setDoctor(data.data);
      })
      .catch(() => setErrorDoctor("Failed to fetch doctor"))
      .finally(() => setLoadingDoctor(false));
  }, [doctorId]);

  // Fetch patient info
  useEffect(() => {
    const patientId = localStorage.getItem("loggedInUserId");
    if (!patientId) {
      setLoadingPatient(false);
      return;
    }

    fetch(`/api/patients/me?id=${patientId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setPatient(data.data);
      })
      .catch(() => {})
      .finally(() => setLoadingPatient(false));
  }, []);

  // Generate next 7 dates in IST
  const next7Dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      label: date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      }),
      value: date.toISOString().slice(0, 10),
    };
  });

  // Fetch slots when date changes
  useEffect(() => {
    if (!doctorId || !selectedDate) {
      setTimeSlots([]);
      return;
    }

    setLoadingSlots(true);
    fetch(`/api/doctors/${doctorId}/availability?date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.availableSlots) setTimeSlots(data.data.availableSlots);
        else setTimeSlots([]);
      })
      .catch(() => setTimeSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [doctorId, selectedDate]);

  const handleBook = async () => {
    if (!selectedTime) return alert("Select a time slot first");
    if (!patient) return alert("Patient info not loaded");
    if (!selectedDate) return alert("Select a date first");

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: doctorId,
          patient_id: patient.id,
          date: selectedDate,
          time: selectedTime, // IST time directly
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("Appointment booked successfully!");
      } else {
        alert(data.message || "Failed to book appointment");
      }
    } catch {
      alert("Something went wrong");
    }
  };

  if (loadingDoctor || loadingPatient) return <div className="p-6 text-center">Loading...</div>;
  if (errorDoctor) return <div className="p-6 text-center text-red-500">{errorDoctor}</div>;
  if (!doctor) return <div className="p-6 text-center">Doctor not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
              ← Back
            </button>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900">Book Appointment</h1>
            <div></div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Doctor Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center border-4 border-blue-500 mx-auto sm:mx-0">
            <img
              src={doctor.profile_image || "/images/doctor-avatar-1.jpg"}
              alt={doctor.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{doctor.name}</h2>
            <p className="text-blue-600 font-medium">{doctor.specialization}</p>
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {next7Dates.map(date => (
              <button
                key={date.value}
                onClick={() => {
                  setSelectedDate(date.value);
                  setSelectedTime("");
                }}
                className={`p-3 rounded-lg border-2 text-center transition-colors text-sm sm:text-base ${
                  selectedDate === date.value
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {date.label}
              </button>
            ))}
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Select Time</h3>
          {loadingSlots ? (
            <p>Loading slots...</p>
          ) : timeSlots.length === 0 ? (
            <p>No available slots for this date.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {timeSlots.map(slot => (
                <button
                  key={slot.time}
                  onClick={() => setSelectedTime(slot.time)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    selectedTime === slot.time
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  {slot.time} {/* Already IST */}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleBook}
            disabled={!selectedTime || !patient}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              !selectedTime || !patient
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            BOOK APPOINTMENT
          </button>
        </div>
      </main>
    </div>
  );
}
