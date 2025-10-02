import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET: List all reports
export async function GET(request: NextRequest) {
  try {
    const res = await query(
      `SELECT id, name, type, size, download_url, created_at 
       FROM reports 
       ORDER BY created_at DESC`
    );

    return NextResponse.json({
      status: 200,
      success: true,
      data: res.rows,
      message: "Reports retrieved successfully",
    });
  } catch (error: any) {
    console.error("GET reports error:", error.message);
    return NextResponse.json({
      status: 500,
      success: false,
      message: "Failed to retrieve reports",
      error: error.message,
    });
  }
}
