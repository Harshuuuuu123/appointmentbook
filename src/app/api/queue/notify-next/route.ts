import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db" // PostgreSQL helper

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { doctorId, date, customMessage } = body

    if (!doctorId) {
      return NextResponse.json({ success: false, message: "doctorId is required" }, { status: 400 })
    }

    // Verify doctor exists
    const doctorResult = await query("SELECT * FROM doctors WHERE id = $1", [doctorId])
    const doctor = doctorResult.rows[0]
    if (!doctor) {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })
    }

    const targetDate = date || new Date().toISOString().split("T")[0]

    // Find next patient in queue (earliest scheduled/confirmed appointment for this doctor)
    const nextAppointmentResult = await query(
      `SELECT a.*, p.name AS patient_name, p.id AS patient_id, c.name AS clinic_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       LEFT JOIN clinics c ON a.clinic_id = c.id
       WHERE a.doctor_id = $1 
         AND a.date = $2 
         AND a.status IN ('scheduled','confirmed')
       ORDER BY a.time ASC
       LIMIT 1`,
      [doctorId, targetDate]
    )

    const nextAppointment = nextAppointmentResult.rows[0]
    if (!nextAppointment) {
      return NextResponse.json({
        success: false,
        message: "No patients in queue to notify",
      })
    }

    // Create notification in DB
    const notificationResult = await query(
      `INSERT INTO notifications (recipient_id, recipient_type, type, title, message, data, is_read, created_at)
       VALUES ($1,'patient','queue_update','You\'re Next!',$2,$3,false,NOW())
       RETURNING *`,
      [
        nextAppointment.patient_id,
        customMessage ||
          `Dr. ${doctor.name} will see you shortly. Please be ready and wait near the consultation room.`,
        JSON.stringify({
          appointmentId: nextAppointment.id,
          doctorName: doctor.name,
          appointmentTime: nextAppointment.time,
          clinicName: nextAppointment.clinic_name || null,
          queuePosition: 1,
        }),
      ]
    )

    const notification = notificationResult.rows[0]

    // Mark appointment as "notified"
    await query(
      `UPDATE appointments 
       SET last_notified = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [nextAppointment.id]
    )

    return NextResponse.json({
      success: true,
      data: {
        notification,
        patient: {
          id: nextAppointment.patient_id,
          name: nextAppointment.patient_name,
          appointmentTime: nextAppointment.time,
        },
      },
      message: "Next patient notified successfully",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to notify next patient" }, { status: 500 })
  }
}
