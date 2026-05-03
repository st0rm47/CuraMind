import { useState, useEffect, useCallback } from 'react'
import { callApi } from '@/api/client'
import { useAuth } from '@/context/AuthContext'

export function useApi(path, { immediate = true, deps = [] } = {}) {
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const fetch = useCallback(async (overridePath) => {
    setLoading(true)
    setError(null)
    try {
      const result = await callApi(overridePath || path, {}, token)
      setData(result)
      return result
    } catch (e) {
      setError(e.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [path, token])

  useEffect(() => {
    if (immediate && token) fetch()
  }, [token, ...deps])

  return { data, loading, error, refetch: fetch, setData }
}