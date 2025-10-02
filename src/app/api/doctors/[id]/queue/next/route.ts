import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const doctorId = Number(params.id)
    const body = await request.json()
    const { currentAppointmentId, action } = body

    if (!currentAppointmentId || !action) {
      return NextResponse.json({ success: false, message: "currentAppointmentId and action are required" }, { status: 400 })
    }

    if (!["complete", "no-show"].includes(action)) {
      return NextResponse.json({ success: false, message: "Action must be 'complete' or 'no-show'" }, { status: 400 })
    }

    const today = new Date().toISOString().split("T")[0]

    // Fetch doctor with clinic info
    const doctorRes = await query(`
      SELECT d.*, c.name AS clinic_name
      FROM doctor d
      LEFT JOIN clinic c ON c.doctor_id = d.id
      WHERE d.id = $1
    `, [doctorId])
    const doctor = doctorRes.rows[0]
    if (!doctor) return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })

    // Fetch current appointment
    const appointmentRes = await query(`SELECT * FROM appointment WHERE id = $1`, [currentAppointmentId])
    const currentAppointment = appointmentRes.rows[0]
    if (!currentAppointment) return NextResponse.json({ success: false, message: "Current appointment not found" }, { status: 404 })

    // Update current appointment status
    const statusUpdate = action === "complete" ? "completed" : "no-show"
    await query(
      `UPDATE appointment SET status = $1, completed_at = NOW(), updated_at = NOW() WHERE id = $2`,
      [statusUpdate, currentAppointmentId]
    )

    // Find next patient in queue
    const nextAppointmentRes = await query(
      `SELECT a.*, p.name AS patient_name, p.id AS patient_id
       FROM appointment a
       JOIN patients p ON a.patient_id = p.id
       WHERE a.doctor_id = $1 AND a.date = $2 AND a.status IN ('scheduled','confirmed') AND a.time > $3
       ORDER BY a.time ASC
       LIMIT 1`,
      [doctorId, today, currentAppointment.time]
    )
    const nextAppointment = nextAppointmentRes.rows[0]

    let nextPatientNotified = false
    if (nextAppointment) {
      // Mark next appointment as in-progress
      await query(`UPDATE appointment SET status='in-progress', updated_at=NOW() WHERE id=$1`, [nextAppointment.id])

      // Create notification for next patient
      await query(
        `INSERT INTO notifications (recipient_id, recipient_type, type, title, message, data, is_read, created_at)
         VALUES ($1, 'patient', 'ready_for_consultation', 'Ready for Consultation', $2, $3, false, NOW())`,
        [
          nextAppointment.patient_id,
          `Dr. ${doctor.name} is ready to see you now. Please proceed to the consultation room.`,
          JSON.stringify({
            appointmentId: nextAppointment.id,
            doctorName: doctor.name,
            clinicName: doctor.clinic_name || null,
            location: "Consultation Room",
          }),
        ]
      )
      nextPatientNotified = true
    }

    // Count remaining patients in queue
    const remainingRes = await query(
      `SELECT COUNT(*) FROM appointment
       WHERE doctor_id = $1 AND date = $2 AND status IN ('scheduled','confirmed','in-progress')`,
      [doctorId, today]
    )
    const remainingInQueue = parseInt(remainingRes.rows[0].count, 10)

    return NextResponse.json({
      success: true,
      data: {
        completedAppointment: {
          id: currentAppointment.id,
          status: statusUpdate,
        },
        nextAppointment: nextAppointment
          ? {
              id: nextAppointment.id,
              patientName: nextAppointment.patient_name,
              time: nextAppointment.time,
              notified: nextPatientNotified,
            }
          : null,
        remainingInQueue,
      },
      message: `Appointment marked as ${statusUpdate}${nextPatientNotified ? " and next patient notified" : ""}`,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to process queue" }, { status: 500 })
  }
}
