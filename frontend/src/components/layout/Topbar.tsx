// src/components/layout/Topbar.tsx
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PAGE_TITLES } from "@/utils/constants";
import NotificationPanel from "@/components/common/NotificationPanel";
import { getNotifCountApi } from "@/services/patient.service";
import { APP_NAME } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuth";

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const title = PAGE_TITLES[location.pathname] ?? "CuraMind";

  useEffect(() => {
    getNotifCountApi()
      .then((res) => setUnread(res.unread_count))
      .catch(() => {});
  }, [location.pathname]);

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
    const routeMap: Record<string, string> = {
      feedback: "/patient/notes",
      followup: "/patient/",
      "doc-review": "/doctor/review",
    };
    navigate(routeMap[page] ?? "/");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 h-14 bg-gray-950 border-b border-gray-800 flex items-center px-3 sm:px-6 gap-2 sm:gap-3 shrink-0">
      {/* Mobile: brand mark (only visible on mobile where sidebar is hidden) */}
      <button
        onClick={() => navigate("/")}
        className="md:hidden flex items-center gap-2 mr-1 shrink-0"
        aria-label="Home"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
          style={{ background: "linear-gradient(135deg,#4da3ff,#00d4a8)" }}
        >
          🧬
        </div>
      </button>

      {/* Page title — truncate on small screens */}
      <h1 className="font-bold text-[14px] sm:text-[15px] flex-1 tracking-tight truncate min-w-0">
        {title}
      </h1>

      {/* Status dot — hide label on very small screens */}
      <div className="flex items-center gap-1.5 text-[10px] text-teal-400 font-mono shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse-dot" />
        <span className="hidden xs:inline">AI Online</span>
      </div>

      {/* Notification bell */}
      <div ref={panelRef} className="relative shrink-0">
        <button
          onClick={() => setNotifOpen((v) => !v)}
          aria-label={`Alerts${unread > 0 ? `, ${unread} unread` : ""}`}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 bg-gray-800 border border-gray-700
             rounded-lg text-[11px] text-gray-400 hover:border-brand-500 hover:text-brand-400
             transition-colors duration-150 relative"
        >
          {/* Show icon always; show "Alerts" text on sm+ */}
          <span>🔔</span>
          <span className="hidden sm:inline">Alerts</span>
          {unread > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-rose-500 text-white font-bold leading-none">
              {unread}
            </span>
          )}
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500 border-2 border-gray-900 sm:hidden" />
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

      {/* Mobile: user avatar + logout (desktop handles this in the sidebar footer) */}
      <div className="md:hidden flex items-center gap-2 shrink-0">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
          style={{ background: "linear-gradient(135deg,#4da3ff,#00d4a8)" }}
          title={user?.name}
        >
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          className="text-gray-500 hover:text-red-400 transition-colors text-base leading-none pl-1"
        >
          ⏻
        </button>
      </div>
    </header>
  );
}