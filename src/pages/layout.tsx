import { useEffect } from 'react'

import { Outlet, useNavigate } from 'react-router-dom'

import { useAdminAuth } from '@/hooks/use-admin-auth'

export default function AppLayout() {
  const navigate = useNavigate()
  const { loading, isAuthenticated } = useAdminAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth/login')
    }
  }, [loading, isAuthenticated, navigate])

  return <Outlet />
}
