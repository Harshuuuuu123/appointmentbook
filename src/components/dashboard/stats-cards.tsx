"use client";

import { Appointment, Patient } from "@/context/DoctorContext";

interface StatsCardsProps {
  appointments: Appointment[];
  patients: Patient[];
}

export default function StatsCards({ appointments = [], patients = [] }: StatsCardsProps) {
  const totalAppointments = appointments.length;
  const completed = appointments.filter(appt => appt.status === "completed").length;
  const waiting = appointments.filter(appt => appt.status === "waiting").length;
  const noShows = appointments.filter(appt => appt.status === "no-show").length;

  const totalPatients = patients.length;

  const stats = [
    {
      title: "Today's Appointments",
      value: totalAppointments,
      subtitle: "Total Appointments",
      icon: "📅",
      color: "bg-primary",
    },
    {
      title: "Patients Registered",
      value: totalPatients,
      subtitle: "Total Patients",
      icon: "👥",
      color: "bg-secondary",
    },
    {
      title: "Completed Appointments",
      value: completed,
      subtitle: "Appointments completed",
      icon: "✅",
      color: "bg-green-500",
    },
    {
      title: "No-Shows",
      value: noShows,
      subtitle: "Missed Appointments",
      icon: "❌",
      color: "bg-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.subtitle}</div>
            </div>
          </div>
          <h3 className="font-semibold text-card-foreground">{stat.title}</h3>
        </div>
      ))}
    </div>
  );
}
