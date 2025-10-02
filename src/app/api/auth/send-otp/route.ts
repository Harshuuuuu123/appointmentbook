import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import nodemailer from "nodemailer";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Email sending function
async function sendEmailOTP(to: string, otp: string) {
  const transporter = nodemailer.createTransport({
    host: "smtp.example.com", // Replace with your SMTP
    port: 587,
    auth: { user: "your_email@example.com", pass: "your_password" },
  });

  await transporter.sendMail({
    from: '"YourApp" <no-reply@yourapp.com>',
    to,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email, type = "forgot-password" } = await request.json();

    if (!email) return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });

    // Find user
    const userRes = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = userRes.rows[0];
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const otp = generateOTP();

    // Save OTP in DB
    await query(
      `INSERT INTO otp_codes (user_id, otp_code, type, is_used, expires_at, created_at)
       VALUES ($1, $2, $3, false, NOW() + interval '10 minutes', NOW())`,
      [user.id, otp, type]
    );

    // Send OTP via email
    await sendEmailOTP(email, otp);

    return NextResponse.json({ success: true, message: "OTP sent to email successfully" }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to send OTP" }, { status: 500 });
  }
}
