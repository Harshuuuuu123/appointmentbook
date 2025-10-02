import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";

// Reset pass
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    // Find user
    const userRes = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = userRes.rows[0];
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Check OTP
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

    await query(`UPDATE otp_codes SET is_used = true WHERE id = $1`, [otpEntry.id]);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [hashedPassword, user.id]);

    return NextResponse.json({ success: true, message: "Password reset successful ✅" }, { status: 200 });

  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ success: false, message: "Failed to reset password", error: error.message }, { status: 500 });
  }
}

// Initiate forgot pass
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const userRes = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = userRes.rows[0];
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Generate OTP 
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    await query(
      `INSERT INTO otp_codes (user_id, otp_code, type, expires_at, is_used, created_at)
       VALUES ($1, $2, 'forgot-password', $3, false, NOW())`,
      [user.id, otpCode, expiresAt]
    );

    //  send OTP 

    return NextResponse.json({ success: true, message: "OTP generated successfully", data: { otp: otpCode } }, { status: 200 });

  } catch (error: any) {
    console.error("Generate OTP error:", error);
    return NextResponse.json({ success: false, message: "Failed to generate OTP", error: error.message }, { status: 500 });
  }
}
