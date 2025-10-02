import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const doctorId = Number(params.id)
    const body = await request.json()

    if (!Array.isArray(body.staff)) {
      return NextResponse.json({ success: false, message: "Staff must be an array" }, { status: 400 })
    }

    // Check if doctor exists
    const doctorRes = await query(`SELECT id FROM doctor WHERE id = $1`, [doctorId])
    if (!doctorRes.rows.length) {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })
    }

    const validRoles = ["nurse", "receptionist", "assistant", "doctor"]
    const addedStaff: any[] = []
    const errors: string[] = []

    for (let i = 0; i < body.staff.length; i++) {
      const staffData = body.staff[i]
      const { name, email, phone, role } = staffData
      let hasError = false

      // Validate required fields
      if (!name) { errors.push(`Staff ${i + 1}: name is required`); hasError = true }
      if (!email) { errors.push(`Staff ${i + 1}: email is required`); hasError = true }
      if (!phone) { errors.push(`Staff ${i + 1}: phone is required`); hasError = true }
      if (!role) { errors.push(`Staff ${i + 1}: role is required`); hasError = true }

      // Validate role
      if (role && !validRoles.includes(role)) {
        errors.push(`Staff ${i + 1}: Invalid role`)
        hasError = true
      }

      // Check for duplicate email for this doctor
      const existingStaffRes = await query(
        `SELECT id FROM staff WHERE doctor_id = $1 AND email = $2 AND is_active = true`,
        [doctorId, email]
      )
      if (existingStaffRes.rows.length) {
        errors.push(`Staff ${i + 1}: Email already exists`)
        hasError = true
      }

      if (!hasError) {
        const insertRes = await query(
          `INSERT INTO staff (doctor_id, name, email, phone, role, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW()) RETURNING *`,
          [doctorId, name, email, phone, role]
        )
        addedStaff.push(insertRes.rows[0])
      }
    }

    return NextResponse.json(
      {
        success: errors.length === 0,
        data: { added: addedStaff, errors },
        message:
          errors.length === 0
            ? "All staff members added successfully"
            : `${addedStaff.length} staff members added, ${errors.length} errors occurred`,
      },
      { status: errors.length === 0 ? 201 : 207 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to add staff members" }, { status: 500 })
  }
}
