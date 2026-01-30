import AppLayout from '../pages/layout'
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'

import { AdminRoutes } from './admin'
import { AuthRoute } from './auth'
import { ClientRoutes } from './client'

const appMode = import.meta.env.VITE_APP_MODE
const unprotectedRoutes: RouteObject[] = [AuthRoute]

const protectedRoutes: RouteObject[] = [appMode === 'admin' ? AdminRoutes : ClientRoutes]

const router = createBrowserRouter([
  ...unprotectedRoutes,
  {
    path: '/',
    children: [
      {
        path: '',
        element: (
          <Navigate to={appMode === 'admin' ? '/admin/dashboard' : '/client/home'} replace />
        ),
      },
      {
        path: appMode === 'admin' ? 'admin' : 'client',
        element: <AppLayout />,
        children: [...protectedRoutes],
      },
      {
        path: '*',
        element: (
          <Navigate to={appMode === 'admin' ? '/admin/dashboard' : '/client/home'} replace />
        ),
      },
    ],
  },
])

export default router
