import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// POST: Add a clinic for a doctor
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const doctorId = Number(params.id)
    const body = await request.json()

    // Validate required clinic fields
    const requiredFields = ["name", "address", "phone", "city", "state", "pincode"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ success: false, message: `Clinic ${field} is required` }, { status: 400 })
      }
    }

    // Check if doctor exists
    const doctorRes = await query(`SELECT * FROM doctor WHERE id = $1`, [doctorId])
    const doctor = doctorRes.rows[0]
    if (!doctor) {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })
    }

    // Insert clinic into DB
    const insertClinicRes = await query(
      `INSERT INTO clinic (doctor_id, name, address, phone, city, state, pincode, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW()) RETURNING *`,
      [doctorId, body.name, body.address, body.phone, body.city, body.state, body.pincode]
    )
    const clinic = insertClinicRes.rows[0]

    // Optionally update doctor's updated_at
    await query(`UPDATE doctor SET updated_at = NOW() WHERE id = $1`, [doctorId])

    return NextResponse.json({
      success: true,
      data: clinic,
      message: "Clinic registered successfully",
    }, { status: 201 })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to register clinic" }, { status: 500 })
  }
}

// PUT: Update clinic for a doctor
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const doctorId = Number(params.id)
    const body = await request.json()

    // Check if doctor exists
    const doctorRes = await query(`SELECT * FROM doctor WHERE id = $1`, [doctorId])
    const doctor = doctorRes.rows[0]
    if (!doctor) {
      return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })
    }

    // Check if clinic exists
    const clinicRes = await query(`SELECT * FROM clinic WHERE doctor_id = $1`, [doctorId])
    const clinic = clinicRes.rows[0]
    if (!clinic) {
      return NextResponse.json({ success: false, message: "No clinic found for this doctor" }, { status: 404 })
    }

    // Update clinic
    const updatedClinicRes = await query(
      `UPDATE clinic SET
        name = COALESCE($1, name),
        address = COALESCE($2, address),
        phone = COALESCE($3, phone),
        city = COALESCE($4, city),
        state = COALESCE($5, state),
        pincode = COALESCE($6, pincode),
        updated_at = NOW()
       WHERE doctor_id = $7
       RETURNING *`,
      [body.name, body.address, body.phone, body.city, body.state, body.pincode, doctorId]
    )
    const updatedClinic = updatedClinicRes.rows[0]

    // Update doctor's updated_at
    await query(`UPDATE doctor SET updated_at = NOW() WHERE id = $1`, [doctorId])

    return NextResponse.json({
      success: true,
      data: updatedClinic,
      message: "Clinic updated successfully",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: "Failed to update clinic" }, { status: 500 })
  }
}
