import ClientLogin from '@/pages/client/login'
import { Navigate, type RouteObject } from 'react-router'

export const ClientAuthRoutes: RouteObject = {
  path: 'auth',
  children: [
    {
      path: 'login',
      element: <ClientLogin />,
    },
    {
      path: '*',
      element: <Navigate to='/auth/login' replace />,
    },
  ],
}