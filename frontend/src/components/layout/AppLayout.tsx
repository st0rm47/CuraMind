// src/components/layout/AppLayout.tsx
// Shell that wraps all authenticated pages: Sidebar + Topbar + content area.

import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { getStoredTheme, setStoredTheme } from "@/utils/storage";
import { getDoctorQueueApi } from "@/services/doctor.service";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";

export default function AppLayout() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<"dark" | "light">(getStoredTheme);
  const [pendingCount, setPendingCount] = useState(0);
  const [followupCount, setFollowupCount] = useState(0);

  // Apply theme class to <html>
  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("dark", theme === "dark");
    html.classList.toggle("light", theme === "light");
    setStoredTheme(theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // Doctors: fetch pending queue count + follow-up count for sidebar badges
  useEffect(() => {
    if (user?.role !== "doctor") return;

    getDoctorQueueApi("pending_review", 1, 1)
      .then((res) => setPendingCount(res.total))
      .catch(() => {});

    api
      .get<{ total: number }>("/doctor/followups", {
        params: { page: 1, limit: 1 },
      })
      .then((res) => setFollowupCount(res.data.total))
      .catch(() => {});
  }, [user]);

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <Sidebar pendingCount={pendingCount} followupCount={followupCount} />
      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
        <Topbar theme={theme} toggleTheme={toggleTheme} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
          <div className="md:hidden h-16" aria-hidden="true" />
        </main>
      </div>
    </div>
  );
}
