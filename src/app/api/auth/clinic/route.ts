// app/api/auth/clinic/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, description, address, city, state, phone, facilities,
      userId, consultationFee, offerOnlineConsultation, videoConsultationLink
    } = body;

    if (!name || !address || !phone || !userId) {
      return NextResponse.json({ success: false, message: "Required fields are missing" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO clinic
        (name, description, address, city, state, phone, facilities, user_id, consultation_fee, offer_online_consultation, video_consultation_link, created_at, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),true)
       RETURNING *`,
      [
        name,
        description || null,
        address,
        city || null,
        state || null,
        phone,
        facilities && facilities.length > 0 ? facilities : null,
        userId,
        consultationFee ? parseFloat(consultationFee) : null,
        offerOnlineConsultation || false,
        videoConsultationLink || null
      ]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    console.error("Clinic creation error:", err.message || err);
    return NextResponse.json({ success: false, message: "Failed to save clinic profile" }, { status: 500 });
  }
}
