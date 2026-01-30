import { useEffect } from 'react'

import { Outlet, useNavigate } from 'react-router-dom'

import { useAuth } from '@/hooks/use-auth'

export default function AppLayout() {
  const navigate = useNavigate()
  const { loading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth/login')
    }
  }, [loading, isAuthenticated, navigate])

  return <Outlet />
}
