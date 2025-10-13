// src/app/api/staff/member/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  
  try {
    const doctorIdHeader = req.headers.get("x-doctor-id");
    if (!doctorIdHeader) {
      return NextResponse.json({ success: false, message: "Doctor ID is required" }, { status: 400 });
    }

    const doctorId = parseInt(doctorIdHeader, 10);
    if (isNaN(doctorId)) {
      return NextResponse.json({ success: false, message: "Invalid Doctor ID" }, { status: 400 });
    }

    const { rows } = await pool.query(
      "SELECT id, name, role, email, phone, is_active, created_at FROM staff WHERE doctor_id = $1 ORDER BY created_at DESC",
      [doctorId]
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error("Error fetching staff members:", error.message);
    return NextResponse.json({ success: false, message: "Failed to fetch members", error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const doctorIdHeader = req.headers.get("x-doctor-id");
    if (!doctorIdHeader) {
      return NextResponse.json({ success: false, message: "Doctor ID is required" }, { status: 400 });
    }

    const doctorId = parseInt(doctorIdHeader, 10);
    if (isNaN(doctorId)) {
      return NextResponse.json({ success: false, message: "Invalid Doctor ID" }, { status: 400 });
    }

    const body = await req.json();
    const { name, role, email, phone } = body;

    if (!name || !role || !email) {
      return NextResponse.json({ success: false, message: "Name, role, and email are required" }, { status: 400 });
    }

    const { rows } = await pool.query(
      "INSERT INTO staff (doctor_id, name, role, email, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [doctorId, name, role, email, phone || null]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error: any) {
    console.error("Error adding staff member:", error.message);
    return NextResponse.json({ success: false, message: "Failed to add staff", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const doctorIdHeader = req.headers.get("x-doctor-id");
    if (!doctorIdHeader) {
      return NextResponse.json({ success: false, message: "Doctor ID is required" }, { status: 400 });
    }

    const doctorId = parseInt(doctorIdHeader, 10);
    if (isNaN(doctorId)) {
      return NextResponse.json({ success: false, message: "Invalid Doctor ID" }, { status: 400 });
    }

    const url = new URL(req.url);
    const memberId = parseInt(url.searchParams.get("id") || "", 10);
    if (isNaN(memberId)) {
      return NextResponse.json({ success: false, message: "Invalid member ID" }, { status: 400 });
    }

    const { rowCount } = await pool.query(
      "DELETE FROM staff WHERE id = $1 AND doctor_id = $2",
      [memberId, doctorId]
    );

    if (rowCount === 0) {
      return NextResponse.json({ success: false, message: "Staff member not found or not allowed" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Staff member removed successfully" });
  } catch (err: any) {
    console.error("Error deleting staff member:", err.message);
    return NextResponse.json({ success: false, message: "Failed to remove staff member", error: err.message }, { status: 500 });
  }
}
