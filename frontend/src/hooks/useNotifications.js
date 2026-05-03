import { useState, useEffect, useCallback } from 'react'
import { callApi } from '@/api/client'
import { useAuth } from '@/context/AuthContext'

export function useNotifications() {
  const { token } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await callApi('/notifications', {}, token)
      const list = Array.isArray(data) ? data : []
      setNotifications(list)
      setUnreadCount(list.filter(n => !n.read).length)
    } finally {
      setLoading(false)
    }
  }, [token])

  const markRead = useCallback(async (notifId) => {
    await callApi(`/notifications/${notifId}/read`, { method: 'PATCH' }, token).catch(() => {})
    setNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [token])

  const markAllRead = useCallback(async () => {
    await callApi('/notifications/read-all', { method: 'PATCH' }, token).catch(() => {})
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [token])

  useEffect(() => {
    fetchNotifications()
  }, [token])

  return { notifications, unreadCount, loading, fetchNotifications, markRead, markAllRead }
}