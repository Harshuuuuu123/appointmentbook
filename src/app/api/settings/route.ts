// src/app/api/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// -------------------- GET handler --------------------
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("user_id");
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const res = await query("SELECT * FROM settings WHERE user_id = $1", [userId]);

    if (res.rows.length === 0) {
      // Return default settings if none exist
      return NextResponse.json(
        {
          success: true,
          message: "Settings not found, returning default",
          data: {
            profile: {},
            clinic: {},
            notifications: {},
            security: {},
            schedule: {},
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Settings retrieved successfully", data: res.rows[0] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET settings error:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve settings", error: error.message },
      { status: 500 }
    );
  }
}

// -------------------- POST handler --------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, profile, clinic, notifications, security, schedule } = body;

    if (!user_id) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if settings exist
    const existing = await query("SELECT * FROM settings WHERE user_id = $1", [user_id]);

    if (existing.rows.length === 0) {
      // Insert new settings
      await query(
        `INSERT INTO settings (user_id, profile, clinic, notifications, security, schedule)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          user_id,
          JSON.stringify(profile),
          JSON.stringify(clinic),
          JSON.stringify(notifications),
          JSON.stringify(security),
          JSON.stringify(schedule),
        ]
      );
    } else {
      // Update existing settings
      await query(
        `UPDATE settings
         SET profile = $1, clinic = $2, notifications = $3, security = $4, schedule = $5
         WHERE user_id = $6`,
        [
          JSON.stringify(profile),
          JSON.stringify(clinic),
          JSON.stringify(notifications),
          JSON.stringify(security),
          JSON.stringify(schedule),
          user_id,
        ]
      );
    }

    return NextResponse.json(
      { success: true, message: "Settings saved successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST settings error:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to save settings", error: error.message },
      { status: 500 }
    );
  }
}
