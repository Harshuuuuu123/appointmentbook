import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// CREATE DOCTOR
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const doctorId = request.headers.get("x-doctor-id"); // Dashboard doctor ID
    const { name, email, specialization, experience, qualification } = body;

    if (!name || !email || !specialization || !experience || !qualification) {
      return NextResponse.json(
        {
          success: false,
          message: "All required fields (name, email, specialization, experience, qualification) must be provided",
        },
        { status: 400 }
      );
    }

    const existing = await query("SELECT id FROM doctor WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "Doctor with this email already exists" },
        { status: 409 }
      );
    }

    const result = await query(
      `INSERT INTO doctor 
       (name, email, specialization, experience, qualification, is_active, created_at, updated_at, created_by)
       VALUES ($1,$2,$3,$4,$5,true,NOW(),NOW(),$6) RETURNING *`,
      [name, email, specialization, experience, qualification, doctorId]
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: "Doctor registered successfully",
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error creating doctor:", err.message);
    return NextResponse.json(
      { success: false, message: "Failed to create doctor", error: err.message },
      { status: 500 }
    );
  }
}

// GET / SEARCH DOCTORS
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").trim();
    const doctorId = request.headers.get("x-doctor-id"); // Only dashboard sends this

    let sql = `SELECT * FROM doctor WHERE is_active = true`;
    const values: any[] = [];

    if (doctorId) {
      // Show only doctors created by this logged-in doctor
      sql += ` AND created_by = $1`;
      values.push(doctorId);
    }

    if (q) {
      sql += doctorId
        ? ` AND (name ILIKE $2 OR email ILIKE $2 OR specialization ILIKE $2)`
        : ` AND (name ILIKE $1 OR email ILIKE $1 OR specialization ILIKE $1)`;
      values.push(`%${q}%`);
    }

    sql += ` ORDER BY id`;

    const result = await query(sql, values);

    return NextResponse.json(
      {
        success: true,
        data: result.rows,
        message: q ? "Doctors search results" : "Doctors retrieved successfully",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error searching doctors:", err.message);
    return NextResponse.json(
      { success: false, message: "Failed to search doctors", error: err.message },
      { status: 500 }
    );
  }
}

// UPDATE DOCTOR
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, specialization, experience, qualification } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Doctor ID is required for update" },
        { status: 400 }
      );
    }

    const existing = await query("SELECT id FROM doctor WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 }
      );
    }

    const result = await query(
      `UPDATE doctor 
       SET name = COALESCE($2, name),
           email = COALESCE($3, email),
           specialization = COALESCE($4, specialization),
           experience = COALESCE($5, experience),
           qualification = COALESCE($6, qualification),
           updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, name, email, specialization, experience, qualification]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0], message: "Doctor updated successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error updating doctor:", err.message);
    return NextResponse.json(
      { success: false, message: "Failed to update doctor", error: err.message },
      { status: 500 }
    );
  }
}

// DELETE DOCTOR
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Doctor ID is required for delete" },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE doctor SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.rows[0], message: "Doctor deleted successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error deleting doctor:", err.message);
    return NextResponse.json(
      { success: false, message: "Failed to delete doctor", error: err.message },
      { status: 500 }
    );
  }
}
