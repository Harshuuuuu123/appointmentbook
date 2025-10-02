import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// Helper: Get doctor ID from headers
const getDoctorId = (req: NextRequest) => {
  return req.headers.get("x-doctor-id") || null;
};

// GET: List/Search Staff
export async function GET(request: NextRequest) {
  try {
    const doctorId = getDoctorId(request);
    if (!doctorId) {
      return NextResponse.json({ success: false, message: "Doctor ID required" }, { status: 401 });
    }

    const url = new URL(request.url);
    const searchQuery = url.searchParams.get("q") || "";

    let sql = `SELECT * FROM staff WHERE doctor_id = $1`;
    const values: any[] = [doctorId];

    if (searchQuery) {
      sql += ` AND (name ILIKE $2 OR role ILIKE $2)`;
      values.push(`%${searchQuery}%`);
    }

    sql += ` ORDER BY id`;

    const res = await query(sql, values);

    return NextResponse.json({
      success: true,
      data: res.rows,
      message: searchQuery ? "Staff search results" : "Staff retrieved successfully",
    });
  } catch (error: any) {
    console.error("GET staff error:", error.message);
    return NextResponse.json({ success: false, message: "Failed to retrieve staff", error: error.message }, { status: 500 });
  }
}

// POST: Create Staff
export async function POST(request: NextRequest) {
  try {
    const doctorId = getDoctorId(request);
    if (!doctorId) return NextResponse.json({ success: false, message: "Doctor ID required" }, { status: 401 });

    const body = await request.json();
    const { name, role, email, phone } = body;

    if (!name || !role || !email) {
      return NextResponse.json({ success: false, message: "Name, role, and email are required" }, { status: 400 });
    }

    const existing = await query(`SELECT id FROM staff WHERE email = $1 AND doctor_id = $2`, [email, doctorId]);
    if (existing.rows.length) {
      return NextResponse.json({ success: false, message: "Staff with this email already exists" }, { status: 409 });
    }

    const insertRes = await query(
      `INSERT INTO staff (name, role, email, phone, is_active, doctor_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, true, $5, NOW(), NOW()) RETURNING *`,
      [name, role, email, phone || null, doctorId]
    );

    return NextResponse.json({ success: true, data: insertRes.rows[0], message: "Staff member created successfully" });
  } catch (error: any) {
    console.error("POST staff error:", error.message);
    return NextResponse.json({ success: false, message: "Failed to create staff", error: error.message }, { status: 500 });
  }
}

// PUT: Update Staff
export async function PUT(request: NextRequest) {
  try {
    const doctorId = getDoctorId(request);
    if (!doctorId) return NextResponse.json({ success: false, message: "Doctor ID required" }, { status: 401 });

    const body = await request.json();
    const { id, name, role, email, phone, is_active } = body;

    if (!id) return NextResponse.json({ success: false, message: "Staff ID is required" }, { status: 400 });

    const existing = await query(`SELECT * FROM staff WHERE id = $1 AND doctor_id = $2`, [id, doctorId]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Staff not found" }, { status: 404 });
    }

    const updateRes = await query(
      `UPDATE staff
       SET name = COALESCE($1, name),
           role = COALESCE($2, role),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           is_active = COALESCE($5, is_active),
           updated_at = NOW()
       WHERE id = $6 AND doctor_id = $7
       RETURNING *`,
      [name, role, email, phone, is_active, id, doctorId]
    );

    return NextResponse.json({ success: true, data: updateRes.rows[0], message: "Staff updated successfully" });
  } catch (error: any) {
    console.error("PUT staff error:", error.message);
    return NextResponse.json({ success: false, message: "Failed to update staff", error: error.message }, { status: 500 });
  }
}

// DELETE: Delete Staff
export async function DELETE(request: NextRequest) {
  try {
    const doctorId = getDoctorId(request);
    if (!doctorId) return NextResponse.json({ success: false, message: "Doctor ID required" }, { status: 401 });

    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const id = url.searchParams.get("id") || body.id;

    if (!id) return NextResponse.json({ success: false, message: "Staff ID is required" }, { status: 400 });

    const existing = await query(`SELECT * FROM staff WHERE id = $1 AND doctor_id = $2`, [id, doctorId]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Staff not found" }, { status: 404 });
    }

    await query(`DELETE FROM staff WHERE id = $1 AND doctor_id = $2`, [id, doctorId]);

    return NextResponse.json({ success: true, message: "Staff deleted successfully" });
  } catch (error: any) {
    console.error("DELETE staff error:", error.message);
    return NextResponse.json({ success: false, message: "Failed to delete staff", error: error.message }, { status: 500 });
  }
};
