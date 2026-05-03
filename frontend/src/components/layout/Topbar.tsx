// src/components/layout/Topbar.tsx
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PAGE_TITLES } from "@/utils/constants";
import NotificationPanel from "@/components/common/NotificationPanel";
import { getNotifCountApi } from "@/services/patient.service";
import { useNavigate } from "react-router-dom";

// type Theme = 'dark' | 'light'

interface TopbarProps {}
export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const title = PAGE_TITLES[location.pathname] ?? "CuraMind";

  // Fetch unread count on mount
  useEffect(() => {
    getNotifCountApi()
      .then((res) => setUnread(res.unread_count))
      .catch(() => {});
  }, [location.pathname]);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  const handleNavigate = (page: string) => {
    setNotifOpen(false);
    setUnread(0);
    // Map action_page string to a real route
    const routeMap: Record<string, string> = {
      feedback: "/patient/notes",
      followup: "/patient/",
      "doc-review": "/doctor/review",
    };
    navigate(routeMap[page] ?? "/");
  };

  return (
    <header className="sticky top-0 z-50 h-[57px] bg-gray-950 border-b border-gray-800 flex items-center px-6 gap-3 shrink-0 sticky top-0 z-40">
      <h1 className="font-bold text-[15px] flex-1 tracking-tight">{title}</h1>

      {/* Status dot */}
      <div className="flex items-center gap-1.5 text-[10px] text-teal-400 font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse-dot" />
        AI Online
      </div>

      {/* Theme toggle
      <button
        onClick={toggleTheme}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-800 border border-gray-700
                   rounded-lg text-[11px] text-gray-400 hover:border-brand-500 hover:text-brand-400
                   transition-colors duration-150"
      >
        {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
      </button> */}

      {/* Notification bell */}
      <div ref={panelRef} className="relative">
        <button
          onClick={() => setNotifOpen((v) => !v)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-800 border border-gray-700
             rounded-lg text-[11px] text-gray-400 hover:border-brand-500 hover:text-brand-400
             transition-colors duration-150 relative"
        >
          🔔 Alerts{" "}
          {unread > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded-full bg-rose-500 text-white font-bold">
              {unread}
            </span>
          )}
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500 border-2 border-gray-900" />
          )}
        </button>

        {notifOpen && (
          <NotificationPanel
            onNavigate={handleNavigate}
            onClose={() => setNotifOpen(false)}
            onReadAll={() => setUnread(0)}
          />
        )}
      </div>
    </header>
  );
}
