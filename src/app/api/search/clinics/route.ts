import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET: List all clinics / optional search by name or location
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchQuery = url.searchParams.get("q") || "";

    let sql = `SELECT * FROM clinic ORDER BY id`;
    const values: any[] = [];

    if (searchQuery) {
      sql = `SELECT * FROM clinic 
             WHERE name ILIKE $1 OR location ILIKE $1
             ORDER BY id`;
      values.push(`%${searchQuery}%`);
    }

    const res = await query(sql, values);

    return NextResponse.json({
      status: 200,
      success: true,
      data: res.rows,
      message: searchQuery ? "Clinic search results" : "Clinics retrieved successfully",
    });
  } catch (error: any) {
    console.error("GET clinics error:", error.message);
    return NextResponse.json({
      status: 500,
      success: false,
      message: "Failed to fetch clinics",
      error: error.message,
    });
  }
}

// POST: Create a new clinic
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, location, phone, email } = body;

    if (!name || !location) {
      return NextResponse.json(
        { success: false, message: "Name and location are required" },
        { status: 400 }
      );
    }

    // Optional: check if email already exists
    if (email) {
      const existing = await query(`SELECT id FROM clinic WHERE email = $1`, [email]);
      if (existing.rows.length) {
        return NextResponse.json(
          { success: false, message: "Clinic with this email already exists" },
          { status: 409 }
        );
      }
    }

    const insertRes = await query(
      `INSERT INTO clinic (name, location, phone, email, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, true, NOW(), NOW()) RETURNING *`,
      [name, location, phone || null, email || null]
    );

    return NextResponse.json({
      status: 201,
      success: true,
      data: insertRes.rows[0],
      message: "Clinic created successfully",
    });
  } catch (error: any) {
    console.error("POST clinic error:", error.message);
    return NextResponse.json({
      status: 500,
      success: false,
      message: "Failed to create clinic",
      error: error.message,
    });
  }
}
