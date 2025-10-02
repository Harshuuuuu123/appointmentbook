import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET: Retrieve doctor's active timings
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const doctorId = Number(params.id)

    // Check if doctor exists
    const doctorRes = await query(`SELECT * FROM doctor WHERE id = $1`, [doctorId])
    if (!doctorRes.rows.length) {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })
    }

    // Fetch active timings
    const timingsRes = await query(
      `SELECT * FROM doctor_timings 
       WHERE doctor_id = $1 AND is_active = true 
       ORDER BY day_of_week, start_time`,
      [doctorId]
    )

    return NextResponse.json({
      success: true,
      data: timingsRes.rows,
      message: "Doctor timings retrieved successfully",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to retrieve timings" }, { status: 500 })
  }
}

// POST: Add a new timing for the doctor
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const doctorId = Number(params.id)
    const body = await request.json()
    const { dayOfWeek, startTime, endTime, maxBookings, slotDuration } = body

    // Validate doctor exists
    const doctorRes = await query(`SELECT * FROM doctor WHERE id = $1`, [doctorId])
    if (!doctorRes.rows.length) {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })
    }

    // Validate dayOfWeek
    if (typeof dayOfWeek !== "number" || dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json({ success: false, message: "dayOfWeek must be a number between 0 and 6" }, { status: 400 })
    }

    // Validate startTime and endTime format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json({ success: false, message: "Time must be in HH:MM format" }, { status: 400 })
    }

    // Validate start < end
    const [startH, startM] = startTime.split(":").map(Number)
    const [endH, endM] = endTime.split(":").map(Number)
    if (startH * 60 + startM >= endH * 60 + endM) {
      return NextResponse.json({ success: false, message: "Start time must be before end time" }, { status: 400 })
    }

    // Validate positive numbers
    if (maxBookings <= 0 || slotDuration <= 0) {
      return NextResponse.json({ success: false, message: "maxBookings and slotDuration must be positive numbers" }, { status: 400 })
    }

    // Check overlapping timings
    const overlapRes = await query(
      `SELECT * FROM doctor_timings 
       WHERE doctor_id = $1 AND day_of_week = $2 AND is_active = true`,
      [doctorId, dayOfWeek]
    )
    if (overlapRes.rows.length) {
      return NextResponse.json({
        success: false,
        message: "Timing already exists for this day. Update the existing timing instead.",
      }, { status: 409 })
    }

    // Insert new timing
    const newTimingRes = await query(
      `INSERT INTO doctor_timings 
       (doctor_id, day_of_week, start_time, end_time, max_bookings, slot_duration, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW()) RETURNING *`,
      [doctorId, dayOfWeek, startTime, endTime, maxBookings, slotDuration]
    )

    return NextResponse.json({
      success: true,
      data: newTimingRes.rows[0],
      message: "Doctor timing added successfully",
    }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to add timing" }, { status: 500 })
  }
}
