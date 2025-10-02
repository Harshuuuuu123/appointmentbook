import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp, type = "signup" } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Find user
    const userRes = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = userRes.rows[0];
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Find valid OTP
    const otpRes = await query(
      `SELECT * FROM otp_codes 
       WHERE user_id = $1 AND otp_code = $2 AND type = $3 AND is_used = false AND expires_at > NOW()`,
      [user.id, otp, type]
    );

    const otpEntry = otpRes.rows[0];
    if (!otpEntry) {
      return NextResponse.json({ success: false, message: "Invalid or expired OTP" }, { status: 400 });
    }

    await query(`UPDATE otp_codes SET is_used = true WHERE id = $1`, [otpEntry.id]);

    // For signup, mark user verified
    if (type === "signup") {
      await query(`UPDATE users SET is_verified = true WHERE id = $1`, [user.id]);
    }

    return NextResponse.json({
      success: true,
      data: { email, verified: true, type },
      message: "OTP verified successfully",
    });
  } catch (error: any) {
    console.error("Verify OTP error:", error.message);
    return NextResponse.json({ success: false, message: "Failed to verify OTP" }, { status: 500 });
  }
}
