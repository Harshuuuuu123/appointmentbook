import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// Allowed fields for updating doctor_statuses
const ALLOWED_UPDATE_FIELDS = ["status", "message", "estimated_delay"]

// GET: Retrieve latest doctor status
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const doctorId = Number(params.id)

    // Check if doctor exists
    const doctorRes = await query(`SELECT * FROM doctor WHERE id = $1`, [doctorId])
    if (!doctorRes.rows.length) {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })
    }

    // Get latest status
    const statusRes = await query(
      `SELECT * FROM doctor_statuses WHERE doctor_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [doctorId]
    )

    const defaultStatus = {
      status: "available",
      message: "Doctor is available",
      estimated_delay: 0,
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: statusRes.rows[0] || defaultStatus,
      message: "Doctor status retrieved successfully",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to retrieve doctor status" }, { status: 500 })
  }
}

// POST: Create a new doctor status
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const doctorId = Number(params.id)
    const body = await request.json()
    const { status, message, estimatedDelay } = body

    // Check doctor existence
    const doctorRes = await query(`SELECT * FROM doctor WHERE id = $1`, [doctorId])
    if (!doctorRes.rows.length) {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })
    }

    // Validate status
    const validStatuses = ["available", "delayed", "unavailable", "in-consultation", "emergency"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 })
    }

    // Insert new status
    const newStatusRes = await query(
      `INSERT INTO doctor_statuses (doctor_id, status, message, estimated_delay, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
      [doctorId, status, message || "", estimatedDelay || 0]
    )

    // Notify patients if delayed
    if (status === "delayed" && estimatedDelay > 0) {
      await notifyAffectedPatients(doctorId, estimatedDelay, message || "")
    }

    return NextResponse.json({
      success: true,
      data: newStatusRes.rows[0],
      message: "Doctor status updated successfully",
    }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to update doctor status" }, { status: 500 })
  }
}

// PUT: Update latest doctor status
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const doctorId = Number(params.id)
    const body = await request.json()

    // Only allow updating certain fields
    const fieldsToUpdate = Object.keys(body).filter((f) => ALLOWED_UPDATE_FIELDS.includes(f))
    if (fieldsToUpdate.length === 0) {
      return NextResponse.json({ success: false, message: "No valid fields provided for update" }, { status: 400 })
    }

    const values = fieldsToUpdate.map((f) => body[f])
    const setClause = fieldsToUpdate.map((f, i) => `${f} = $${i + 1}`).join(", ")

    // Add doctorId to values for the WHERE clause
    values.push(doctorId)

    const updatedStatusRes = await query(
      `UPDATE doctor_statuses SET ${setClause}, updated_at = NOW()
       WHERE id = (
         SELECT id FROM doctor_statuses WHERE doctor_id = $${values.length} ORDER BY created_at DESC LIMIT 1
       )
       RETURNING *`,
      values
    )

    if (!updatedStatusRes.rows.length) {
      return NextResponse.json({ success: false, message: "No current status found. Use POST to create." }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedStatusRes.rows[0],
      message: "Doctor status updated successfully",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to update doctor status" }, { status: 500 })
  }
}

// Notify patients about delays
async function notifyAffectedPatients(doctorId: number, delayMinutes: number, message: string) {
  const today = new Date().toISOString().split("T")[0]

  const appointmentsRes = await query(
    `SELECT a.id, a.patient_id, a.time, p.name AS patient_name, d.name AS doctor_name
     FROM appointment a
     JOIN patient p ON a.patient_id = p.id
     JOIN doctor d ON a.doctor_id = d.id
     WHERE a.doctor_id = $1 AND a.date = $2 AND a.status IN ('scheduled', 'confirmed')`,
    [doctorId, today]
  )

  for (const apt of appointmentsRes.rows) {
    const originalTime = new Date(`${today}T${apt.time}`)
    const newTime = new Date(originalTime.getTime() + delayMinutes * 60000)

    await query(
      `INSERT INTO notification (recipient_id, recipient_type, type, title, message, data, is_read, created_at)
       VALUES ($1, 'patient', 'appointment_delay', 'Appointment Delayed', $2, $3, false, NOW())`,
      [
        apt.patient_id,
        `Dr. ${apt.doctor_name} is running ${delayMinutes} minutes late. ${message}`,
        JSON.stringify({
          appointmentId: apt.id,
          originalTime: apt.time,
          newTime: newTime.toTimeString().slice(0, 5),
          delayMinutes,
          doctorMessage: message,
        }),
      ]
    )
  }
}
