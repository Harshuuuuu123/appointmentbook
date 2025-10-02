import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string; staffId: string } }) {
  try {
    const doctorId = Number(params.id)
    const staffId = Number(params.staffId)

    const staffRes = await query(
      `SELECT * FROM staff WHERE id = $1 AND doctor_id = $2 AND is_active = true`,
      [staffId, doctorId]
    )

    if (!staffRes.rows.length) {
      return NextResponse.json({ success: false, message: "Staff member not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: staffRes.rows[0],
      message: "Staff member retrieved successfully",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to retrieve staff member" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string; staffId: string } }) {
  try {
    const doctorId = Number(params.id)
    const staffId = Number(params.staffId)
    const body = await request.json()

    // Validate role if provided
    if (body.role) {
      const validRoles = ["nurse", "receptionist", "assistant", "doctor"]
      if (!validRoles.includes(body.role)) {
        return NextResponse.json(
          { success: false, message: "Invalid role. Must be one of: nurse, receptionist, assistant, doctor" },
          { status: 400 }
        )
      }
    }

    const fields = Object.keys(body)
    const values = Object.values(body)

    if (fields.length === 0) {
      return NextResponse.json({ success: false, message: "No fields provided for update" }, { status: 400 })
    }

    // Build dynamic SET clause
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ")

    // Add updated_at
    values.push(new Date().toISOString())
    const staffRes = await query(
      `UPDATE staff SET ${setClause}, updated_at = $${values.length} WHERE id = $${values.length + 1} AND doctor_id = $${values.length + 2} AND is_active = true RETURNING *`,
      [...values, staffId, doctorId]
    )

    if (!staffRes.rows.length) {
      return NextResponse.json({ success: false, message: "Staff member not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: staffRes.rows[0],
      message: "Staff member updated successfully",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to update staff member" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; staffId: string } }) {
  try {
    const doctorId = Number(params.id)
    const staffId = Number(params.staffId)

    const staffRes = await query(
      `UPDATE staff SET is_active = false, updated_at = NOW() WHERE id = $1 AND doctor_id = $2 AND is_active = true RETURNING *`,
      [staffId, doctorId]
    )

    if (!staffRes.rows.length) {
      return NextResponse.json({ success: false, message: "Staff member not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Staff member removed successfully",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to remove staff member" }, { status: 500 })
  }
}
