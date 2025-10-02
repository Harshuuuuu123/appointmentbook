import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const doctorId = Number(params.id)

    // Check if doctor exists
    const doctorRes = await query(`SELECT id FROM doctor WHERE id = $1`, [doctorId])
    if (!doctorRes.rows.length) return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })

    // Fetch active staff
    const staffRes = await query(`SELECT * FROM staff WHERE doctor_id = $1 AND is_active = true ORDER BY created_at`, [doctorId])
    return NextResponse.json({ success: true, data: staffRes.rows, message: "Staff retrieved successfully" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to retrieve staff" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const doctorId = Number(params.id)
    const body = await request.json()
    const { name, email, phone, role } = body

    // Validate required fields
    const requiredFields = { name, email, phone, role }
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) return NextResponse.json({ success: false, message: `${key} is required` }, { status: 400 })
    }

    // Validate role
    const validRoles = ["nurse", "receptionist", "assistant", "doctor"]
    if (!validRoles.includes(role))
      return NextResponse.json(
        { success: false, message: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      )

    // Check if doctor exists
    const doctorRes = await query(`SELECT id FROM doctor WHERE id = $1`, [doctorId])
    if (!doctorRes.rows.length) return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })

    // Check for duplicate email
    const existingStaffRes = await query(`SELECT id FROM staff WHERE doctor_id = $1 AND email = $2 AND is_active = true`, [doctorId, email])
    if (existingStaffRes.rows.length)
      return NextResponse.json({ success: false, message: "Staff member with this email already exists" }, { status: 409 })

    // Insert staff
    const insertRes = await query(
      `INSERT INTO staff (doctor_id, name, email, phone, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW()) RETURNING *`,
      [doctorId, name, email, phone, role]
    )

    return NextResponse.json({ success: true, data: insertRes.rows[0], message: "Staff member added successfully" }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to add staff member" }, { status: 500 })
  }
}
