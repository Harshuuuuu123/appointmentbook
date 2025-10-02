import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email, type = "signup" } = await req.json();
    if (!email) return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });

    // Check if user exists
    const userRes = await query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (userRes.rows.length === 0) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const userId = userRes.rows[0].id;

    // Generate 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Store OTP in DB with expiry 5 minutes
    await query(
      `INSERT INTO otp_codes (user_id, otp_code, type, is_used, expires_at)
       VALUES ($1, $2, $3, false, NOW() + interval '5 minutes')`,
      [userId, otpCode, type]
    );

    // Send OTP via Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Your App" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otpCode}. It expires in 5 minutes.`,
    });

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ success: false, message: "Failed to send OTP" }, { status: 500 });
  }
}
