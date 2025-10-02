import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// ---------------------- GET: List notifications ----------------------
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const recipientId = url.searchParams.get("recipient_id"); // filter by recipient
    const recipientType = url.searchParams.get("recipient_type") || "doctor"; // default to doctor
    const searchQuery = url.searchParams.get("q") || "";

    let sql = "SELECT * FROM notification";
    const values: any[] = [];

    if (recipientId) {
      sql += " WHERE recipient_id = $1 AND recipient_type = $2";
      values.push(Number(recipientId), recipientType);
    }

    if (searchQuery) {
      if (values.length) {
        sql += " AND (title ILIKE $3 OR message ILIKE $3)";
      } else {
        sql += " WHERE title ILIKE $1 OR message ILIKE $1";
        values.push(`%${searchQuery}%`);
      }
    }

    sql += " ORDER BY id DESC";

    const res = await query(sql, values);

    return NextResponse.json({
      success: true,
      data: res.rows,
      message: searchQuery
        ? "Notification search results"
        : "Notifications retrieved successfully",
    });
  } catch (error: any) {
    console.error("GET notifications error:", error.message);
    return NextResponse.json({
      success: false,
      message: "Failed to retrieve notifications",
      error: error.message,
    });
  }
}

// ---------------------- POST: Create a new notification ----------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, message, recipient_id, recipient_type } = body;

    if (!title || !message || !recipient_id) {
      return NextResponse.json(
        { success: false, message: "Title, message, and recipient_id are required" },
        { status: 400 }
      );
    }

    const insertRes = await query(
      `INSERT INTO notification (title, message, recipient_id, recipient_type, is_read, created_at, updated_at)
       VALUES ($1, $2, $3, $4, false, NOW(), NOW())
       RETURNING *`,
      [title, message, recipient_id, recipient_type || "doctor"]
    );

    return NextResponse.json({
      success: true,
      data: insertRes.rows[0],
      message: "Notification created successfully",
    });
  } catch (error: any) {
    console.error("POST notification error:", error.message);
    return NextResponse.json({
      success: false,
      message: "Failed to create notification",
      error: error.message,
    });
  }
}

// ---------------------- PUT: Mark notification as read ----------------------
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Notification id is required" },
        { status: 400 }
      );
    }

    const res = await query(
      `UPDATE notification SET is_read = true, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    if (!res.rows.length) {
      return NextResponse.json({
        success: false,
        message: "Notification not found",
      });
    }

    return NextResponse.json({
      success: true,
      data: res.rows[0],
      message: "Notification marked as read",
    });
  } catch (error: any) {
    console.error("PUT notification error:", error.message);
    return NextResponse.json({
      success: false,
      message: "Failed to update notification",
      error: error.message,
    });
  }
}
