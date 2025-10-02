import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, // 🔹 logged-in user id required
      fullName, specialty, qualification, yearsOfExperience,
      contactNumber, emailAddress, consultationFee, profileImage,
      bio, clinicId
    } = body;

    if (!userId || !fullName || !emailAddress || !contactNumber) {
      return NextResponse.json({ success: false, message: "UserId, Full Name, Email and Contact are required" }, { status: 400 });
    }

    const experienceValue = yearsOfExperience ? parseInt(yearsOfExperience) : null;
    const consultationFeeValue = consultationFee ? parseFloat(consultationFee) : null;
    const clinicIdValue = clinicId ? parseInt(clinicId) : null;

    const result = await query(
      `INSERT INTO doctor 
        (user_id, name, specialization, qualification, experience, phone, email, consultation_fee, profile_image, bio, clinic_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        userId,
        fullName,
        specialty || null,
        qualification || null,
        experienceValue,
        contactNumber,
        emailAddress,
        consultationFeeValue,
        profileImage || null,
        bio || null,
        clinicIdValue
      ]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Doctor API Error:", error.message || error);
    return NextResponse.json({ success: false, message: error.message || "Failed to save profile" }, { status: 500 });
  }
}
