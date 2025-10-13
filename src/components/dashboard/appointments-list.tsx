"use client";

import { useState } from "react";
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
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>(appointments);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleStatusChange = async (id: number, status: Appointment["status"]) => {
    if (updatingId) return;
    setUpdatingId(id);

    try {
      const res = await fetch(`/api/appointments`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update");

      // Update local state
      setLocalAppointments((prev) =>
        prev.map((appt) => (appt.id === id ? { ...appt, status } : appt))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update appointment status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (!localAppointments || localAppointments.length === 0)
    return <p className="text-gray-500 text-center py-4">No appointments found.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {localAppointments.map((appt) => (
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
