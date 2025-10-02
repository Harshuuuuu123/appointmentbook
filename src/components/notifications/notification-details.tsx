"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface NotificationDetailsProps {
  notificationId: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationDetails({ notificationId }: NotificationDetailsProps) {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const res = await fetch(`/api/notifications/${notificationId}`);
        const data = await res.json();
        if (data.success) setNotification(data.data);
        else setNotification(null);
      } catch (error) {
        console.error(error);
        setNotification(null);
      } finally {
        setLoading(false);
      }
    };
    fetchNotification();
  }, [notificationId]);

  const markAsRead = async () => {
    if (!notification) return;
    try {
      const res = await fetch(`/api/notifications/${notification.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      });
      const data = await res.json();
      if (data.success) setNotification({ ...notification, is_read: true });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!notification) return <div className="p-6">Notification not found</div>;

  return (
    <div className="p-6">
      <Link href="/dashboard/notifications" className="text-blue-600 mb-4 inline-block">← Back</Link>
      <h1 className="text-2xl font-bold mb-2">{notification.title}</h1>
      <p className="text-muted-foreground mb-4">{new Date(notification.created_at).toLocaleString()}</p>
      <div className="bg-card p-4 rounded border border-border">
        <p>{notification.message}</p>
      </div>
      {!notification.is_read && (
        <button onClick={markAsRead} className="bg-green-600 text-white px-4 py-2 rounded mt-4">
          Mark as Read
        </button>
      )}
    </div>
  );
}
