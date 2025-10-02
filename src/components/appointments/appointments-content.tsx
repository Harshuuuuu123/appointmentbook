"use client";

import { useEffect, useState } from "react";
import { useDoctor } from "@/context/DoctorContext";

export interface Appointment {
  id: number;
  patientName: string;
  patientPhone?: string;
  appointmentDate: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: string; // scheduled | confirmed | completed | cancelled
  doctor_id?: number;
}

export default function AppointmentsContent() {
  const { doctorId } = useDoctor();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  // Get today's date in UTC (YYYY-MM-DD)
  const getTodayUTCDate = () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayUTC = getTodayUTCDate();

  useEffect(() => {
    if (!doctorId) return;

    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/appointments?doctorId=${doctorId}`);
        const data = await res.json();

        // console.log(data.appointments,"=== API RESPONSEEEEEEEEEEEEEEEEEEEEEEEE ===");
        // console.log(doctorId,"Raw API dataaaaaaaaaaaaaaaaaaaaaaa");

        if (data.success) {
          const list: Appointment[] = data.appointments.map((appt: any, index: number) => {
            // console.log(`=== Appointment ${index + 1} ===`);
            // console.log("Raw appointment data:", appt);

            // Use UTC date from DB
            let rawDate = appt.date || appt.appointment_date || appt.appointmentDate;
            let appointmentDate = "";
            if (rawDate) {
              const dateObj = new Date(rawDate);
              if (!isNaN(dateObj.getTime())) {
                appointmentDate = dateObj.toISOString().split("T")[0]; // UTC date YYYY-MM-DD
              }
            }

            let timeFormatted = appt.time || "";
            if (timeFormatted.includes(":")) {
              timeFormatted = timeFormatted.substring(0, 5);
            }

            const finalAppointment = {
              id: appt.id,
              patientName: appt.patient?.name || appt.patient_name || "Unknown Patient",
              patientPhone: appt.patient?.phone || appt.patient_phone,
              appointmentDate,
              time: timeFormatted,
              status: appt.status,
              doctor_id: appt.doctor_id,
            };

            // console.log("Final appointment object:", finalAppointment);
            return finalAppointment;
          });

          // console.log("=== ALL PROCESSED APPOINTMENTS ===");
          // console.log("Complete list:", list);
          setAppointments(list);
        } else {
          // console.log("API returned success: false");
          setAppointments([]);
        }
      } catch (err) {
        // console.error("Failed to fetch appointments:", err);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorId]);

  // Filters
  const todaysAppointments = appointments.filter((appt) => {
    const apptUTCDate = appt.appointmentDate;
    const isToday = apptUTCDate === todayUTC;
    // console.log(`Checking appointment ${appt.id}: ${apptUTCDate} === ${todayUTC} => ${isToday}`);
    return isToday;
  });

  const upcomingAppointments = appointments.filter((appt) => {
    const apptUTCDate = appt.appointmentDate;
    const isUpcoming = apptUTCDate > todayUTC;
    // console.log(`Checking upcoming ${appt.id}: ${apptUTCDate} > ${todayUTC} => ${isUpcoming}`);
    return isUpcoming;
  });

  // console.log("=== DATE COMPARISON DEBUG ===");
  // console.log("Today (UTC):", todayUTC);
  // console.log("Total appointments:", appointments.length);
  // console.log("Today's appointments count:", todaysAppointments.length);
  // console.log("Upcoming appointments count:", upcomingAppointments.length);
  // console.log("All appointments dates:", appointments.map((a) => a.appointmentDate));

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
    } catch (err) {
      // console.error("Failed to update status", err);
    } finally {
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
      {/* Debug Info */}
      <div className="bg-yellow-100 p-4 rounded-lg">
        <h3 className="font-bold">Debug Information:</h3>
        <p>Today's Date (UTC): {todayUTC}</p>
        <p>Total Appointments: {appointments.length}</p>
        <p>Today's Appointments: {todaysAppointments.length}</p>
        <p>All Dates: {appointments.map((a) => a.appointmentDate).join(", ")}</p>
      </div>

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
