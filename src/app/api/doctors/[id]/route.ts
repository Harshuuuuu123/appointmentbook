import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET doctor by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const doctorId = Number(id)
    const res = await query(`SELECT * FROM doctor WHERE id = $1`, [doctorId])
    const doctor = res.rows[0]

    if (!doctor) {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: doctor,
      message: "Doctor retrieved successfully",
    })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to retrieve doctor", error: error.message }, { status: 500 })
  }
}

// update doctor
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const doctorId = Number(id)
    const body = await request.json()

    const fields: string[] = []
    const values: any[] = []
    let i = 1

    for (const key in body) {
      fields.push(`${key} = $${i++}`)
      values.push(body[key])
    }

    if (fields.length === 0) {
      return NextResponse.json({ success: false, message: "No fields to update" }, { status: 400 })
    }

    values.push(doctorId) 

    const res = await query(
      `UPDATE doctor SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${i} RETURNING *`,
      values
    )

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: res.rows[0],
      message: "Doctor updated successfully",
    })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to update doctor", error: error.message }, { status: 500 })
  }
}

// DELETE 
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const doctorId = Number(id)

    const res = await query(
      `UPDATE doctor SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [doctorId]
    )

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Doctor deactivated successfully",
    })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to deactivate doctor", error: error.message }, { status: 500 })
  }
}