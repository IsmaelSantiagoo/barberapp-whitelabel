import AppLayout from '../pages/layout'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import { detectAppMode } from '@/lib/detectAppMode'

import { AdminRoutesChildren } from './admin'
import { AuthRoute } from './auth'
import { ClientRoutesChildren } from './client'

const appMode = detectAppMode()
const isAdmin = appMode === 'admin'
const redirectPath = isAdmin ? '/admin/dashboard' : '/client/home'

const router = createBrowserRouter([
  // Auth route (unprotected)
  AuthRoute,

  // Admin routes - only available if appMode is admin
  ...(isAdmin
    ? [
        {
          path: '/admin',
          element: <AppLayout />,
          children: AdminRoutesChildren,
        },
      ]
    : []),

  // Client routes - only available if appMode is client
  ...(!isAdmin
    ? [
        {
          path: '/client',
          element: <AppLayout />,
          children: ClientRoutesChildren,
        },
      ]
    : []),

  // Root redirect
  {
    path: '/',
    element: <Navigate to={redirectPath} replace />,
  },

  // Catch-all
  {
    path: '*',
    element: <Navigate to={redirectPath} replace />,
  },
])

export default router
