"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useDoctor } from "@/context/DoctorContext";

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor_name: string;
  doctor_specialization: string;
  status: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  avatar?: string;
  medicalHistory?: string;
  medications?: { name: string; dosage: string }[];
}

interface QueueStatus {
  position: number;
  patientsAhead: number;
  estimatedWaitTime: number;
  isCurrentPatient: boolean;
}

interface PatientDetailsProps {
  patientId: string;
}

export default function PatientDetails({ patientId }: PatientDetailsProps) {
  const { doctor } = useDoctor();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queue, setQueue] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPatientData = async () => {
    if (!doctor?.id) return; // Ensure doctor is loaded

    try {
      setLoading(true);

      // Fetch patient info
      const resPatient = await fetch(`/api/patients/${patientId}`);
      const dataPatient = await resPatient.json();
      if (dataPatient.success) setPatient(dataPatient.data);
      else throw new Error(dataPatient.message || "Failed to fetch patient");

      // Fetch appointments filtered by doctorId
      const resApp = await fetch(`/api/patients/${patientId}/appointments?doctorId=${doctor.id}`);
      const dataApp = await resApp.json();
      if (dataApp.success) setAppointments(dataApp.data);

      // Fetch queue status (optional, still filtered by doctor)
      const resQueue = await fetch(`/api/patients/${patientId}/queue-status?doctorId=${doctor.id}`);
      const dataQueue = await resQueue.json();
      if (dataQueue.success) setQueue(dataQueue.data.queueStatus);

    } catch (err: any) {
      setError(err.message || "Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [patientId, doctor?.id]);

  if (loading) return <p className="p-6 text-center">Loading patient details...</p>;
  if (error) return <p className="p-6 text-red-500 text-center">{error}</p>;
  if (!patient) return <p className="p-6 text-center">Patient not found</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/patients"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold text-primary">Patient Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Info */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <span className="text-2xl">{patient.avatar || "👤"}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-card-foreground">{patient.name}</h2>
                <p className="text-muted-foreground">
                  {patient.age}, {patient.gender} • Patient ID: {patient.id}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-card-foreground mb-2">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📞</span>
                    <span className="text-sm text-muted-foreground">{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">✉️</span>
                    <span className="text-sm text-muted-foreground">{patient.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Medical History */}
          {patient.medicalHistory && (
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold text-card-foreground mb-2">Medical History</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{patient.medicalHistory}</p>
            </div>
          )}

          {/* Medications */}
          {patient.medications && patient.medications.length > 0 && (
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold text-card-foreground mb-4">Current Medications</h3>
              <div className="space-y-3">
                {patient.medications.map((med, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-sm">💊</span>
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{med.name}</p>
                      <p className="text-sm text-muted-foreground">{med.dosage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appointment History */}
          {appointments.length > 0 && (
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold text-card-foreground mb-4">Appointment History</h3>
              <div className="space-y-2">
                {appointments.map((appt) => (
                  <div key={appt.id} className="flex justify-between p-2 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-card-foreground">{appt.doctor_name}</p>
                      <p className="text-sm text-muted-foreground">{appt.doctor_specialization}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{appt.date} • {appt.time}</p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appt.status === "confirmed" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {appt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Queue Status */}
        <div className="space-y-6">
          {queue && (
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold text-card-foreground mb-4">Queue Status</h3>
              <p>Position: {queue.position}</p>
              <p>Patients Ahead: {queue.patientsAhead}</p>
              <p>Estimated Wait: {queue.estimatedWaitTime} mins</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
