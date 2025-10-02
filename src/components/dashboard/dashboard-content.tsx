"use client";

import { useState } from "react";
import StatsCards from "./stats-cards";
import QuickActions from "./quick-actions";
import AppointmentCard from "../appointments/appointment-card";
import { useDoctor, Appointment, Patient } from "@/context/DoctorContext";

export default function DashboardContent() {
  const { doctor, clinic, appointments = [], patients = [] } = useDoctor();
  const [showAll, setShowAll] = useState(false);

  if (!doctor) return <p className="text-center py-6">Loading doctor info...</p>;

  const displayedAppointments = showAll ? appointments : appointments.slice(0, 5);

  const handleStatusChange = (id: number, status: Appointment["status"]) => {
    console.log(`Appointment ${id} status changed to ${status}`);
    // TODO: Call API to update appointment status
  };

  return (
    <div className="p-6">
      {/* Greeting */}
      <div className="mb-8 flex items-center gap-4">
        {doctor.profileImage && (
          <img src={doctor.profileImage} alt="Profile" className="w-12 h-12 rounded-full" />
        )}
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">
            Good Morning, {doctor.fullName}
          </h1>
          {doctor.specialization && (
            <p className="text-muted-foreground">{doctor.specialization}</p>
          )}
          {clinic && <p className="text-muted-foreground">Clinic: {clinic.name}</p>}
        </div>
      </div>

      {/* Stats & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <StatsCards appointments={appointments} patients={patients} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Appointments & Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-card-foreground">Today's Appointments</h3>
            {appointments.length > 5 && !showAll && (
              <button
                className="text-primary text-sm hover:underline"
                onClick={() => setShowAll(true)}
              >
                View All
              </button>
            )}
            {showAll && appointments.length > 5 && (
              <button
                className="text-primary text-sm hover:underline"
                onClick={() => setShowAll(false)}
              >
                Show Less
              </button>
            )}
          </div>

          {appointments.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">📭 No appointments today</p>
          ) : (
            <div className="space-y-3">
              {displayedAppointments.map((appt: Appointment) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="font-semibold text-card-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {appointments
              .slice(0, 3)
              .map((appt) => (
                <div key={appt.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <span className="text-secondary-foreground text-sm">✓</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {appt.status === "completed"
                        ? "Appointment completed"
                        : "New patient registered"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {appt.patientName ?? "Unknown"} -{" "}
                      {appt.time ?? "Unknown Time"}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
