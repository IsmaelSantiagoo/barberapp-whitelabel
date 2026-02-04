import { Navigate, type RouteObject } from 'react-router'

import ClientHome from '@/pages/client'
import ClientSchedule from '@/pages/client/agendar'
import ClientInfoBarbershop from '@/pages/client/info-barbearia'
import ClientMyAppointments from '@/pages/client/meus-agendamentos'

export const ClientRoutes: RouteObject = {
  path: '',
  children: [
    {
      path: '',
      element: <Navigate to='/home' replace />,
    },
    {
      path: 'home',
      element: <ClientHome />,
    },
    {
      path: 'agendar',
      element: <ClientSchedule />,
    },
    {
      path: 'meus-agendamentos',
      element: <ClientMyAppointments />,
    },
    {
      path: 'info-barbearia',
      element: <ClientInfoBarbershop />,
    },
    {
      path: '*',
      element: <Navigate to='/home' replace />,
    },
  ],
}
