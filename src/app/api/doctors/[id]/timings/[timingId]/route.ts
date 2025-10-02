import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string; timingId: string } }) {
  try {
    const doctorId = Number(params.id)
    const timingId = Number(params.timingId)
    const body = await request.json()
    const { startTime, endTime, maxBookings, slotDuration, dayOfWeek } = body

    // Check doctor exists
    const doctorRes = await query(`SELECT * FROM doctor WHERE id = $1`, [doctorId])
    if (!doctorRes.rows.length) {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })
    }

    // Check timing exists
    const timingRes = await query(
      `SELECT * FROM doctor_timings WHERE id = $1 AND doctor_id = $2 AND is_active = true`,
      [timingId, doctorId]
    )
    if (!timingRes.rows.length) {
      return NextResponse.json({ success: false, message: "Timing not found" }, { status: 404 })
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if ((startTime && !timeRegex.test(startTime)) || (endTime && !timeRegex.test(endTime))) {
      return NextResponse.json({ success: false, message: "Time must be in HH:MM format" }, { status: 400 })
    }


    if ((maxBookings && maxBookings <= 0) || (slotDuration && slotDuration <= 0)) {
      return NextResponse.json({ success: false, message: "maxBookings and slotDuration must be positive" }, { status: 400 })
    }

    // Validate dayOfWeek
    if (dayOfWeek !== undefined && (dayOfWeek < 0 || dayOfWeek > 6)) {
      return NextResponse.json({ success: false, message: "dayOfWeek must be between 0 and 6" }, { status: 400 })
    }

    // Prepare update query
    const updateFields: string[] = []
    const values: any[] = []

    if (startTime) { updateFields.push(`start_time = $${updateFields.length + 1}`); values.push(startTime) }
    if (endTime) { updateFields.push(`end_time = $${updateFields.length + 1}`); values.push(endTime) }
    if (maxBookings !== undefined) { updateFields.push(`max_bookings = $${updateFields.length + 1}`); values.push(maxBookings) }
    if (slotDuration !== undefined) { updateFields.push(`slot_duration = $${updateFields.length + 1}`); values.push(slotDuration) }
    if (dayOfWeek !== undefined) { updateFields.push(`day_of_week = $${updateFields.length + 1}`); values.push(dayOfWeek) }

    if (!updateFields.length) {
      return NextResponse.json({ success: false, message: "No fields provided for update" }, { status: 400 })
    }

    values.push(new Date()) 
    values.push(timingId)
    values.push(doctorId)

    const updatedTiming = await query(
      `UPDATE doctor_timings 
       SET ${updateFields.join(", ")}, updated_at = $${values.length - 2} 
       WHERE id = $${values.length - 1} AND doctor_id = $${values.length} 
       RETURNING *`,
      values
    )

    return NextResponse.json({
      success: true,
      data: updatedTiming.rows[0],
      message: "Timing updated successfully",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to update timing" }, { status: 500 })
  }
}

// DELETE: Soft delete a specific timing
export async function DELETE(request: NextRequest, { params }: { params: { id: string; timingId: string } }) {
  try {
    const doctorId = Number(params.id)
    const timingId = Number(params.timingId)

    // Check doctor exists
    const doctorRes = await query(`SELECT * FROM doctor WHERE id = $1`, [doctorId])
    if (!doctorRes.rows.length) {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })
    }

    // Soft delete timing
    const deletedTiming = await query(
      `UPDATE doctor_timings 
       SET is_active = false, updated_at = NOW() 
       WHERE id = $1 AND doctor_id = $2 AND is_active = true 
       RETURNING *`,
      [timingId, doctorId]
    )

    if (!deletedTiming.rows.length) {
      return NextResponse.json({ success: false, message: "Timing not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Timing deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to delete timing" }, { status: 500 })
  }
}
