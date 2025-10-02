import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = Number(params.id)
    const body = await request.json()
    const { type, message, recipientType = "patient" } = body

    if (!type || !message) {
      return NextResponse.json({ success: false, message: "Type and message are required" }, { status: 400 })
    }

  
    const appointmentRes = await query(
      `SELECT a.*, d.name as doctor_name, d.clinic_name, p.name as patient_name
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       JOIN patients p ON a.patient_id = p.id
       WHERE a.id = $1`,
      [appointmentId]
    )
    const appointment = appointmentRes.rows[0]

    if (!appointment) {
      return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 })
    }

    let recipientId: number
    let title: string

  
    if (recipientType === "patient") {
      recipientId = appointment.patient_id
      title = getPatientNotificationTitle(type, appointment.doctor_name)
    } else if (recipientType === "doctor") {
      recipientId = appointment.doctor_id
      title = getDoctorNotificationTitle(type, appointment.patient_name)
    } else {
      return NextResponse.json({ success: false, message: "Invalid recipient type" }, { status: 400 })
    }

  
    const insertSql = `
      INSERT INTO notifications
      (recipient_id, recipient_type, type, title, message, data, is_read, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, false, NOW())
      RETURNING *
    `
    const data = {
      appointmentId: appointment.id,
      appointmentDate: appointment.date,
      appointmentTime: appointment.time,
      doctorName: appointment.doctor_name,
      patientName: appointment.patient_name,
      clinicName: appointment.clinic_name,
    }

    const result = await query(insertSql, [
      recipientId,
      recipientType,
      type,
      title,
      message,
      JSON.stringify(data),
    ])

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: "Notification sent successfully",
    }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to send notification" }, { status: 500 })
  }
}


function getPatientNotificationTitle(type: string, doctorName?: string): string {
  const doctor = doctorName || "Your doctor"
  switch (type) {
    case "appointment_reminder": return "Appointment Reminder"
    case "appointment_confirmed": return "Appointment Confirmed"
    case "appointment_cancelled": return "Appointment Cancelled"
    case "appointment_delay": return "Appointment Delayed"
    case "queue_update": return "Queue Update"
    case "ready_for_consultation": return "Ready for Consultation"
    default: return "Appointment Update"
  }
}

function getDoctorNotificationTitle(type: string, patientName?: string): string {
  const patient = patientName || "Patient"
  switch (type) {
    case "appointment_booked": return "New Appointment Booked"
    case "appointment_cancelled": return "Appointment Cancelled"
    case "patient_arrived": return "Patient Arrived"
    case "patient_no_show": return "Patient No Show"
    default: return "Appointment Update"
  }
}
