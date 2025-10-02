import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = Number(params.id)
    const body = await request.json()

  
    const appointmentRes = await query(
      `SELECT a.*, d.name as doctor_name, p.name as patient_name
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

    
    const updatedRes = await query(
      `UPDATE appointments
       SET status = 'no-show',
           no_show_at = NOW(),
           no_show_reason = $1,
           waited_until = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [
        body.reason || "Patient did not arrive",
        body.waitedUntil || null,
        appointmentId,
      ]
    )

    const updatedAppointment = updatedRes.rows[0]

    return NextResponse.json({
      success: true,
      data: {
        appointment: updatedAppointment,
        doctorName: appointment.doctor_name,
        patientName: appointment.patient_name,
      },
      message: "Appointment marked as no-show successfully",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, message: "Failed to mark appointment as no-show" },
      { status: 500 }
    )
  }
}
