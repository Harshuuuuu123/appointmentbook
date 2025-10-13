"use client";

import { useEffect, useState } from "react";
import { useDoctor } from "@/context/DoctorContext";

export interface Appointment {
  id: number;
  patientName: string;
  patientPhone?: string;
  appointmentDate: string; // YYYY-MM-DD (IST)
  time: string; // HH:MM
  status: string; // scheduled | confirmed | completed | cancelled
  doctor_id?: number;
}

export default function AppointmentsContent() {
  const { doctorId } = useDoctor();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  // Helper: Convert any UTC date string to IST date YYYY-MM-DD
  const toISTDate = (utcDateStr: string) => {
    if (!utcDateStr) return "";
    const dateObj = new Date(utcDateStr);
    if (isNaN(dateObj.getTime())) return "";

    const istOffset = 5.5 * 60; // 5 hours 30 minutes
    const istDate = new Date(dateObj.getTime() + istOffset * 60000);
    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, "0");
    const day = String(istDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Today's IST date
  const todayIST = toISTDate(new Date().toISOString());

  useEffect(() => {
    if (!doctorId) return;

    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/appointments?doctorId=${doctorId}`);
        const data = await res.json();

        if (data.success) {
          const list: Appointment[] = data.appointments.map((appt: any) => {
            const appointmentDate = toISTDate(
              appt.appointmentDate || appt.date || appt.appointment_date
            );

            let timeFormatted = appt.time || "";
            if (timeFormatted.includes(":")) timeFormatted = timeFormatted.substring(0, 5);

            return {
              id: appt.id,
              patientName: appt.patient?.name || appt.patient_name || "Unknown Patient",
              patientPhone: appt.patient?.phone || appt.patient_phone,
              appointmentDate,
              time: timeFormatted,
              status: appt.status,
              doctor_id: appt.doctor_id,
            };
          });

          setAppointments(list);
        } else {
          setAppointments([]);
        }
      } catch {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorId]);

  // Filter appointments
  const todaysAppointments = appointments.filter((appt) => appt.appointmentDate === todayIST);
  const upcomingAppointments = appointments.filter((appt) => appt.appointmentDate > todayIST);

  // Update status
  const updateStatus = async (id: number, newStatus: string) => {
    if (updating) return;
    setUpdating(id);
    try {
      const res = await fetch(`/api/appointments/${id}?doctorId=${doctorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setAppointments((prev) =>
          prev.map((appt) => (appt.id === id ? { ...appt, status: newStatus } : appt))
        );
      }
    } catch {}
    finally {
      setUpdating(null);
    }
  };

  const renderAppointmentCard = (appt: Appointment) => (
    <div key={appt.id} className="p-4 border rounded-lg shadow-sm bg-white flex flex-col gap-2">
      <div className="font-semibold text-lg">{appt.patientName}</div>
      <div>
        <span className="font-medium">Date:</span> {appt.appointmentDate}
      </div>
      <div>
        <span className="font-medium">Time:</span> {appt.time}
      </div>
      {appt.patientPhone && (
        <div>
          <span className="font-medium">Contact:</span> {appt.patientPhone}
        </div>
      )}
      <div>
        <span className="font-medium">Status:</span>{" "}
        <span
          className={`px-2 py-1 rounded text-sm ${
            appt.status === "scheduled"
              ? "bg-yellow-100 text-yellow-800"
              : appt.status === "confirmed"
              ? "bg-blue-100 text-blue-800"
              : appt.status === "completed"
              ? "bg-green-100 text-green-800"
              : appt.status === "cancelled"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {appt.status}
        </span>
      </div>

      <div className="flex gap-2 mt-2">
        <button
          disabled={updating === appt.id || appt.status === "confirmed"}
          onClick={() => updateStatus(appt.id, "confirmed")}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {updating === appt.id ? "Updating..." : "Confirm"}
        </button>
        <button
          disabled={updating === appt.id || appt.status === "completed"}
          onClick={() => updateStatus(appt.id, "completed")}
          className="px-3 py-1 bg-green-500 text-white rounded disabled:opacity-50"
        >
          {updating === appt.id ? "Updating..." : "Complete"}
        </button>
        <button
          disabled={updating === appt.id || appt.status === "cancelled"}
          onClick={() => updateStatus(appt.id, "cancelled")}
          className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50"
        >
          {updating === appt.id ? "Updating..." : "Cancel"}
        </button>
      </div>
    </div>
  );

  if (loading) return <div className="p-6 text-center text-lg">Loading appointments...</div>;

  return (
    <div className="p-6 flex flex-col gap-8">
      {/* Today's Appointments */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Today's Appointments</h2>
        {todaysAppointments.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todaysAppointments.map(renderAppointmentCard)}
          </div>
        ) : (
          <div className="text-center text-gray-500">No appointments today</div>
        )}
      </div>

      {/* Upcoming Appointments */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Upcoming Appointments</h2>
        {upcomingAppointments.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingAppointments.map(renderAppointmentCard)}
          </div>
        ) : (
          <div className="text-center text-gray-500">No upcoming appointments</div>
        )}
      </div>

      {/* Total Appointments */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          Total Appointments ({appointments.length})
        </h2>
        {appointments.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map(renderAppointmentCard)}
          </div>
        ) : (
          <div className="text-center text-gray-500">No appointments found</div>
        )}
      </div>
    </div>
  );
}
