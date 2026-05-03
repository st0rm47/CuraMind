// src/components/layout/AppLayout.tsx
// Shell that wraps all authenticated pages: Sidebar + Topbar + content area.

import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar  from './Topbar'
import { getStoredTheme, setStoredTheme } from '@/utils/storage'
import { getDoctorQueueApi } from '@/services/doctor.service'
import { useAuth } from '@/hooks/useAuth'

export default function AppLayout() {
  const { user } = useAuth()
  const [theme,        setTheme]        = useState<'dark'|'light'>(getStoredTheme)
  const [pendingCount, setPendingCount] = useState(0)

  // Apply theme class to <html>
  useEffect(() => {
    const html = document.documentElement
    html.classList.toggle('dark',  theme === 'dark')
    html.classList.toggle('light', theme === 'light')
    setStoredTheme(theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => t === 'dark' ? 'light' : 'dark')

  // Doctors: fetch pending count for sidebar badge
  useEffect(() => {
    if (user?.role !== 'doctor') return
    getDoctorQueueApi('pending', 1, 1)
      .then((res) => setPendingCount(res.total))
      .catch(() => {})
  }, [user])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar pendingCount={pendingCount} />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Topbar theme={theme} toggleTheme={toggleTheme} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
