import { Navigate, type RouteObject } from 'react-router'

import ClientHome from '@/pages/client'
import ClientAgendar from '@/pages/client/agendar'
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
      element: <ClientAgendar />,
    },
    {
      path: 'meus-agendamentos',
      element: <ClientMyAppointments />,
    },
    {
      path: '*',
      element: <Navigate to='/home' replace />,
    },
  ],
}
