import type { ReactNode } from 'react'

import { Navigate } from 'react-router-dom'

import Loader from '@/components/custom/loader'
import { useAuth } from '@/hooks/use-auth'

interface AdminGuardProps {
  children: ReactNode
}

/**
 * Protege rotas /admin — somente roles "admin" e "owner" podem acessar.
 * Usuários com role "user" são redirecionados para /client/home.
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { loading, isAuthenticated, userRole } = useAuth()

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader showMessage={true} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to='/auth/login' replace />
  }

  const adminRoles = ['admin', 'owner']
  if (!userRole || !adminRoles.includes(userRole.toLowerCase())) {
    return <Navigate to='/client/home' replace />
  }

  return <>{children}</>
}
