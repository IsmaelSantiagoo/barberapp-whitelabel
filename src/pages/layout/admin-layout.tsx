import { useEffect } from 'react'

import { Outlet, useNavigate } from 'react-router-dom'

import { AppHeader } from '@/components/custom/app-header'
import { AppSidebar } from '@/components/custom/app-sidebar'
import Loader from '@/components/custom/loader'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'
import { HeaderProvider } from '@/providers/HeaderProvider'

export default function AdminLayout() {
  const navigate = useNavigate()
  const { loading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/agendafy/auth/login')
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
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AppSidebar variant='inset' />
        <SidebarInset>
          <AppHeader />
          <div className='flex flex-1 flex-col'>
            <div className='@container/main flex flex-1 flex-col gap-2 p-6'>
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </HeaderProvider>
  )
}
