// src/components/common/NotificationPanel.tsx
import { useState, useEffect } from "react";
import clsx from "clsx";
import { formatDateTime, formatRelative, formatRelativeAsia } from "@/utils/formatDate";
import type { Notification } from "@/types/doctor";
import {
  getNotificationsApi,
  markNotifReadApi,
  markAllNotifReadApi,
} from "@/services/patient.service";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

interface NotificationPanelProps {
  onNavigate: (page: string) => void;
  onClose: () => void;
  onReadAll: () => void;
}

const TYPE_META: Record<string, { icon: string; bg: string }> = {
  doctor_review: { icon: "🩺", bg: "bg-teal-500/15" },
  followup_reminder: { icon: "🔔", bg: "bg-yellow-500/15" },
  new_assessment: { icon: "📋", bg: "bg-brand-500/15" },
  followup_submitted: { icon: "📬", bg: "bg-brand-500/15" },
  system: { icon: "⚡", bg: "bg-rose-500/15" },
};

export default function NotificationPanel({
  onNavigate,
  onClose,
  onReadAll,
}: NotificationPanelProps) {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotificationsApi()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = items.filter((n) => !n.is_read).length;

  const handleClick = async (n: Notification) => {
    if (!n.is_read) {
      await markNotifReadApi(n.id).catch(() => {});
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)),
      );
    }
    if (n.action_page) onNavigate(n.action_page);
    else onClose();
  };

  const handleMarkAll = async () => {
    await markAllNotifReadApi().catch(() => {});
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    onReadAll();
  };

  return (
    <div
      className="absolute right-0 top-12 w-80 bg-gray-900 border border-gray-700
                 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,.55)] z-50
                 animate-fade-in overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div>
          <h4 className="font-bold text-[14px]">Notifications</h4>
          {unreadCount > 0 && (
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAll}>
            Mark all read
          </Button>
        )}
      </div>

      {/* Body */}
      <div className="max-h-96 overflow-y-auto">
        {loading && (
          <div className="flex justify-center py-8">
            <Spinner size="sm" />
          </div>
        )}
        {!loading && items.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-10">
            🔔 No notifications yet
          </p>
        )}
        {items.map((n) => {
          const meta = TYPE_META[n.type] ?? {
            icon: "📌",
            bg: "bg-gray-500/15",
          };
          return (
            <div
              key={n.id}
              className={clsx(
                "flex gap-3 px-4 py-3 border-b border-gray-800 cursor-pointer",
                "transition-colors duration-150 hover:bg-gray-800/70",
                !n.is_read && "bg-brand-500/5",
              )}
              onClick={() => void handleClick(n)}
            >
              <div
                className={clsx(
                  "w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0",
                  meta.bg,
                )}
              >
                {meta.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-gray-200 mb-0.5">
                  {n.title}
                </p>
                <p className="text-[11px] text-gray-400 leading-snug line-clamp-2">
                  {n.message}
                </p>
                <p className="text-[10px] text-gray-600 font-mono mt-1">
                  {formatRelativeAsia(n.timestamp)}
                </p>
              </div>
              {!n.is_read && (
                <div className="w-2 h-2 rounded-full bg-brand-500 mt-1 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
