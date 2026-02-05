import { Navigate, type RouteObject } from 'react-router'

import ClientHome from '@/pages/client'
import ClientInfoBarbershop from '@/pages/client/barber-info'
import ClientMyAppointments from '@/pages/client/my-schedules'
import ClientSchedule from '@/pages/client/schedule'

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
      path: 'schedule',
      element: <ClientSchedule />,
    },
    {
      path: 'my-schedules',
      element: <ClientMyAppointments />,
    },
    {
      path: 'barber-info',
      element: <ClientInfoBarbershop />,
    },
    {
      path: '*',
      element: <Navigate to='/home' replace />,
    },
  ],
}
