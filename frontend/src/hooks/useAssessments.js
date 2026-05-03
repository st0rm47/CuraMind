import { useState, useEffect, useCallback } from 'react'
import { callApi } from '@/services/api'
import { useAuth } from '@/context/AuthContext'

export function useAssessments() {
  const { token } = useAuth()
  const [assessments, setAssessments] = useState([])
  const [latest, setLatest] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchAssessments = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await callApi('/patient/assessments', {}, token)
      const items = data?.items || []
      setAssessments(items)
      if (items.length > 0) setLatest(items[0])
    } finally {
      setLoading(false)
    }
  }, [token])

  const addAssessment = useCallback((a) => {
    setAssessments(prev => [a, ...prev])
    setLatest(a)
  }, [])

  useEffect(() => {
    fetchAssessments()
  }, [token])

  return { assessments, latest, loading, fetchAssessments, addAssessment }
}