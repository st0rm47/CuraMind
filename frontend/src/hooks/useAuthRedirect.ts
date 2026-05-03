import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { clearSession } from "@/utils/storage"

export function useAuthRedirect(statusCode?: number) {
  const navigate = useNavigate()

  useEffect(() => {
    if (statusCode === 401) {
      clearSession()
      navigate("/login")
    }
  }, [statusCode, navigate])
}