import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

// Helper to send OTP
async function sendOtpEmail(to: string, otp: string) {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    throw new Error("Email credentials not configured in .env.local");
  }

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject: "Password Reset OTP",
    html: `<div style="font-family: Arial; padding: 20px;">
             <h2>Password Reset Request</h2>
             <h1>${otp}</h1>
             <p>OTP expires in 10 minutes.</p>
           </div>`,
  });
}

// Step 1: Generate OTP
export async function PUT(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });

    const userRes = await query("SELECT * FROM users WHERE email=$1", [email]);
    const user = userRes.rows[0];
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await query(
      `INSERT INTO otp_codes (user_id, otp_code, type, expires_at, is_used, created_at)
       VALUES ($1, $2, 'forgot-password', $3, false, NOW())`,
      [user.id, otpCode, expiresAt]
    );

    await sendOtpEmail(email, otpCode);

    return NextResponse.json({ success: true, message: "OTP sent to your email" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to send OTP", error: err.message }, { status: 500 });
  }
}

// Step 2: Verify OTP & Reset Password
export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ success: false, message: "Email, OTP, and new password are required" }, { status: 400 });
    }

    const userRes = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = userRes.rows[0];
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    // Validate OTP
    const otpRes = await query(
      `SELECT * FROM otp_codes
       WHERE user_id=$1 AND otp_code=$2 AND type='forgot-password' AND is_used=false AND expires_at>NOW()`,
      [user.id, otp]
    );
    const otpEntry = otpRes.rows[0];
    if (!otpEntry) return NextResponse.json({ success: false, message: "Invalid or expired OTP" }, { status: 400 });

    // Mark OTP as used
    await query(`UPDATE otp_codes SET is_used=true WHERE id=$1`, [otpEntry.id]);

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await query(`UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2`, [hashedPassword, user.id]);

    // Fetch related data exactly like login API
    let extraData: any = {};

    if (user.role === "doctor") {
      const doctorRes = await query(`SELECT * FROM doctor WHERE user_id=$1`, [user.id]);
      if (doctorRes.rows.length > 0) extraData.doctor = doctorRes.rows[0];

      if (extraData.doctor?.clinic_id) {
        const clinicRes = await query(`SELECT * FROM clinic WHERE id=$1`, [extraData.doctor.clinic_id]);
        if (clinicRes.rows.length > 0) extraData.clinic = clinicRes.rows[0];
      }

      if (extraData.doctor?.id) {
        const appointmentRes = await query(`SELECT * FROM appointment WHERE doctor_id=$1`, [extraData.doctor.id]);
        extraData.appointments = appointmentRes.rows;
      }
    } else {
      // Patient
      if (user.patient_id) {
        const patientRes = await query(`SELECT * FROM patient WHERE id=$1`, [user.patient_id]);
        if (patientRes.rows.length > 0) extraData.patient = patientRes.rows[0];

        const appointmentRes = await query(`SELECT * FROM appointment WHERE patient_id=$1`, [user.patient_id]);
        extraData.appointments = appointmentRes.rows;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successful",
      user: { id: user.id, email: user.email, role: user.role, ...extraData },
    });
  } catch (err: any) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ success: false, message: "Server error", error: err.message }, { status: 500 });
  }
}
