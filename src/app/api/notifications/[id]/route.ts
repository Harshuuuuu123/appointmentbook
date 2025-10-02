import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/notifications/:id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const notificationId = Number(params.id);
    const res = await query("SELECT * FROM notification WHERE id = $1", [notificationId]);
    const notification = res.rows[0];

    if (!notification) {
      return NextResponse.json({ success: false, message: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: notification,
      message: "Notification retrieved successfully",
    });
  } catch (error: any) {
    console.error("GET notification error:", error.message);
    return NextResponse.json({ success: false, message: "Failed to retrieve notification" }, { status: 500 });
  }
}

// PUT /api/notifications/:id
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const notificationId = Number(params.id);
    const body = await request.json();

    const fields = Object.keys(body);
    if (fields.length === 0) {
      return NextResponse.json({ success: false, message: "No fields to update" }, { status: 400 });
    }

    const setClause = fields.map((f, idx) => `${f} = $${idx + 1}`).join(", ");
    const values = fields.map((f) => body[f]);
    values.push(notificationId);

    const res = await query(
      `UPDATE notification SET ${setClause}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values
    );

    const updatedNotification = res.rows[0];
    if (!updatedNotification) {
      return NextResponse.json({ success: false, message: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedNotification,
      message: "Notification updated successfully",
    });
  } catch (error: any) {
    console.error("PUT notification error:", error.message);
    return NextResponse.json({ success: false, message: "Failed to update notification" }, { status: 500 });
  }
}

// DELETE /api/notifications/:id
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const notificationId = Number(params.id);
    const res = await query("DELETE FROM notification WHERE id = $1 RETURNING *", [notificationId]);
    const deleted = res.rows[0];

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE notification error:", error.message);
    return NextResponse.json({ success: false, message: "Failed to delete notification" }, { status: 500 });
  }
}
