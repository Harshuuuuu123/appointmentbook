export interface Appointment {
  id: number;
  patientName: string;       
  appointmentDate: string;   
  status: "confirmed" | "waiting" | "scheduled" | "cancelled" | "completed";
}
