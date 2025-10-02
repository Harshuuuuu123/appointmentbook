export interface Doctor {
  id: number
  name: string
  email: string
  phone: string
  specialization: string
  experience: number
  qualification: string
  bio?: string
  profileImage?: string
  consultationFee?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  clinic: Clinic | null
  staff: Staff[]
  timings: DoctorTiming[]
}

export interface Clinic {
  id: number
  name: string
  address: string
  phone: string
  email?: string
  city: string
  state: string
  pincode: string
  description?: string
  facilities?: string[]
  images?: string[]
  createdAt: string
  updatedAt: string
}

export interface Staff {
  id: number
  name: string
  email: string
  phone: string
  role: "nurse" | "receptionist" | "assistant" | "doctor"
  isActive: boolean
  createdAt: string
}

export interface DoctorTiming {
  id: number
  dayOfWeek: number 
  startTime: string 
  endTime: string 
  maxBookings: number
  slotDuration: number 
  isActive: boolean
}

export interface Appointment {
  appointmentDate: string
  patientPhone : string;
  patientName: any
  id: number
  doctorId: number
  patientId: number
  date: string
  time: string
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show"
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Patient {
  id: number
  name: string
  email: string
  phone: string
  age: number
  gender: "male" | "female" | "other"
  address?: string
  medicalHistory?: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message: string
  error?: string
}
