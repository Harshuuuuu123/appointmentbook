"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationHistory() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) setNotifications(data.data);
      else setNotifications([]);
    } catch (error) {
      console.error(error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const markAsRead = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      });
      const data = await res.json();
      if (data.success) fetchNotifications();
      else alert(data.message);
    } catch (error) {
      console.error(error);
      alert("Failed to mark as read");
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!notifications.length) return <div className="text-center py-12">No notifications found</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-primary mb-4">Notification History</h1>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className={`flex items-start gap-2 p-4 border rounded ${notification.is_read ? "" : "border-primary"}`}>
            <input type="checkbox" checked={selectedIds.includes(notification.id)} onChange={() => toggleSelect(notification.id)} />
            <div className="flex-1">
              <Link href={`/dashboard/notifications/${notification.id}`}>
                <h3 className="font-semibold">{notification.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
              </Link>
            </div>
            {!notification.is_read && (
              <button onClick={() => markAsRead(notification.id)} className="bg-green-600 text-white px-2 py-1 rounded text-sm">
                Mark Read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
