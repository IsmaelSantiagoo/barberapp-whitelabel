import { useEffect } from 'react'

import { Outlet, useNavigate } from 'react-router-dom'

import Loader from '@/components/custom/loader'
import { useAuth } from '@/hooks/use-auth'
import { HeaderProvider } from '@/providers/HeaderProvider'

export default function ClientLayout() {
  const navigate = useNavigate()
  const { loading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth/login')
    }
  }, [loading, isAuthenticated, navigate])

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader showMessage={true} />
      </div>
    )
  }

  return (
    <HeaderProvider>
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <Outlet />
        </div>
      </div>
    </HeaderProvider>
  )
}
