"use client";

import {
  createContext,useContext,useState,ReactNode, useEffect, Dispatch, SetStateAction, useRef,
} from "react";

// -------------------- Types --------------------
export interface Doctor {
  id: number;
  fullName: string;
  specialization?: string;
  qualification?: string;
  profileImage?: string;
  clinicId?: number;
   rating?: number;           
  consultationFee?: number;
    fees?: number;
}

export interface Clinic {
  id: number;
  name: string;
  address: string;
  contactNumber?: string;
}

export interface Appointment {
  id: number;
  patientId?: number;
  patientName?: string;
  patientPhone?: string;
  date: string; 
  status: string;
  time?: string;
  doctor_id?: number;
}

export interface Patient {
  id: number;
  name: string;
  phone?: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// -------------------- Context --------------------
interface DoctorContextType {
  doctor: Doctor | null;
  clinic: Clinic | null;
  appointments: Appointment[];
  patients: Patient[];
  notifications: Notification[];       
  setDoctor: (d: Doctor | null) => void;
  setClinic: (c: Clinic | null) => void;
  setAppointments: Dispatch<SetStateAction<Appointment[]>>;
  setPatients: Dispatch<SetStateAction<Patient[]>>;
  setNotifications: Dispatch<SetStateAction<Notification[]>>; 
  doctorId: number | null;
  refresh: () => Promise<void>;
  loading: boolean;
}

interface Props {
  children: ReactNode;
  doctorId: number | null;
  initialData?: {
    doctor?: Doctor;
    clinic?: Clinic;
    appointments?: Appointment[];
    patients?: Patient[];
    notifications?: Notification[];   
  };
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

export const DoctorProvider = ({ children, doctorId, initialData }: Props) => {
  const [doctor, setDoctor] = useState<Doctor | null>(initialData?.doctor ?? null);
  const [clinic, setClinic] = useState<Clinic | null>(initialData?.clinic ?? null);
  const [appointments, setAppointments] = useState<Appointment[]>(initialData?.appointments ?? []);
  const [patients, setPatients] = useState<Patient[]>(initialData?.patients ?? []);
  const [notifications, setNotifications] = useState<Notification[]>(initialData?.notifications ?? []); 
  const [loading, setLoading] = useState(false);

  const fetchIdRef = useRef(0);

  // Normalize API appointments
  const normalizeAppointments = (raw: any[]): Appointment[] => {
    return (raw || []).map((a: any) => ({
      id: a.id,
      patientId: a.patientId,
      patientName: a.patientName,
      patientPhone: a.patientPhone,
      date: a.appointmentDate ?? a.date ?? "",
      status: a.status ?? "waiting",
      time: a.time,
      doctor_id: a.doctor_id,
    }));
  };

  // -------------------- Fetch Notifications --------------------
  const fetchNotifications = async () => {
    if (!doctorId) return;
    try {
      const res = await fetch(`/api/notifications?userId=${doctorId}`);
      const data = await res.json();
      if (data.success) setNotifications(data.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const fetchDoctorData = async () => {
    if (!doctorId) return;

    fetchIdRef.current += 1;
    const myFetchId = fetchIdRef.current;
    setLoading(true);

    try {
      const res = await fetch(`/api/dashboard/${doctorId}`);
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("Doctor API returned non-OK:", res.status, txt);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!data?.success || !data.doctor) {
        console.error("Doctor API error:", data?.message);
        setLoading(false);
        return;
      }

      if (myFetchId !== fetchIdRef.current) return;

      setDoctor(data.doctor ?? null);
      setClinic(data.clinic ?? null);

      const normalized = normalizeAppointments(data.appointments || []);
      setAppointments(normalized);

      const patientMap: Record<number, Patient> = {};
      normalized.forEach((appt) => {
        if (appt.patientId && !patientMap[appt.patientId]) {
          patientMap[appt.patientId] = {
            id: appt.patientId,
            name: appt.patientName ?? `Patient ${appt.patientId}`,
            phone: appt.patientPhone ?? undefined,
          };
        }
      });
      if (Array.isArray(data.patients)) {
        data.patients.forEach((p: any) => {
          if (p?.id) {
            patientMap[p.id] = {
              id: p.id,
              name: p.name ?? patientMap[p.id]?.name ?? `Patient ${p.id}`,
              phone: p.phone ?? patientMap[p.id]?.phone ?? undefined,
            };
          }
        });
      }
      setPatients(Object.values(patientMap));

      // Fetch notifications separately
      fetchNotifications(); 
    } catch (err: any) {
      console.error("Failed to fetch doctor data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!doctorId) return;
    fetchDoctorData();
    const interval = setInterval(fetchDoctorData, 30_000); 
    return () => clearInterval(interval);
  }, [doctorId]);

  return (
    <DoctorContext.Provider
      value={{
        doctor,
        clinic,
        appointments,
        patients,
        notifications,        
        setDoctor,
        setClinic,
        setAppointments,
        setPatients,
        setNotifications,    
        doctorId,
        refresh: fetchDoctorData,
        loading,
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
};

// Hook
export const useDoctor = () => {
  const context = useContext(DoctorContext);
  if (!context) throw new Error("useDoctor must be used within a DoctorProvider");
  return context;
};
