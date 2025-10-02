// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(request: NextRequest) {
  try {
    const { emailOrPhone, password } = await request.json();

    if (!emailOrPhone || !password) {
      return NextResponse.json({ success: false, message: "Email/Phone & password required" }, { status: 400 });
    }

    // Fetch user
    const userRes = await query("SELECT * FROM users WHERE email=$1 OR phone=$2", [emailOrPhone, emailOrPhone]);
    const user = userRes.rows[0];
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return NextResponse.json({ success: false, message: "Invalid password" }, { status: 401 });

    let extraData: any = {};

    if (user.role === "doctor") {
      // 🔹 Fetch doctor by user_id
      const doctorRes = await query("SELECT * FROM doctor WHERE user_id=$1", [user.id]);
      if (doctorRes.rows.length > 0) extraData.doctor = doctorRes.rows[0];

      // 🔹 Fetch clinic
      const clinicRes = await query("SELECT * FROM clinic WHERE user_id=$1", [user.id]);
      if (clinicRes.rows.length > 0) extraData.clinic = clinicRes.rows[0];

      // 🔹 Fetch appointments
      if (extraData.doctor?.id) {
        const appointmentRes = await query("SELECT * FROM appointment WHERE doctor_id=$1", [extraData.doctor.id]);
        extraData.appointments = appointmentRes.rows;
      }
    } else {
      // Patient
      const patientRes = await query("SELECT * FROM patient WHERE id=$1", [user.id]);
      if (patientRes.rows.length === 0) return NextResponse.json({ success: false, message: "Patient not found" }, { status: 404 });
      extraData.patient = patientRes.rows[0];

      const appointmentRes = await query("SELECT * FROM appointment WHERE patient_id=$1", [user.id]);
      extraData.appointments = appointmentRes.rows;
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    const res = NextResponse.json({
      success: true,
      message: "Login successful",
      user: { id: user.id, role: user.role, email: user.email, ...extraData },
      data: { token }
    });

    res.cookies.set("token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (err: any) {
    console.error("Login API error:", err);
    return NextResponse.json({ success: false, message: "Server error", error: err.message }, { status: 500 });
  }
}
