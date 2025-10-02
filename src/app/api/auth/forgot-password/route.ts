import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

// ✅ Helper function to send OTP email
async function sendOtpEmail(to: string, otp: string) {
  // Check if credentials exist
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    throw new Error("Email credentials not configured. Please set MAIL_USER and MAIL_PASS in .env.local");
  }

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  // Verify transporter configuration
  await transporter.verify();

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject: "Password Reset OTP - MediConnect",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Password Reset Request</h2>
        <p>You requested to reset your password. Use the OTP below:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #1f2937; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This OTP will expire in 10 minutes.</p>
        <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
}

// ✅ Step 1: Generate OTP
export async function PUT(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const userRes = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = userRes.rows[0];
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await query(
      `INSERT INTO otp_codes (user_id, otp_code, type, expires_at, is_used, created_at)
       VALUES ($1, $2, 'forgot-password', $3, false, NOW())`,
      [user.id, otpCode, expiresAt]
    );

    await sendOtpEmail(email, otpCode);

    return NextResponse.json({ success: true, message: "OTP sent to your email" }, { status: 200 });
  } catch (err: any) {
    console.error("Generate OTP error:", err);
    return NextResponse.json({ 
      success: false, 
      message: err.message || "Failed to send OTP", 
      error: err.message 
    }, { status: 500 });
  }
}

// ✅ Step 2: Verify OTP + Reset Password
export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const userRes = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = userRes.rows[0];
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Validate OTP
    const otpRes = await query(
      `SELECT * FROM otp_codes
       WHERE user_id = $1 AND otp_code = $2
         AND type = 'forgot-password'
         AND is_used = false
         AND expires_at > NOW()`,
      [user.id, otp]
    );

    const otpEntry = otpRes.rows[0];
    if (!otpEntry) {
      return NextResponse.json({ success: false, message: "Invalid or expired OTP" }, { status: 400 });
    }

    // Mark OTP as used
    await query(`UPDATE otp_codes SET is_used = true WHERE id = $1`, [otpEntry.id]);

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [hashedPassword, user.id]);

    // ✅ Fetch doctor/patient/clinic/appointments info after password reset
    let doctor = null;
    let patient = null;
    let clinic = null;
    let appointments: any[] = [];

    if (user.role === "doctor") {
      const doctorRes = await query(`SELECT * FROM doctor WHERE id = $1`, [user.id]);
      doctor = doctorRes.rows[0];

      const clinicRes = await query(`SELECT * FROM clinic WHERE doctor_id = $1`, [user.id]);
      clinic = clinicRes.rows[0] || null;

      const apptRes = await query(`SELECT * FROM appointment WHERE doctor_id = $1`, [user.id]);
      appointments = apptRes.rows;
    } else if (user.role === "patient") {
      const patientRes = await query(`SELECT * FROM patient WHERE id = $1`, [user.id]);
      patient = patientRes.rows[0];
    }

    // ✅ Return full user info
    return NextResponse.json({
      success: true,
      message: "Password reset successful ✅",
      user: {
        ...user,
        doctor,
        patient,
        clinic,
        appointments,
      },
    }, { status: 200 });

  } catch (err: any) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to reset password", 
      error: err.message 
    }, { status: 500 });
  }
}
