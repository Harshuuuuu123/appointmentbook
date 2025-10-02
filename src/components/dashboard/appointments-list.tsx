// src/components/appointments/appointments-content.tsx
"use client";

import { Appointment } from "@/context/DoctorContext";
import AppointmentCard from "../appointments/appointment-card";

interface AppointmentsContentProps {
  appointments: Appointment[];
  clinic?: { id: number; name: string } | null;
}

export default function AppointmentsContent({
  appointments,
  clinic,
}: AppointmentsContentProps) {
  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/auth/update-appointment-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");
      // Optional: update local state if needed
    } catch (err) {
      console.error(err);
      alert("Failed to update appointment status");
    }
  };

  if (!appointments || appointments.length === 0)
    return <p className="text-gray-500 text-center py-4">No appointments found.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {appointments.map((appt) => (
        <div key={appt.id} className="w-full">
          <AppointmentCard
            appointment={appt}
            onStatusChange={handleStatusChange}
          />
        </div>
      ))}
    </div>
  );
}
