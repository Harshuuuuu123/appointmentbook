"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function AppointmentDetailsPage() {
  const params = useParams();
  const appointmentId = params?.id;
  const router = useRouter();

  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!appointmentId) return;

    setLoading(true);
    setError("");

    fetch(`/api/appointments/${appointmentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success || !data.data) {
          setError(data.message || "Appointment not found");
        } else {
          setAppointment(data.data);
        }
      })
      .catch(() => setError("Failed to fetch appointment"))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  if (loading)
    return <div className="p-6 text-center">Loading appointment...</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">
        {error}
      </div>
    );
  if (!appointment)
    return <div className="p-6 text-center">No appointment found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold">Appointment Details</h1>
          <div></div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
        {/* Left Card */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Doctor Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
            <img
              src={appointment.doctor_avatar ?? "/images/doctor-avatar-1.jpg"}
              alt={appointment.doctor_name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div className="text-center sm:text-left">
              <h2 className="text-lg font-semibold">{appointment.doctor_name}</h2>
              <p className="text-sm text-gray-600">{appointment.specialization ?? ""}</p>
              <p className="text-sm text-gray-600">{appointment.hospital ?? ""}</p>
              <p className="text-sm font-medium text-gray-900">
                Fee: ${appointment.doctor_fee ?? 25}
              </p>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Schedule</h3>
            <p className="text-sm">Date: {appointment.date}</p>
            <p className="text-sm">Time: {appointment.time}</p>
            <p className="text-sm">Status: {appointment.status}</p>
          </div>

          {/* Patient */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Patient</h3>
            <p className="text-sm">
              {appointment.patient_name} (Age: {appointment.patient_age ?? "--"})
            </p>
          </div>

          {/* Next / Payment */}
          <Link
            href={`/ui/payment?id=${appointment.id}&doctorId=${appointment.doctor_id}`}
            className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Next
          </Link>
        </div>

        {/* Right Summary */}
        <div className="flex-1 bg-blue-50 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">Appointment Summary</h3>

          <div>
            <span className="text-sm text-gray-600">Doctor</span>
            <p className="font-medium">
              {appointment.doctor_name} - {appointment.specialization ?? ""}
            </p>
          </div>

          <div>
            <span className="text-sm text-gray-600">Date & Time</span>
            <p className="font-medium">
              {appointment.date} at {appointment.time}
            </p>
          </div>

          <div>
            <span className="text-sm text-gray-600">Patient</span>
            <p className="font-medium">{appointment.patient_name}</p>
          </div>

          <div>
            <span className="text-sm text-gray-600">Consultation Fee</span>
            <p className="font-medium">${appointment.doctor_fee ?? 25}</p>
          </div>

          <div>
            <span className="text-sm text-gray-600">Platform Fee</span>
            <p className="font-medium">$2.00</p>
          </div>

          <div className="font-medium border-t pt-2">
            Total: ${(Number(appointment.doctor_fee ?? 25) + 2).toFixed(2)}
          </div>
        </div>
      </main>
    </div>
  );
}
