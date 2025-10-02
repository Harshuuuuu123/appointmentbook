import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, phone, email, password, role } = body;

    // Basic validation
    if (!username || !phone || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    if (!["doctor", "patient", "user"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid role" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await query(
      `INSERT INTO users (username, phone, email, password_hash, role, is_active, is_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, false, NOW(), NOW())
       RETURNING id, username, phone, email, role, is_active, is_verified`,
      [username, phone, email, hashedPassword, role]
    );

    const newUser = result.rows[0];

    // If role is patient, insert into patient table
    if (role === "patient") {
      await query(
        `INSERT INTO patient (id, name, email, phone, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, true, NOW(), NOW())`,
        [newUser.id, username, email, phone]
      );
    }

    // ✅ If role is doctor, insert into doctor table
    if (role === "doctor") {
      await query(
        `INSERT INTO doctor (id, name, specialization, qualification, profile_image, clinic_id, created_at, updated_at)
         VALUES ($1, $2, NULL, NULL, NULL, NULL, NOW(), NOW())`,
        [newUser.id, username]
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: newUser,
        message: "User registered successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to register user" },
      { status: 500 }
    );
  }
}
