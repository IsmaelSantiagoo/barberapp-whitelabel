import { Navigate, type RouteObject } from 'react-router'

import ClientHome from '@/pages/client'

export const ClientRoutes: RouteObject = {
  path: '',
  children: [
    {
      path: '',
      element: <Navigate to='/client/home' replace />,
    },
    {
      path: 'home',
      element: <ClientHome />,
    },
    {
      path: '*',
      element: <Navigate to='/client/home' replace />,
    },
  ],
}
