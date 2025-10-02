import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET: Retrieve doctor queue for a given date
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const doctorId = Number(params.id)
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

    // Fetch doctor
    const doctorRes = await query(`SELECT * FROM doctor WHERE id = $1`, [doctorId])
    const doctor = doctorRes.rows[0]
    if (!doctor) {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })
    }

    // Fetch today's appointments for this doctor
    const appointmentsRes = await query(
      `SELECT a.*, p.name AS patient_name, p.phone AS patient_phone, p.age AS patient_age
       FROM appointment a
       LEFT JOIN patient p ON a.patient_id = p.id
       WHERE a.doctor_id = $1 AND a.date = $2 AND a.status IN ('scheduled', 'confirmed', 'in-progress')
       ORDER BY a.time ASC`,
      [doctorId, date]
    )
    const todayAppointments = appointmentsRes.rows

    // Map queue with details
    const queueWithDetails = todayAppointments.map((appointment, index) => {
      const estimatedWaitTime = calculateWaitTime(index)
      return {
        appointmentId: appointment.id,
        queuePosition: index + 1,
        patient: {
          id: appointment.patient_id,
          name: appointment.patient_name,
          phone: appointment.patient_phone,
          age: appointment.patient_age,
        },
        appointmentTime: appointment.time,
        status: appointment.status,
        estimatedWaitTime,
        notes: appointment.notes || null,
        checkedIn: appointment.checked_in || false,
        checkedInAt: appointment.checked_in_at || null,
      }
    })

    const currentPatient = queueWithDetails.find((item) => item.status === "in-progress")
    const waitingPatients = queueWithDetails.filter((item) => item.status !== "in-progress")

    // Count completed and no-shows
    const completedRes = await query(
      `SELECT COUNT(*) FROM appointment WHERE doctor_id = $1 AND date = $2 AND status = 'completed'`,
      [doctorId, date]
    )
    const noShowRes = await query(
      `SELECT COUNT(*) FROM appointment WHERE doctor_id = $1 AND date = $2 AND status = 'no-show'`,
      [doctorId, date]
    )

    return NextResponse.json({
      success: true,
      data: {
        date,
        doctorName: doctor.name,
        currentPatient,
        waitingQueue: waitingPatients,
        totalPatients: queueWithDetails.length,
        completedToday: parseInt(completedRes.rows[0].count, 10),
        noShowsToday: parseInt(noShowRes.rows[0].count, 10),
      },
      message: "Queue retrieved successfully",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to retrieve queue" }, { status: 500 })
  }
}

// Helper function to calculate estimated wait time in minutes
function calculateWaitTime(position: number): number {
  const averageConsultationTime = 15 // minutes
  return position === 0 ? 0 : position * averageConsultationTime
}
