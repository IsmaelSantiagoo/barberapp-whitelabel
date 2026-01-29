import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'

import AppLayout from '../pages/layout'
import { AdminAuthRoutes } from './admin'
import { ClientAuthRoutes } from './client'

const unprotectedRoutes: RouteObject[] = [AdminAuthRoutes, ClientAuthRoutes]

const protectedRoutes: RouteObject[] = []

const router = createBrowserRouter([
  ...unprotectedRoutes,
  {
    path: '/',
    children: [
      {
        path: '',
        element: <Navigate to='/pages' replace />,
      },
      {
        path: 'pages',
        element: <AppLayout />,
        children: [
          ...protectedRoutes,
        ],
      },
      {
        path: '*',
        element: <Navigate to='/pages' replace />,
      },
    ],
  },
])

export default router