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
       FROM appointment a
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
       SET status = 'completed',
           completed_at = NOW(),
           updated_at = NOW(),
           consultation_notes = $1,
           prescription = $2,
           follow_up_required = $3,
           follow_up_date = $4,
           consultation_duration = $5
       WHERE id = $6
       RETURNING *`,
      [
        body.consultationNotes || "",
        body.prescription || "",
        body.followUpRequired || false,
        body.followUpDate || null,
        body.consultationDuration || null,
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
      message: "Appointment marked as completed successfully",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, message: "Failed to complete appointment" },
      { status: 500 }
    )
  }
}
