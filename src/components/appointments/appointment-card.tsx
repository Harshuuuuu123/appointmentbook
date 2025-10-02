"use client";

import React from "react";
import { Appointment } from "@/context/DoctorContext";

interface AppointmentCardProps {
  appointment: Appointment;
  onStatusChange?: (id: number, status: Appointment["status"]) => void;
}

export default function AppointmentCard({ appointment, onStatusChange }: AppointmentCardProps) {
  const { id, patientName, patientPhone, date, time, status } = appointment;

  return (
    <div className="border rounded p-3 flex justify-between items-center bg-white">
      <div>
        <p className="font-medium">{patientName ?? "Unknown Patient"}</p>
        <p className="text-sm text-gray-500">
          {date ? new Date(date).toLocaleDateString() : "Invalid Date"} - {time ?? "Unknown Time"}
        </p>
        {patientPhone && <p className="text-sm text-gray-400">Phone: {patientPhone}</p>}
      </div>

      <div className="flex gap-2">
        {status === "scheduled" && (
          <>
            <button
              onClick={() => onStatusChange?.(id, "completed")}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm"
            >
              Complete
            </button>
            <button
              onClick={() => onStatusChange?.(id, "cancelled")}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Cancel
            </button>
          </>
        )}
        {status !== "scheduled" && (
          <span
            className={`px-3 py-1 rounded text-sm ${
              status === "completed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}
      </div>
    </div>
  );
}
